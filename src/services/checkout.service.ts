import { CheckoutGuest } from './checkout.guest';
import { CheckoutAuthenticated } from './checkout.authenticated';
import { CheckoutPaymentsService } from './checkout.payments';
import type { CheckoutPayload, CheckoutResult } from './checkout.types';

export type { CheckoutPayload, CheckoutResult } from './checkout.types';

export class CheckoutService {
  static createGuestCheckout = CheckoutGuest.createGuestCheckout;
  static createAuthenticatedCheckout = CheckoutAuthenticated.createAuthenticatedCheckout;

  static checkout(
    userId: string | null,
    payload: CheckoutPayload
  ): Promise<CheckoutResult> {
    if (userId) {
      return this.createAuthenticatedCheckout(userId, payload);
    }
    return this.createGuestCheckout(payload);
  }

  static createStripeCheckoutSession = CheckoutPaymentsService.createStripeCheckoutSession;
  static checkEmailExists = CheckoutPaymentsService.checkEmailExists;
}
