import { AlertTriangle, ArrowLeft, Check } from 'lucide-react';

interface WeekendWarningModalProps {
  isOpen: boolean;
  dateLabel: string;
  context: 'delivery' | 'pickup';
  onConfirm: () => void;
  onCancel: () => void;
}

export function WeekendWarningModal({
  isOpen,
  dateLabel,
  context,
  onConfirm,
  onCancel,
}: WeekendWarningModalProps) {
  if (!isOpen) return null;

  const label = context === 'delivery' ? 'livraison' : 'reprise';

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-gradient-to-br from-[#001a33] to-[#000033] border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Créneau hors horaires standards
            </h3>
            <p className="text-amber-400 text-sm mt-0.5">{dateLabel}</p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 mb-6 text-sm text-gray-300">
          <p>
            Vous avez sélectionné une date de <strong className="text-white">{label}</strong> hors
            horaires standards <span className="text-white/70">(lun–ven, hors jours fériés)</span>.
          </p>
          <p>
            Pour un tarif optimal, privilégiez une date en semaine.
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-amber-300 font-medium">
              Si vous maintenez ce créneau, une <strong>majoration week-end / jour férié</strong> sera
              appliquée au devis.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Modifier la date
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all"
          >
            <Check className="w-4 h-4" />
            Continuer avec majoration
          </button>
        </div>
      </div>
    </div>
  );
}
