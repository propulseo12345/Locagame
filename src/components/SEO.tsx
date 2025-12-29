import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

/**
 * Composant pour gérer les meta tags dynamiquement par page
 */
export function SEO({
  title,
  description = 'Louez des jeux gonflables, animations et équipements pour vos événements. Large catalogue, livraison rapide dans toute la région.',
  keywords,
  image = '/logo-client.png',
  url,
  type = 'website',
}: SEOProps) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = `${title} | LOCAGAME`;
    } else {
      document.title = 'LOCAGAME - Location de Jeux et Animations pour Événements';
    }

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Open Graph
    updateMetaTag('og:title', title || document.title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:type', type);
    if (url) updateMetaTag('og:url', url);

    // Twitter
    updateMetaTag('twitter:title', title || document.title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image, 'name');
  }, [title, description, keywords, image, url, type]);

  return null;
}

function updateMetaTag(property: string, content: string, attribute: 'property' | 'name' = 'property') {
  let meta = document.querySelector(`meta[${attribute}="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}
