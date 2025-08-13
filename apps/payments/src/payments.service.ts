import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { NOTIFICATIONS_SERVICE, CreateChargeDto } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';
@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'),{
    apiVersion: '2025-07-30.basil',
  });

  constructor(private readonly configService: ConfigService, @Inject(NOTIFICATIONS_SERVICE) private readonly notificationService: ClientProxy){}
  
  async createCharge(
    { card, amount, email }: PaymentsCreateChargeDto
  ) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      payment_method:'pm_card_visa', // This is a test card, replace with actual payment method ID in production
      confirm: true,
    });

    this.notificationService.emit('notify_email', { email, text: `Your payment of ${amount * 100} has been processed successfully. Transaction ID: ${paymentIntent.id}` });

    return paymentIntent;
  }
}
