import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ReadinessResult } from '@pathwise/shared';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

interface EmailUser {
  id: string;
  name: string;
  email: string;
}

interface EmailPayment {
  id: string;
  productType: string;
  amountCents: number;
  currency: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    this.fromAddress = this.configService.get<string>('SMTP_FROM') ?? 'noreply@pathwise.dev';

    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    } else {
      this.transporter = null;
    }
  }

  async sendWelcome(user: EmailUser): Promise<void> {
    const subject = 'Welcome to Pathwise';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="color: #2563eb;">Welcome to Pathwise, ${this.escapeHtml(user.name)}!</h1>
        <p>Your account is ready. Explore courses, take the readiness assessment, and start building your career path.</p>
        <p style="margin-top: 24px;">— The Pathwise Team</p>
      </div>
    `;

    await this.send(user, subject, 'welcome', html);
  }

  async sendPaymentReceipt(user: EmailUser, payment: EmailPayment): Promise<void> {
    const amount = (payment.amountCents / 100).toFixed(2);
    const subject = 'Your Pathwise payment receipt';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="color: #2563eb;">Payment confirmed</h1>
        <p>Hi ${this.escapeHtml(user.name)},</p>
        <p>Thank you for your purchase. Here are your receipt details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Product</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${this.escapeHtml(this.formatProductType(payment.productType))}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${amount.toUpperCase()} ${payment.currency.toUpperCase()}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Payment ID</strong></td><td style="padding: 8px 0;">${this.escapeHtml(payment.id)}</td></tr>
        </table>
        <p style="margin-top: 24px;">— The Pathwise Team</p>
      </div>
    `;

    await this.send(user, subject, 'payment-receipt', html);
  }

  async sendReadinessResults(user: EmailUser, result: ReadinessResult): Promise<void> {
    const subject = 'Your Pathwise readiness results';
    const verdictTitle = this.escapeHtml(result.verdict.title);
    const verdictMessage = this.escapeHtml(result.verdict.message);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="color: #2563eb;">Readiness assessment complete</h1>
        <p>Hi ${this.escapeHtml(user.name)},</p>
        <p>Your average score: <strong>${result.average}%</strong> — ${result.passed ? 'Passed' : 'Needs improvement'}</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; font-size: 18px;">${verdictTitle}</h2>
          <p style="margin: 0;">${verdictMessage}</p>
        </div>
        <p style="margin-top: 24px;">— The Pathwise Team</p>
      </div>
    `;

    await this.send(user, subject, 'readiness-results', html);
  }

  private async send(
    user: EmailUser,
    subject: string,
    template: string,
    html: string,
  ): Promise<void> {
    if (!this.transporter) {
      await this.prisma.emailLog.create({
        data: {
          userId: user.id,
          to: user.email,
          subject,
          template,
          status: 'skipped',
        },
      });
      this.logger.log(`Email skipped (no SMTP): ${template} -> ${user.email}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: user.email,
        subject,
        html,
      });

      await this.prisma.emailLog.create({
        data: {
          userId: user.id,
          to: user.email,
          subject,
          template,
          status: 'sent',
        },
      });
    } catch (error) {
      await this.prisma.emailLog.create({
        data: {
          userId: user.id,
          to: user.email,
          subject,
          template,
          status: 'failed',
        },
      });
      this.logger.error(`Failed to send ${template} email to ${user.email}`, error);
    }
  }

  private formatProductType(productType: string): string {
    switch (productType) {
      case 'READINESS_TEST':
        return 'Readiness Assessment';
      case 'ROADMAP_BUNDLE':
        return 'Roadmap Bundle';
      case 'COURSE':
        return 'Course';
      default:
        return productType;
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
