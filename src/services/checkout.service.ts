import { CheckoutAuthenticated } from './checkout.authenticated';
import { CheckoutPaymentsService } from './checkout.payments';
import type { CheckoutPayload, CheckoutResult } from './checkout.types';

export type { CheckoutPayload, CheckoutResult } from './checkout.types';

export class CheckoutService {
  static createAuthenticatedCheckout = CheckoutAuthenticated.createAuthenticatedCheckout;

  static checkout(
    userId: string | null,
    payload: CheckoutPayload
  ): Promise<CheckoutResult> {
    if (!userId) {
      return Promise.resolve({
        success: false,
        error: 'Vous devez être connecté pour finaliser votre commande.',
      });
    }
    return this.createAuthenticatedCheckout(userId, payload);
  }

  static createStripeCheckoutSession = CheckoutPaymentsService.createStripeCheckoutSession;
  static checkEmailExists = CheckoutPaymentsService.checkEmailExists;
}
