import { Tag, TrendingDown } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice, calculateLocagameDays, calculateLocagamePrice } from '../../utils/pricing';

interface TarifsDegressifsProps {
  product: Product;
  selectedStartDate?: string;
  selectedEndDate?: string;
}

interface PriceTier {
  label: string;
  locagameDays: number;
  totalPrice: number;
  pricePerDay: number;
  /** Remise de la formule sur le bloc des jours sup (pas la moyenne/jour) */
  formulaRemise: number | null;
  /** Label spécial pour le badge (ex: "J2 -50%") */
  badgeLabel: string | null;
}

function buildTiers(product: Product): PriceTier[] {
  const P = product.pricing.oneDay;
  const tiers: PriceTier[] = [];

  const daysToShow = [1, 2, 3, 4, 5, 7, 10];

  for (const d of daysToShow) {
    const total = calculateLocagamePrice(P, d);
    const perDay = total / d;

    let label: string;
    if (d === 1) label = '1 jour';
    else if (d === 5) label = 'Semaine (5j)';
    else label = `${d} jours`;

    // Remise de la formule LOCAGAME
    let formulaRemise: number | null = null;
    let badgeLabel: string | null = null;

    if (d === 2) {
      badgeLabel = 'J2 -50%';
    } else if (d >= 3 && d <= 5) {
      const nSup = d - 1;
      formulaRemise = Math.min(nSup * 10, 40);
    } else if (d > 5) {
      formulaRemise = 40; // plafond atteint + jours sup au tarif semaine/6
    }

    tiers.push({
      label,
      locagameDays: d,
      totalPrice: total,
      pricePerDay: perDay,
      formulaRemise,
      badgeLabel,
    });
  }

  return tiers;
}

function getActiveTierIndex(tiers: PriceTier[], locagameDays: number): number {
  if (locagameDays <= 0) return -1;
  let bestIdx = -1;
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i].locagameDays === locagameDays) return i;
    if (tiers[i].locagameDays < locagameDays) bestIdx = i;
  }
  return bestIdx;
}

export function TarifsDegressifs({ product, selectedStartDate, selectedEndDate }: TarifsDegressifsProps) {
  const tiers = buildTiers(product);
  const selectedLocagameDays =
    selectedStartDate && selectedEndDate
      ? calculateLocagameDays(selectedStartDate, selectedEndDate)
      : 0;
  const activeTierIndex = getActiveTierIndex(tiers, selectedLocagameDays);

  const activeTotal = selectedLocagameDays > 0
    ? calculateLocagamePrice(product.pricing.oneDay, selectedLocagameDays)
    : 0;

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#33ffcc]/10 to-transparent border-b border-white/10">
        <TrendingDown className="w-4 h-4 text-[#33ffcc] flex-shrink-0" />
        <div className="min-w-0">
          <span className="text-sm font-bold text-white">Tarifs dégressifs</span>
          <span className="hidden sm:inline text-xs text-white/40 ml-2">
            — le week-end est offert
          </span>
        </div>
      </div>

      {/* Lignes tarifaires */}
      <div className="divide-y divide-white/5">
        {tiers.map((tier, i) => {
          const isActive = i === activeTierIndex;
          const badge = tier.badgeLabel ?? (tier.formulaRemise ? `-${tier.formulaRemise}%` : null);

          return (
            <div
              key={tier.label}
              className={`
                relative flex items-center justify-between px-4 py-2.5 transition-all duration-200
                ${isActive
                  ? 'bg-[#33ffcc]/10 pl-3'
                  : 'bg-white/[0.01] hover:bg-white/[0.04]'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#33ffcc] rounded-r" />
              )}

              {/* Label durée */}
              <span className={`text-sm font-medium tabular-nums ${isActive ? 'text-[#33ffcc] font-bold' : 'text-white/60'}`}>
                {tier.label}
              </span>

              {/* Prix total + badge remise */}
              <div className="flex items-center gap-2">
                {badge && (
                  <span className={`
                    flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold border
                    ${isActive
                      ? 'bg-[#33ffcc]/20 border-[#33ffcc]/50 text-[#33ffcc]'
                      : 'bg-white/5 border-white/10 text-white/40'
                    }
                  `}>
                    <Tag className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                )}
                <span className={`text-sm font-bold tabular-nums ${isActive ? 'text-[#33ffcc]' : 'text-white/80'}`}>
                  {formatPrice(tier.totalPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer : confirmation de la tranche active */}
      {selectedLocagameDays > 0 ? (
        <div className="px-4 py-2.5 bg-[#33ffcc]/5 border-t border-[#33ffcc]/20 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#33ffcc] flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-[#000033]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs text-[#33ffcc]/90">
            Votre sélection : <strong>{selectedLocagameDays} jour{selectedLocagameDays > 1 ? 's' : ''}</strong>
            {' '}→ <strong>{formatPrice(activeTotal)}</strong>
          </p>
        </div>
      ) : (
        <div className="px-4 py-2.5 border-t border-white/5">
          <p className="text-xs text-white/30 text-center">
            Sélectionnez des dates pour voir votre tarif
          </p>
        </div>
      )}
    </div>
  );
}
