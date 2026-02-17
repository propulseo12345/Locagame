import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { Product } from '../types';
import { ProductsService } from '../services/products.service';
import { calculateDurationDays, calculateProductPrice } from '../utils/pricing';
import { CalendarGrid } from './date-range-picker/CalendarGrid';
import { DateSelectionSummary } from './date-range-picker/DateSelectionSummary';

interface DateRangePickerCalendarProps {
  product: Product;
  onDateSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  quantity?: number;
}

export default function DateRangePickerCalendar({
  product, onDateSelect, initialStartDate, initialEndDate, quantity = 1
}: DateRangePickerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (startDate && endDate && startDate < endDate) {
      checkAvailability();
    } else {
      setIsAvailable(null);
      setErrorMessage('');
    }
  }, [startDate, endDate, quantity]);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;
    setIsCheckingAvailability(true);
    setErrorMessage('');

    try {
      const available = await ProductsService.checkAvailability(
        product.id, formatDateForInput(startDate), formatDateForInput(endDate), quantity
      );
      setIsAvailable(available);
      if (!available) {
        setErrorMessage(`Stock insuffisant pour ces dates (${quantity} demande${quantity > 1 ? 's' : ''})`);
      } else {
        onDateSelect(startDate, endDate);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setErrorMessage('Erreur lors de la verification de disponibilite');
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setErrorMessage('');
      setIsAvailable(null);
    } else if (startDate && !endDate) {
      if (date > startDate) {
        setEndDate(date);
      } else {
        setStartDate(date);
        setEndDate(null);
      }
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setErrorMessage('');
    setIsAvailable(null);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const durationDays = startDate && endDate ? calculateDurationDays(startDate, endDate) : 0;
  const estimatedPrice = durationDays > 0 ? calculateProductPrice(product, durationDays) * quantity : 0;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          {!startDate && <p><strong>Etape 1/2 :</strong> Cliquez sur la date de <strong>debut</strong> de location</p>}
          {startDate && !endDate && <p><strong>Etape 2/2 :</strong> Cliquez sur la date de <strong>fin</strong> de location</p>}
          {startDate && endDate && <p>Dates selectionnees ! Cliquez sur une nouvelle date pour modifier.</p>}
        </div>
      </div>

      {/* Calendrier */}
      <CalendarGrid
        currentMonth={currentMonth}
        startDate={startDate}
        endDate={endDate}
        today={today}
        onDateClick={handleDateClick}
        onPreviousMonth={previousMonth}
        onNextMonth={nextMonth}
      />

      {/* Bouton Reset */}
      {startDate && (
        <button onClick={handleReset} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm" type="button">
          <X className="w-4 h-4" />
          Reinitialiser les dates
        </button>
      )}

      {/* Resume de la selection */}
      {startDate && endDate && (
        <DateSelectionSummary
          startDate={startDate}
          endDate={endDate}
          durationDays={durationDays}
          quantity={quantity}
          estimatedPrice={estimatedPrice}
          isCheckingAvailability={isCheckingAvailability}
          isAvailable={isAvailable}
          errorMessage={errorMessage}
        />
      )}

      {/* Message d'aide initial */}
      {!startDate && (
        <p className="text-sm text-gray-400 text-center">
          Selectionnez d'abord votre date de debut, puis votre date de fin
        </p>
      )}
    </div>
  );
}
