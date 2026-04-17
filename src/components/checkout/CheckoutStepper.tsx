import { CheckCircle, User, UserCheck, MapPin, ClipboardList, type LucideIcon } from 'lucide-react';
import type { CheckoutStep } from '../../hooks/checkout';

const STEP_ICONS: Record<CheckoutStep, LucideIcon> = {
  customer: User,
  recipient: UserCheck,
  delivery: MapPin,
  payment: ClipboardList,
};

interface CheckoutStepperProps {
  steps: { id: CheckoutStep; label: string }[];
  currentStepIndex: number;
}

export function CheckoutStepper({ steps, currentStepIndex }: CheckoutStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between sm:justify-start">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id];
          const isActive = index === currentStepIndex;
          const isCompleted = currentStepIndex > index;
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#33ffcc] text-[#000033]' : isCompleted ? 'bg-[#33ffcc]/20 text-[#33ffcc]' : 'bg-white/5 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`hidden sm:block text-xs mt-2 whitespace-nowrap ${
                  isActive ? 'text-[#33ffcc]' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-6 sm:w-12 h-0.5 mx-2 ${isCompleted ? 'bg-[#33ffcc]/50' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
