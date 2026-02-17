/**
 * Strips HTML tags and decodes HTML entities from a string.
 * Useful for displaying product descriptions imported from Excel
 * that may contain raw HTML markup.
 */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent?.trim() || '';
}
