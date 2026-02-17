// Liens de navigation principaux
export const NAV_LINKS = [
  { path: '/', label: 'Accueil' },
  { path: '/catalogue', label: 'Catalogue' },
  { path: '/evenements', label: 'Evenements' },
  { path: '/contact', label: 'Contact' },
] as const;

// Logo URLs
export const LOGO_SCROLLED = "https://lh3.googleusercontent.com/pw/AP1GczOXY1GzwzGq-Y7QtylyG7YH6KJ8dSC5LU5kiR1XMexmh7jgVeT2ZOxeIWehZLgJpl6f17J1hYTcLl8JlWppqaB96wkf2puPPy-dlAJyXgbeSx8n3o6qGG0IclmHb24N4AYAZSKRDZffwYETETTp5qbz=w868-h287-s-no-gm?authuser=0";
export const LOGO_DEFAULT = "https://lh3.googleusercontent.com/pw/AP1GczNsJRsM7UbxHQrEZhFqb1YszYP5cjNFJ34YwDcIzp2lUGPdcD2fcOfKc711Hl87YKNu-9E8UGM0blce_Kdpi88lXExFSue4X6kFNXPFQCPo71g2KLjk_ov6g-_wclof_1r50cgrxVX4q-PSnXqiOqik=w587-h425-s-no-gm?authuser=0";

export function getDashboardLink(user: { role: string } | null): string {
  if (!user) return '/login';
  switch (user.role) {
    case 'admin': return '/admin/dashboard';
    case 'technician': return '/technician/dashboard';
    case 'client':
    default: return '/client/dashboard';
  }
}

export function getDashboardLabel(user: { role: string } | null): string {
  if (!user) return 'Mon compte';
  switch (user.role) {
    case 'admin': return 'Interface Admin';
    case 'technician': return 'Mes Taches';
    case 'client':
    default: return 'Mon Espace';
  }
}
