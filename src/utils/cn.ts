/**
 * Utilitaire pour fusionner les classes CSS avec Tailwind
 * Simplifie la gestion des classes conditionnelles
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
