import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';

interface CheckoutNavigationProps {
  currentStepIndex: number;
  isLastStep: boolean;
  isProcessing: boolean;
  hasUnavailableProducts: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

export function CheckoutNavigation({
  currentStepIndex, isLastStep, isProcessing, hasUnavailableProducts,
  onNext, onPrevious, onSubmit,
}: CheckoutNavigationProps) {
  return (
    <div className="sticky bottom-0 z-30 bg-[#000033]/95 backdrop-blur-lg border-t border-white/10 -mx-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] mt-6 md:static md:bg-transparent md:border-0 md:mx-0 md:px-0 md:py-0 md:pb-0 md:mt-6">
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Précédent</span>
        </button>
        {isLastStep ? (
          <button
            onClick={onSubmit}
            disabled={isProcessing || hasUnavailableProducts}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 ml-3 px-8 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <><div className="w-5 h-5 border-2 border-[#000033] border-t-transparent rounded-full animate-spin" />Redirection...</>
            ) : (
              <><CreditCard className="w-5 h-5" />Proceder au paiement</>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={hasUnavailableProducts}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 ml-3 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
          >
            Continuer<ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
