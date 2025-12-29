import { useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  pricing: {
    oneDay: number;
    weekend?: number;
    week?: number;
  };
  category?: {
    name: string;
  };
  specifications?: {
    players?: {
      min: number;
      max: number;
    };
  };
  rating?: number;
  totalReservations?: number;
}

interface ProductSchemaProps {
  product: Product;
  url: string;
}

/**
 * Composant pour générer le schema.org Product sur les pages produits
 */
export function ProductSchema({ product, url }: ProductSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || product.shortDescription || `Location de ${product.name} pour événements en région PACA`,
      "image": product.images.length > 0 ? product.images : ["https://www.locagame.fr/logo-client.png"],
      "brand": {
        "@type": "Brand",
        "name": "LOCAGAME"
      },
      "category": product.category?.name || "Location de jeux",
      "offers": {
        "@type": "Offer",
        "url": url,
        "priceCurrency": "EUR",
        "price": product.pricing.oneDay,
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "LocalBusiness",
          "name": "LOCAGAME",
          "url": "https://www.locagame.fr"
        }
      },
      "aggregateRating": product.rating ? {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.totalReservations || 1
      } : undefined,
      "audience": product.specifications?.players ? {
        "@type": "Audience",
        "audienceType": `Pour ${product.specifications.players.min}-${product.specifications.players.max} joueurs`
      } : undefined
    };

    // Supprimer les propriétés undefined
    if (!schema.aggregateRating) delete schema.aggregateRating;
    if (!schema.audience) delete schema.audience;

    // Créer ou mettre à jour le script
    let script = document.querySelector('script[data-product-schema]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-product-schema', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
  }, [product, url]);

  return null;
}
