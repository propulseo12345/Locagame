import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Check, X } from 'lucide-react';
import { Product } from '../types';
import { ProductsService } from '../services/products.service';
import { calculateDurationDays, formatDate, formatPrice, calculateProductPrice } from '../utils/pricing';

interface DateRangePickerCalendarProps {
  product: Product;
  onDateSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  quantity?: number;
}

export default function DateRangePickerCalendar({
  product,
  onDateSelect,
  initialStartDate,
  initialEndDate,
  quantity = 1
}: DateRangePickerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Vérifier la disponibilité quand les dates sont complètes
  useEffect(() => {
    if (startDate && endDate && startDate < endDate) {
      checkAvailability();
    } else {
      setIsAvailable(null);
      setErrorMessage('');
    }
  }, [startDate, endDate, quantity]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;

    setIsCheckingAvailability(true);
    setErrorMessage('');

    try {
      const available = await ProductsService.checkAvailability(
        product.id,
        formatDateForInput(startDate),
        formatDateForInput(endDate),
        quantity
      );

      setIsAvailable(available);

      if (!available) {
        setErrorMessage(`Stock insuffisant pour ces dates (${quantity} demandé${quantity > 1 ? 's' : ''})`);
      } else {
        // Notifier le parent que les dates sont valides
        onDateSelect(startDate, endDate);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setErrorMessage('Erreur lors de la vérification de disponibilité');
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date: Date) => {
    // Si aucune date sélectionnée ou si on reset, c'est la date de début
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setErrorMessage('');
      setIsAvailable(null);
    }
    // Si date de début déjà sélectionnée, c'est la date de fin
    else if (startDate && !endDate) {
      if (date > startDate) {
        setEndDate(date);
      } else {
        // Si on clique avant la date de début, on reset
        setStartDate(date);
        setEndDate(null);
      }
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
    setErrorMessage('');
    setIsAvailable(null);
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Ajouter les jours du mois précédent pour remplir la première semaine
    const firstDayOfWeek = firstDay.getDay();
    const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = daysToAdd; i > 0; i--) {
      const day = new Date(year, month, 1 - i);
      days.push(day);
    }

    // Ajouter tous les jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Ajouter les jours du mois suivant pour remplir la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate) return false;

    const compareDate = endDate || hoverDate;
    if (!compareDate || compareDate <= startDate) return false;

    return date > startDate && date < compareDate;
  };

  const isDateSelected = (date: Date): 'start' | 'end' | 'none' => {
    if (startDate && date.toDateString() === startDate.toDateString()) return 'start';
    if (endDate && date.toDateString() === endDate.toDateString()) return 'end';
    return 'none';
  };

  const isDateDisabled = (date: Date): boolean => {
    return date < today;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const days = getDaysInMonth(currentMonth);
  const durationDays = startDate && endDate ? calculateDurationDays(startDate, endDate) : 0;
  const estimatedPrice = durationDays > 0 ? calculateProductPrice(product, durationDays) * quantity : 0;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          {!startDate && <p><strong>Étape 1/2 :</strong> Cliquez sur la date de <strong>début</strong> de location</p>}
          {startDate && !endDate && <p><strong>Étape 2/2 :</strong> Cliquez sur la date de <strong>fin</strong> de location</p>}
          {startDate && endDate && <p>✓ Dates sélectionnées ! Cliquez sur une nouvelle date pour modifier.</p>}
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        {/* Header du calendrier */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            type="button"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-lg font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            type="button"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isDisabled = isDateDisabled(date);
            const selected = isDateSelected(date);
            const inRange = isDateInRange(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleDateClick(date)}
                onMouseEnter={() => startDate && !endDate && !isDisabled && setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                disabled={isDisabled}
                className={`
                  relative aspect-square p-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${!isCurrentMonth ? 'text-gray-600' : 'text-white'}
                  ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}
                  ${selected === 'start' ? 'bg-[#33ffcc] text-[#000033] font-bold ring-2 ring-[#33ffcc] ring-offset-2 ring-offset-[#000033] scale-110 z-10' : ''}
                  ${selected === 'end' ? 'bg-[#66cccc] text-[#000033] font-bold ring-2 ring-[#66cccc] ring-offset-2 ring-offset-[#000033] scale-110 z-10' : ''}
                  ${inRange && !isDisabled ? 'bg-[#33ffcc]/20 text-white' : ''}
                  ${selected === 'none' && !inRange && !isDisabled && isCurrentMonth ? 'hover:bg-white/10 hover:scale-110' : ''}
                  ${isToday && selected === 'none' ? 'ring-1 ring-white/30' : ''}
                `}
                type="button"
              >
                <span className="relative z-10">{date.getDate()}</span>

                {/* Indicateurs */}
                {selected === 'start' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#000033] rounded-full flex items-center justify-center">
                    <span className="text-[#33ffcc] text-[8px] font-black">1</span>
                  </div>
                )}
                {selected === 'end' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#000033] rounded-full flex items-center justify-center">
                    <span className="text-[#66cccc] text-[8px] font-black">2</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bouton Reset */}
      {startDate && (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          type="button"
        >
          <X className="w-4 h-4" />
          Réinitialiser les dates
        </button>
      )}

      {/* Résumé de la sélection */}
      {startDate && endDate && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#33ffcc]/10 to-[#66cccc]/10 backdrop-blur-sm rounded-xl p-4 border border-[#33ffcc]/30">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Date de début</span>
                <span className="font-semibold text-white">{formatDate(startDate)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Date de fin</span>
                <span className="font-semibold text-white">{formatDate(endDate)}</span>
              </div>

              <div className="pt-3 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Durée de location</span>
                  <span className="text-xl font-bold text-[#33ffcc]">
                    {durationDays} jour{durationDays > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {quantity > 1 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Quantité</span>
                  <span className="text-white font-semibold">{quantity}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Prix estimé</span>
                  <span className="text-2xl font-black text-[#33ffcc]">
                    {formatPrice(estimatedPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statut de disponibilité */}
          {isCheckingAvailability && (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 p-3 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#33ffcc] border-t-transparent"></div>
              Vérification de la disponibilité...
            </div>
          )}

          {!isCheckingAvailability && isAvailable === true && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
              <Check className="w-5 h-5" />
              <span className="font-medium">Disponible pour ces dates</span>
            </div>
          )}

          {!isCheckingAvailability && isAvailable === false && errorMessage && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Message d'aide initial */}
      {!startDate && (
        <p className="text-sm text-gray-400 text-center">
          Sélectionnez d'abord votre date de début, puis votre date de fin
        </p>
      )}
    </div>
  );
}
