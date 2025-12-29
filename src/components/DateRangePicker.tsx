import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Check } from 'lucide-react';
import { Product } from '../types';
import { ProductsService } from '../services/products.service';
import { calculateDurationDays, formatDate, formatPrice, calculateProductPrice } from '../utils/pricing';

interface DateRangePickerProps {
  product: Product;
  onDateSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  quantity?: number;
}

export default function DateRangePicker({
  product,
  onDateSelect,
  initialStartDate,
  initialEndDate,
  quantity = 1
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Format date for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date minimum : aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = formatDateForInput(today);

  // Vérifier la disponibilité quand les dates changent
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

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setStartDate(date);

    // Si la date de fin est avant la nouvelle date de début, la réinitialiser
    if (date && endDate && endDate <= date) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setEndDate(date);
  };

  const durationDays = startDate && endDate ? calculateDurationDays(startDate, endDate) : 0;
  const estimatedPrice = durationDays > 0 ? calculateProductPrice(product, durationDays) * quantity : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date de début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date de début
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            min={minDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Date de fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date de fin
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            min={startDate ? formatDateForInput(new Date(startDate.getTime() + 86400000)) : minDate}
            disabled={!startDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>
      </div>

      {/* Informations sur la durée */}
      {startDate && endDate && durationDays > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Durée de location</span>
            <span className="font-semibold text-gray-900">
              {durationDays} jour{durationDays > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Du</span>
            <span className="text-gray-900">{formatDate(startDate)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Au</span>
            <span className="text-gray-900">{formatDate(endDate)}</span>
          </div>

          {quantity > 1 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Quantité</span>
              <span className="text-gray-900">{quantity}</span>
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-medium">Prix estimé</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(estimatedPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statut de disponibilité */}
      {isCheckingAvailability && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          Vérification de la disponibilité...
        </div>
      )}

      {!isCheckingAvailability && isAvailable === true && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          <Check className="w-5 h-5" />
          <span className="font-medium">Disponible pour ces dates</span>
        </div>
      )}

      {!isCheckingAvailability && isAvailable === false && errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Aide */}
      {!startDate && (
        <p className="text-sm text-gray-500">
          Sélectionnez les dates de début et de fin pour vérifier la disponibilité
        </p>
      )}
    </div>
  );
}
