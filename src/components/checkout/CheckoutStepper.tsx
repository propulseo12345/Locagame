import { CheckCircle, User, UserCheck, MapPin, ClipboardList, CreditCard, LucideIcon } from 'lucide-react';

type CheckoutStep = 'customer' | 'recipient' | 'delivery' | 'details' | 'payment';

interface Step {
  id: CheckoutStep;
  label: string;
  icon: LucideIcon;
}

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  getCurrentStepIndex: () => number;
}

const steps: Step[] = [
  { id: 'customer', label: 'Vos coordonnées', icon: User },
  { id: 'recipient', label: 'Réception', icon: UserCheck },
  { id: 'delivery', label: 'Livraison', icon: MapPin },
  { id: 'details', label: 'Événement', icon: ClipboardList },
  { id: 'payment', label: 'Paiement', icon: CreditCard }
];

export function CheckoutStepper({ currentStep, getCurrentStepIndex }: CheckoutStepperProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = getCurrentStepIndex() > index;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#33ffcc] text-[#000033]'
                    : isCompleted
                      ? 'bg-[#33ffcc]/20 text-[#33ffcc]'
                      : 'bg-white/5 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 whitespace-nowrap ${
                  isActive ? 'text-[#33ffcc]' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-[#33ffcc]/50' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { steps };
export type { CheckoutStep, Step };
