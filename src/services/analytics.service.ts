declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface ProductForAnalytics {
  id: string;
  name: string;
  pricing?: { oneDay?: number } | null;
}

export class AnalyticsService {
  private static initialized = false;

  /**
   * Vérifie si le tracking est autorisé :
   * - Uniquement en production
   * - Uniquement si le consentement analytics est donné
   * - Uniquement si le measurement ID est configuré
   */
  private static canTrack(): boolean {
    if (!import.meta.env.PROD) return false;

    const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (!measurementId) return false;

    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) return false;
      const prefs = JSON.parse(consent);
      return prefs.analytics === true;
    } catch {
      return false;
    }
  }

  /**
   * Charge dynamiquement le script gtag et initialise GA4.
   * Ne fait rien si déjà initialisé ou si canTrack() retourne false.
   */
  static init(): void {
    if (this.initialized) return;
    if (!this.canTrack()) return;

    const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

    // Initialiser le dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    // Configurer le consentement par défaut puis accorder
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });

    // Configurer GA4
    window.gtag('config', measurementId, {
      send_page_view: false, // On gère manuellement les page views SPA
    });

    // Injecter le script gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    this.initialized = true;
  }

  // ─── Page Views ────────────────────────────────────────────

  static pageView(path: string, title?: string): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // ─── E-commerce GA4 Standard ───────────────────────────────

  static viewItem(product: ProductForAnalytics, category?: string): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'view_item', {
      currency: 'EUR',
      value: product.pricing?.oneDay ?? 0,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: category,
        price: product.pricing?.oneDay ?? 0,
      }],
    });
  }

  static addToCart(product: ProductForAnalytics, quantity: number, price: number): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        quantity,
        price,
      }],
    });
  }

  static beginCheckout(items: { id: string; name: string; price: number; quantity: number }[], total: number): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'begin_checkout', {
      currency: 'EUR',
      value: total,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  static purchase(reservationId: string, total: number, items: { id: string; name: string; price: number; quantity: number }[]): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'purchase', {
      transaction_id: reservationId,
      currency: 'EUR',
      value: total,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  // ─── Événements Custom ─────────────────────────────────────

  static promoCodeApplied(code: string, discountType: string, discountValue: number): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'apply_promo', {
      coupon: code,
      discount_type: discountType,
      discount_value: discountValue,
    });
  }

  static search(searchTerm: string): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }

  static login(method?: string): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'login', {
      method: method || 'email',
    });
  }

  static signUp(method?: string): void {
    if (!this.canTrack() || !this.initialized) return;
    window.gtag('event', 'sign_up', {
      method: method || 'email',
    });
  }
}
