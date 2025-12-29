# Charte Graphique LocaGame - Mise à jour 2025

## 🎨 Palette de Couleurs

### Couleurs Principales

| Nom | Code HEX | RGB | Utilisation |
|-----|----------|-----|-------------|
| **DREAM (BLUE)** | `#000033` | 0/0/51 | Couleur principale - Backgrounds sombres, headers |
| **NEON (GREEN)** | `#33ffcc` | 51/255/204 | Couleur accent principale - Boutons, liens, highlights |
| **AQUA** | `#66cccc` | 102/204/204 | Couleur secondaire - Boutons secondaires, badges |
| **FLOYD (PINK)** | `#fe1979` | 254/25/121 | Accent - CTA spéciaux, alertes importantes |
| **SKY** | `#ccffff` | 204/255/255 | Couleur supplémentaire - Backgrounds clairs |

### Utilisation dans le Code

#### CSS Variables (index.css)
```css
:root {
  --dream-blue: #000033;
  --neon-green: #33ffcc;
  --aqua: #66cccc;
  --floyd-pink: #fe1979;
  --sky: #ccffff;
}
```

#### Tailwind Config
```js
colors: {
  'dream-blue': '#000033',
  'neon-green': '#33ffcc',
  'aqua': '#66cccc',
  'floyd-pink': '#fe1979',
  'sky': '#ccffff',
}
```

#### Exemples d'utilisation Tailwind
```jsx
// Backgrounds
className="bg-dream-blue"
className="bg-neon-green"

// Text
className="text-neon-green"
className="text-aqua"

// Borders
className="border-neon-green"
className="hover:border-aqua"
```

---

## ✍️ Typographie

### Famille de Polices

#### Police Principale : **Montserrat**
- **Source** : Google Fonts
- **Poids disponibles** : 400, 500, 600, 700, 800, 900
- **Utilisation** :
  - Titres (h1-h6) : Montserrat Black (900)
  - Corps de texte : Montserrat Regular (400-600)
  - Boutons : Montserrat Bold (700) ou Semibold (600)

#### Police Secondaire : **Caveat** *(temporaire - remplacer par Palmer Lake Print)*
- **Source** : Google Fonts (temporaire)
- **Poids disponibles** : 400, 500, 600, 700
- **Utilisation** : Messages à caractère sympathique, badges, compteurs
- **⚠️ Note** : Caveat est utilisée temporairement en attendant le fichier Palmer Lake Print du client
- **Éléments utilisant cette police** :
  - Badge "Depuis 2015 en région PACA" (Hero)
  - Stats "200+, 2000+, 98%" (Hero)
  - Badge "8 univers de jeux" (Categories)
  - Compteurs de produits dans les catégories
  - Badge "🎮 Démo" (Header)
  - Badge "Sélection premium" (FeaturedProducts)
  - Badge "⭐ Populaire" (FeaturedProducts)
  - Compteur de filtres actifs (CatalogPage)

### Configuration
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Caveat:wght@400;500;600;700&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900; /* Black */
}

/* Classes pour éléments sympathiques */
.friendly-text {
  font-family: 'Caveat', cursive;
  font-weight: 600;
}

.friendly-badge {
  font-family: 'Caveat', cursive;
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

### Classes CSS pour Police Sympathique
Utilisez ces classes pour les badges et messages décontractés :
```jsx
// Pour badges/compteurs
<span className="friendly-badge">200+</span>

// Pour texte sympathique
<span className="friendly-text">🎮 Démo</span>

// Ou avec Tailwind
<span className="font-friendly">Texte sympathique</span>
```

---

## 🎯 Classes CSS Personnalisées

### Boutons
```css
.btn-primary {
  /* Neon Green background, Dream Blue text */
  bg-[#33ffcc] text-[#000033]
  hover:bg-[#66cccc]
}

.btn-secondary {
  /* Glassmorphic avec border white */
  bg-white/10 text-white border-white/20
}

.btn-outline {
  /* Outline Neon Green */
  border-2 border-[#33ffcc] text-[#33ffcc]
  hover:bg-[#33ffcc] hover:text-[#000033]
}
```

### Cartes & Containers
```css
.card {
  /* Glassmorphic card */
  bg-white/5 backdrop-blur-sm
  border-white/10 hover:border-[#33ffcc]/30
}
```

### Titres
```css
.section-title {
  /* Grande taille, Montserrat Black */
  text-4xl md:text-5xl font-black text-white
}

.gradient-text {
  /* Gradient Neon Green -> Aqua */
  bg-gradient-to-r from-[#33ffcc] to-[#66cccc]
}
```

### Effets
```css
.glow {
  /* Glow effect Neon Green */
  box-shadow: 0 0 20px rgba(51, 255, 204, 0.3);
}

.glow-strong {
  box-shadow: 0 0 40px rgba(51, 255, 204, 0.5);
}
```

---

## 📝 Changements Effectués

### Fichiers Modifiés
1. ✅ `src/index.css` - Variables CSS et classes globales
2. ✅ `tailwind.config.js` - Configuration Tailwind avec nouvelles couleurs
3. ✅ Tous les composants React (18 fichiers) :
   - Header.tsx
   - Hero.tsx
   - Categories.tsx
   - FeaturedProducts.tsx
   - HowItWorks.tsx
   - Testimonials.tsx
   - Footer.tsx
   - AdminLayout.tsx
   - ClientLayout.tsx
   - Et toutes les pages...

### Remplacements Effectués
| Ancienne Couleur | Nouvelle Couleur | Description |
|------------------|------------------|-------------|
| `#0A0B3B` (Navy) | `#000033` (Dream Blue) | Couleur principale |
| `#00FFD1` (Cyan) | `#33ffcc` (Neon Green) | Accent principal |
| `#00D9A3` (Green) | `#66cccc` (Aqua) | Accent secondaire |

### Typographie
- ❌ Ancienne : Inter (Google Fonts)
- ✅ Nouvelle : Montserrat Black pour titres, Montserrat Regular pour corps

---

## 🚀 Comment Utiliser

### Démarrer le projet
```bash
npm run dev
```

### Utiliser les nouvelles couleurs
```jsx
// Option 1 : Classes Tailwind custom
<div className="bg-dream-blue text-neon-green">

// Option 2 : Valeurs arbitraires
<div className="bg-[#000033] text-[#33ffcc]">

// Option 3 : Variables CSS
<div style={{ backgroundColor: 'var(--dream-blue)' }}>
```

### Ajouter de nouveaux composants
- Utilisez les classes `.btn-primary`, `.btn-secondary`, `.card` pour cohérence
- Titres : utilisez `.section-title` et `.gradient-text`
- Effets : `.glow` et `.glow-strong` pour les highlights

---

## 📱 Responsive

Les couleurs et la typographie sont responsive par défaut :
- Mobile : Titres en `text-2xl`, boutons `text-sm`
- Tablet : Titres en `text-3xl`
- Desktop : Titres en `text-5xl`, taille normale

---

## 🎨 Palette Visuelle

```
DREAM BLUE    ██████  #000033  Fond principal
NEON GREEN    ██████  #33ffcc  Accents, CTA
AQUA          ██████  #66cccc  Secondaire
FLOYD PINK    ██████  #fe1979  Highlights
SKY           ██████  #ccffff  Backgrounds clairs
```

---

## 🔄 Remplacement de Caveat par Palmer Lake Print (À FAIRE)

Lorsque vous recevrez le fichier Palmer Lake Print du client, suivez ces étapes :

### Étape 1 : Ajouter la police custom
1. Placez le fichier de police dans `/public/fonts/` ou `/src/assets/fonts/`
2. Ajoutez le `@font-face` dans `src/index.css` :

```css
@font-face {
  font-family: 'Palmer Lake Print';
  src: url('/fonts/palmer-lake-print.woff2') format('woff2'),
       url('/fonts/palmer-lake-print.woff') format('woff');
  font-weight: 400 700;
  font-display: swap;
}
```

### Étape 2 : Remplacer dans index.css
Remplacez les classes `.friendly-text` et `.friendly-badge` :

```css
/* Remplacer */
.friendly-text {
  font-family: 'Caveat', cursive;
  font-weight: 600;
}

.friendly-badge {
  font-family: 'Caveat', cursive;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* Par */
.friendly-text {
  font-family: 'Palmer Lake Print', cursive;
  font-weight: 600;
}

.friendly-badge {
  font-family: 'Palmer Lake Print', cursive;
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

### Étape 3 : Mettre à jour Tailwind Config
Dans `tailwind.config.js` :

```js
fontFamily: {
  sans: ['Montserrat', 'sans-serif'],
  friendly: ['Palmer Lake Print', 'cursive'], // Remplacer 'Caveat' par 'Palmer Lake Print'
},
```

### Étape 4 : Supprimer l'import Google Fonts
Dans `src/index.css`, supprimer `&family=Caveat:wght@400;500;600;700` de l'import URL.

### Composants affectés
Aucun changement nécessaire dans les composants ! Les classes `.friendly-badge` et `.friendly-text` sont déjà appliquées aux bons endroits :
- ✅ Hero.tsx (badge + stats)
- ✅ Categories.tsx (badge + compteurs)
- ✅ Header.tsx (badge Démo)
- ✅ FeaturedProducts.tsx (badges)
- ✅ CatalogPage.tsx (compteur filtres)

---

*Document créé le 20 Octobre 2025*
*Mise à jour effectuée par Claude Code*
