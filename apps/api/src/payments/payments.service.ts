import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CheckoutDto, PaymentResponse, RoadmapResponse } from '@pathwise/shared';
import { PRODUCT_PRICES } from '@pathwise/shared';
import type Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async createCheckout(userId: string, dto: CheckoutDto): Promise<PaymentResponse> {
    const amountCents = await this.resolveAmountCents(dto);
    const productName = await this.resolveProductName(dto);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        productType: dto.productType,
        productRef: dto.productRef ?? null,
        amountCents,
        status: 'PENDING',
      },
    });

    let checkoutUrl: string | undefined;

    if (this.stripeService.isConfigured()) {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
      const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

      const session = await this.stripeService.createSession(
        payment.id,
        amountCents,
        productName,
        user.email,
        `${appUrl}/checkout/success?payment_id=${payment.id}`,
        `${appUrl}/checkout/cancel?payment_id=${payment.id}`,
      );

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { stripeId: session.id },
      });

      checkoutUrl = session.url;
    }

    return this.toResponse(payment, checkoutUrl);
  }

  async confirmPayment(userId: string, paymentId: string): Promise<PaymentResponse> {
    if (this.stripeService.isConfigured()) {
      throw new BadRequestException(
        'Payment confirmation via API is only available in development without Stripe',
      );
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment || payment.userId !== userId) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status === 'COMPLETED') {
      return this.toResponse(payment);
    }

    const completed = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' },
    });

    await this.grantEntitlements(completed);
    await this.emailService.sendPaymentReceipt(
      {
        id: payment.user.id,
        name: payment.user.name,
        email: payment.user.email,
      },
      completed,
    );

    return this.toResponse(completed);
  }

  async handleStripeWebhook(
    rawBody: Buffer,
    signature: string | string[] | undefined,
  ): Promise<{ received: true }> {
    if (!signature || Array.isArray(signature)) {
      throw new BadRequestException('Missing Stripe signature');
    }

    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    if (event.type === 'checkout.session.completed') {
      await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    return { received: true };
  }

  async getMyPayments(userId: string): Promise<PaymentResponse[]> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => this.toResponse(payment));
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) {
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment || payment.status === 'COMPLETED') {
      return;
    }

    const completed = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        stripeId: session.id,
      },
    });

    await this.grantEntitlements(completed);
    await this.emailService.sendPaymentReceipt(
      {
        id: payment.user.id,
        name: payment.user.name,
        email: payment.user.email,
      },
      completed,
    );
  }

  private async resolveAmountCents(dto: CheckoutDto): Promise<number> {
    if (dto.productType === 'READINESS_TEST') {
      return PRODUCT_PRICES.READINESS_TEST;
    }

    if (dto.productType === 'COURSE') {
      if (!dto.productRef) {
        throw new BadRequestException('productRef is required for COURSE checkout');
      }
      return PRODUCT_PRICES.COURSE;
    }

    if (dto.productType === 'ROADMAP_BUNDLE') {
      if (!dto.productRef) {
        throw new BadRequestException(
          'productRef (roadmap id) is required for ROADMAP_BUNDLE checkout',
        );
      }

      const roadmap = await this.prisma.roadmap.findUnique({
        where: { id: dto.productRef },
      });
      if (!roadmap) {
        throw new NotFoundException(`Roadmap ${dto.productRef} not found`);
      }

      const pricing = JSON.parse(roadmap.pricing) as RoadmapResponse['pricing'];
      return pricing.discounted * 100;
    }

    throw new BadRequestException(`Unsupported product type: ${dto.productType}`);
  }

  private async resolveProductName(dto: CheckoutDto): Promise<string> {
    switch (dto.productType) {
      case 'READINESS_TEST':
        return 'Readiness Assessment';
      case 'ROADMAP_BUNDLE':
        return 'Roadmap Bundle';
      case 'COURSE': {
        if (!dto.productRef) {
          return 'Course';
        }
        const course = await this.prisma.course.findFirst({
          where: {
            OR: [{ id: dto.productRef }, { slug: dto.productRef }],
          },
        });
        return course?.title ?? 'Course';
      }
      default:
        return dto.productType;
    }
  }

  private async grantEntitlements(payment: {
    id: string;
    userId: string;
    productType: 'READINESS_TEST' | 'ROADMAP_BUNDLE' | 'COURSE';
    productRef: string | null;
  }): Promise<void> {
    switch (payment.productType) {
      case 'READINESS_TEST':
        await this.prisma.entitlement.upsert({
          where: {
            userId_resourceType_resourceId: {
              userId: payment.userId,
              resourceType: 'readiness',
              resourceId: 'test',
            },
          },
          create: {
            userId: payment.userId,
            resourceType: 'readiness',
            resourceId: 'test',
            source: 'PURCHASE',
          },
          update: { source: 'PURCHASE' },
        });
        break;

      case 'ROADMAP_BUNDLE':
        if (!payment.productRef) {
          throw new BadRequestException('Roadmap reference missing on payment');
        }

        await this.prisma.entitlement.upsert({
          where: {
            userId_resourceType_resourceId: {
              userId: payment.userId,
              resourceType: 'roadmap',
              resourceId: payment.productRef,
            },
          },
          create: {
            userId: payment.userId,
            resourceType: 'roadmap',
            resourceId: payment.productRef,
            source: 'BUNDLE',
          },
          update: { source: 'BUNDLE' },
        });

        await this.prisma.roadmap.update({
          where: { id: payment.productRef },
          data: { enrolled: true, paymentId: payment.id },
        });
        break;

      case 'COURSE':
        if (!payment.productRef) {
          throw new BadRequestException('Course reference missing on payment');
        }

        await this.prisma.entitlement.upsert({
          where: {
            userId_resourceType_resourceId: {
              userId: payment.userId,
              resourceType: 'course',
              resourceId: payment.productRef,
            },
          },
          create: {
            userId: payment.userId,
            resourceType: 'course',
            resourceId: payment.productRef,
            source: 'PURCHASE',
          },
          update: { source: 'PURCHASE' },
        });
        break;
    }
  }

  private toResponse(
    payment: {
      id: string;
      productType: 'READINESS_TEST' | 'ROADMAP_BUNDLE' | 'COURSE';
      amountCents: number;
      currency: string;
      status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    },
    checkoutUrl?: string,
  ): PaymentResponse {
    return {
      id: payment.id,
      productType: payment.productType,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      checkoutUrl,
    };
  }
}
