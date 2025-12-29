// Script pour générer les requêtes SQL d'optimisation des descriptions
// Les données sont passées en entrée depuis la requête SQL précédente

// Fonction pour décoder les entités HTML
function decodeHtmlEntities(text) {
  if (!text) return '';
  
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&icirc;/g, 'î')
    .replace(/&ucirc;/g, 'û')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Fonction pour retirer les guillemets au début et à la fin
function removeQuotes(text) {
  if (!text) return '';
  
  let cleaned = text.trim();
  
  // Retirer les guillemets au début
  while (cleaned.startsWith('"')) {
    cleaned = cleaned.substring(1).trim();
  }
  
  // Retirer les guillemets à la fin
  while (cleaned.endsWith('"')) {
    cleaned = cleaned.substring(0, cleaned.length - 1).trim();
  }
  
  return cleaned.trim();
}

// Fonction pour optimiser la description
function optimizeDescription(name, description) {
  if (!description) return '';
  
  // Nettoyer la description
  let optimized = decodeHtmlEntities(description);
  optimized = removeQuotes(optimized);
  optimized = optimized.trim();
  
  // Si la description est vide ou très courte, créer une description optimisée
  if (!optimized || optimized.length < 10) {
    optimized = `Location de ${name}. Produit de qualité professionnelle, parfait pour vos événements et animations.`;
    return optimized;
  }
  
  // Retirer les préfixes inutiles
  if (optimized.toLowerCase().startsWith('location de ')) {
    optimized = optimized.substring(13).trim();
  }
  
  // Capitaliser la première lettre
  if (optimized.length > 0) {
    optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);
  }
  
  // Nettoyer les espaces multiples
  optimized = optimized.replace(/\s+/g, ' ');
  
  return optimized;
}

// Exporter pour utilisation dans le script principal
export { optimizeDescription, decodeHtmlEntities, removeQuotes };
