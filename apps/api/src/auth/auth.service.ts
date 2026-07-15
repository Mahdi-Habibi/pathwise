import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponse, AuthTokens, AuthUser, LearnerState } from '@pathwise/shared';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { addDurationToDate, parseExpiresInSeconds } from './auth.utils';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse & { refreshToken: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        bootcampProfile: {
          create: {
            rank: 12,
            points: 340,
          },
        },
      },
    });

    await this.emailService.sendWelcome({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return this.issueAuthResponse(this.toAuthUser(user));
  }

  async login(dto: LoginDto): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueAuthResponse(this.toAuthUser(user));
  }

  async refresh(
    user: AuthUser,
    refreshToken: string,
  ): Promise<AuthResponse & { refreshToken: string }> {
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: user.id, token: refreshToken },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueAuthResponse(user);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
      return;
    }

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async validateUser(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user ? this.toAuthUser(user) : null;
  }

  async validateRefreshToken(
    userId: string,
    tokenId: string,
    refreshToken: string,
  ): Promise<AuthUser | null> {
    const stored = await this.prisma.refreshToken.findFirst({
      where: { id: tokenId, userId, token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return null;
    }

    return this.toAuthUser(stored.user);
  }

  async getLearnerState(userId: string): Promise<LearnerState> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const [roadmaps, readinessTests, entitlements, enrollments, readinessPayment] =
      await Promise.all([
        this.prisma.roadmap.findMany({
          where: { userId },
          select: { enrolled: true },
        }),
        this.prisma.readinessTest.findMany({
          where: { userId },
          select: { id: true },
        }),
        this.prisma.entitlement.findMany({ where: { userId } }),
        this.prisma.enrollment.findMany({
          where: { userId },
          include: { course: { select: { slug: true } } },
        }),
        this.prisma.payment.findFirst({
          where: {
            userId,
            productType: 'READINESS_TEST',
            status: 'COMPLETED',
          },
        }),
      ]);

    const hasRoadmap = roadmaps.length > 0;
    const roadmapEnrolled = roadmaps.some((roadmap) => roadmap.enrolled);
    const readinessPaid =
      readinessPayment !== null ||
      entitlements.some(
        (entitlement) =>
          entitlement.resourceType === 'readiness' && entitlement.resourceId === 'test',
      );

    return {
      user: this.toAuthUser(user),
      hasRoadmap,
      roadmapEnrolled,
      readinessPaid,
      testCompleted: readinessTests.length > 0,
      entitlements: entitlements.map(
        (entitlement) => `${entitlement.resourceType}:${entitlement.resourceId}`,
      ),
      enrollments: enrollments.map((enrollment) => enrollment.course.slug),
    };
  }

  private async issueAuthResponse(
    user: AuthUser,
  ): Promise<AuthResponse & { refreshToken: string }> {
    const tokens = await this.createTokens(user);
    return {
      user,
      ...tokens,
    };
  }

  private async createTokens(user: AuthUser): Promise<AuthTokens & { refreshToken: string }> {
    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const refreshRecord = await this.prisma.refreshToken.create({
      data: {
        token: randomBytes(48).toString('hex'),
        userId: user.id,
        expiresAt: addDurationToDate(refreshExpiresIn),
      },
    });

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: parseExpiresInSeconds(accessExpiresIn),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, tokenId: refreshRecord.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: parseExpiresInSeconds(refreshExpiresIn),
      },
    );

    await this.prisma.refreshToken.update({
      where: { id: refreshRecord.id },
      data: { token: refreshToken },
    });

    return {
      accessToken,
      expiresIn: parseExpiresInSeconds(accessExpiresIn),
      refreshToken,
    };
  }

  private toAuthUser(user: {
    id: string;
    name: string;
    email: string;
    role: 'LEARNER' | 'ADMIN';
  }): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
