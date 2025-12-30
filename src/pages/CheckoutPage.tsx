import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  UserCheck,
  MapPin,
  ClipboardList,
  CheckCircle,
  Shield,
  Lock,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Truck,
  Clock,
  Calendar,
  Info,
  Package,
  Loader2
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/pricing';
import { ReservationsService, CustomersService, AddressesService, ProductsService } from '../services';
import { DistanceService, PRICE_PER_KM } from '../services/distance.service';
import PickupForm from '../components/checkout/PickupForm';

type CheckoutStep = 'customer' | 'recipient' | 'delivery' | 'payment';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems = [], totalPrice = 0, clearCart, deliveryFee } = useCart();
  const { user } = useAuth();

  // Mode de livraison sélectionné dans l'étape 3
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<'pickup' | 'delivery'>('delivery');
  const isPickup = selectedDeliveryMode === 'pickup';

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Étape 1: Client (qui commande)
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isProfessional: false,
    companyName: '',
    siret: ''
  });

  // Étape 2: Réceptionnaire (qui reçoit)
  const [recipient, setRecipient] = useState({
    sameAsCustomer: true,
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  // Étape 3: Livraison
  const [delivery, setDelivery] = useState({
    address: '',
    addressComplement: '',
    postalCode: '',
    city: '',
    date: '',
    timeSlot: '',
    pickupDate: '',
    pickupTimeSlot: ''
  });

  // État pour le mode pickup (retrait à l'entrepôt)
  const [pickup, setPickup] = useState({
    pickupTime: '',
    returnTime: ''
  });

  // Récupérer les dates depuis le panier (premier item)
  const startDate = cartItems[0]?.start_date || '';
  const endDate = cartItems[0]?.end_date || '';

  // Étape 4: Détails événement
  const [eventDetails, setEventDetails] = useState({
    eventType: '',
    guestCount: '',
    venueName: '',
    accessDifficulty: 'none',
    accessDetails: '',
    hasElevator: false,
    floorNumber: '',
    parkingAvailable: true,
    parkingDetails: '',
    electricityAvailable: true,
    setupSpace: '',
    specialRequests: ''
  });

  // Étape 5: Paiement
  const [payment, setPayment] = useState({
    method: 'card',
    acceptCGV: false,
    acceptNewsletter: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcul des frais kilométriques
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Calcul du sous-total produits
  const productsSubtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  // Total avec frais de livraison
  const finalTotal = isPickup ? productsSubtotal : productsSubtotal + calculatedDeliveryFee;

  // Calculer les frais de livraison quand l'adresse change
  const calculateDeliveryFeeFromAddress = useCallback(async () => {
    if (isPickup || !delivery.address || !delivery.city || !delivery.postalCode) {
      setCalculatedDeliveryFee(0);
      setDeliveryDistance(0);
      return;
    }

    setIsCalculatingFee(true);
    try {
      const result = await DistanceService.calculateDeliveryFee(
        delivery.address,
        delivery.city,
        delivery.postalCode
      );

      if (result.success) {
        setDeliveryDistance(result.distanceKm);
        setCalculatedDeliveryFee(result.deliveryFee);
      }
    } catch (error) {
      console.error('Erreur calcul frais:', error);
    } finally {
      setIsCalculatingFee(false);
    }
  }, [delivery.address, delivery.city, delivery.postalCode, isPickup]);

  // Déclencher le calcul quand l'adresse est complète
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (delivery.address && delivery.city && delivery.postalCode) {
        calculateDeliveryFeeFromAddress();
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [delivery.address, delivery.city, delivery.postalCode, calculateDeliveryFeeFromAddress]);

  // Étapes fixes
  const steps = [
    { id: 'customer', label: 'Vos coordonnées', icon: User },
    { id: 'recipient', label: 'Réception', icon: UserCheck },
    { id: 'delivery', label: 'Livraison', icon: MapPin },
    { id: 'payment', label: 'Récapitulatif', icon: ClipboardList }
  ];

  const timeSlots = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00'
  ];

  const eventTypes = [
    'Mariage',
    'Anniversaire',
    'Événement d\'entreprise',
    'Team building',
    'Festival',
    'Fête de famille',
    'Kermesse',
    'Autre'
  ];

  const accessDifficulties = [
    { value: 'none', label: 'Aucune difficulté' },
    { value: 'stairs', label: 'Escaliers (pas d\'ascenseur)' },
    { value: 'narrow', label: 'Passage étroit' },
    { value: 'distance', label: 'Longue distance de portage' },
    { value: 'other', label: 'Autre (préciser)' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  const validateStep = (step: CheckoutStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'customer':
        if (!customer.firstName) newErrors.firstName = 'Prénom requis';
        if (!customer.lastName) newErrors.lastName = 'Nom requis';
        if (!customer.email) newErrors.email = 'Email requis';
        if (!customer.phone) newErrors.phone = 'Téléphone requis';
        if (customer.isProfessional && !customer.companyName) newErrors.companyName = 'Nom entreprise requis';
        break;

      case 'recipient':
        if (!recipient.sameAsCustomer) {
          if (!recipient.firstName) newErrors.recipientFirstName = 'Prénom requis';
          if (!recipient.lastName) newErrors.recipientLastName = 'Nom requis';
          if (!recipient.phone) newErrors.recipientPhone = 'Téléphone requis';
        }
        break;

      case 'delivery':
        if (isPickup) {
          // Mode pickup: validation des créneaux uniquement
          if (!pickup.pickupTime) newErrors.pickupTime = 'Créneau de retrait requis';
          if (!pickup.returnTime) newErrors.returnTime = 'Créneau de retour requis';
        } else {
          // Mode livraison: validation adresse + événement
          if (!delivery.address) newErrors.address = 'Adresse requise';
          if (!delivery.postalCode) newErrors.postalCode = 'Code postal requis';
          if (!delivery.city) newErrors.city = 'Ville requise';
          if (!delivery.date) newErrors.date = 'Date de livraison requise';
          if (!delivery.timeSlot) newErrors.timeSlot = 'Créneau requis';
          // Validation détails événement (intégrés dans étape livraison)
          if (!eventDetails.eventType) newErrors.eventType = 'Type d\'événement requis';
          if (eventDetails.accessDifficulty === 'other' && !eventDetails.accessDetails) {
            newErrors.accessDetails = 'Précisez la difficulté';
          }
        }
        break;

      case 'payment':
        if (!payment.acceptCGV) newErrors.acceptCGV = 'Vous devez accepter les CGV';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepIndex = getCurrentStepIndex();
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id as CheckoutStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    const stepIndex = getCurrentStepIndex();
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as CheckoutStep);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('payment')) return;

    setIsProcessing(true);
    setSubmitError(null);

    try {
      // ========== VÉRIFICATION DISPONIBILITÉ ==========
      // Vérifier que tous les produits sont disponibles aux dates demandées
      for (const item of cartItems) {
        const startDate = item.start_date || delivery.date;
        const endDate = item.end_date || delivery.pickupDate || delivery.date;

        const availableStock = await ProductsService.getAvailableStockForDates(
          item.product.id,
          startDate,
          endDate
        );

        if (availableStock < item.quantity) {
          throw new Error(
            `Stock insuffisant pour "${item.product.name}". ` +
            `Disponible: ${availableStock}, Demandé: ${item.quantity}. ` +
            `Veuillez modifier votre panier ou choisir d'autres dates.`
          );
        }
      }
      // =================================================

      // 1. Créer ou récupérer le customer
      let customerId: string;

      if (user?.id) {
        // Client connecté - vérifier si un profil customer existe
        const existingCustomer = await CustomersService.getCustomerByEmail(user.email || customer.email);
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Créer le profil customer
          const newCustomer = await CustomersService.createCustomer({
            id: user.id,
            email: user.email || customer.email,
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone: customer.phone,
            customer_type: customer.isProfessional ? 'professional' : 'individual',
            company_name: customer.companyName || undefined,
            siret: customer.isProfessional ? customer.siret : undefined,
          });
          customerId = newCustomer.id;
        }
      } else {
        // Client non connecté - créer un customer invité
        const existingGuest = await CustomersService.getCustomerByEmail(customer.email);
        if (existingGuest) {
          customerId = existingGuest.id;
        } else {
          const guestCustomer = await CustomersService.createCustomer({
            id: crypto.randomUUID(),
            email: customer.email,
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone: customer.phone,
            customer_type: customer.isProfessional ? 'professional' : 'individual',
            company_name: customer.companyName || undefined,
            siret: customer.isProfessional ? customer.siret : undefined,
          });
          customerId = guestCustomer.id;
        }
      }

      // 2. Créer l'adresse de livraison (seulement en mode delivery)
      let deliveryAddressId: string | undefined;
      if (!isPickup && delivery.address && delivery.city && delivery.postalCode) {
        const addressData = await AddressesService.createAddress(customerId, {
          address_line1: delivery.address,
          address_line2: delivery.addressComplement || undefined,
          city: delivery.city,
          postal_code: delivery.postalCode,
          is_default: false,
        });
        deliveryAddressId = addressData.id;
      }

      // 3. Calculer la durée en jours
      const calculateDurationDays = (startDate: string, endDate: string | null): number => {
        if (!endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(diffDays, 1);
      };

      // 4. Préparer les items de la réservation
      const reservationItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        duration_days: calculateDurationDays(item.start_date, item.end_date),
        unit_price: item.product.pricing?.oneDay || item.product_price || 0,
        subtotal: item.total_price,
      }));

      // 5. Calculer les sous-totaux
      const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
      const finalDeliveryFee = isPickup ? 0 : calculatedDeliveryFee;

      // 6. Créer la réservation avec TOUTES les données du checkout
      const reservation = await ReservationsService.createReservation({
        customer_id: customerId,
        start_date: isPickup ? startDate : delivery.date,
        end_date: isPickup ? endDate : (delivery.pickupDate || delivery.date),
        delivery_time: isPickup ? undefined : delivery.timeSlot,
        delivery_type: selectedDeliveryMode,
        delivery_address_id: isPickup ? undefined : deliveryAddressId,
        pickup_time: isPickup ? pickup.pickupTime : undefined,
        return_time: isPickup ? pickup.returnTime : undefined,
        pickup_slot: !isPickup ? delivery.pickupTimeSlot : undefined,
        event_type: eventDetails.eventType,
        items: reservationItems,
        subtotal: subtotal,
        delivery_fee: finalDeliveryFee,
        discount: 0,
        total: subtotal + finalDeliveryFee,
        notes: eventDetails.specialRequests || undefined,
        // Donnees receptionnaire
        recipient_data: !recipient.sameAsCustomer ? {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          phone: recipient.phone,
          email: recipient.email || undefined,
          sameAsCustomer: false,
        } : { firstName: '', lastName: '', phone: '', sameAsCustomer: true },
        // Details evenement complets (mode livraison uniquement)
        event_details: !isPickup ? {
          guestCount: eventDetails.guestCount || undefined,
          venueName: eventDetails.venueName || undefined,
          accessDifficulty: eventDetails.accessDifficulty || undefined,
          accessDetails: eventDetails.accessDetails || undefined,
          hasElevator: eventDetails.hasElevator,
          floorNumber: eventDetails.floorNumber || undefined,
          parkingAvailable: eventDetails.parkingAvailable,
          parkingDetails: eventDetails.parkingDetails || undefined,
          electricityAvailable: eventDetails.electricityAvailable,
          setupSpace: eventDetails.setupSpace || undefined,
        } : null,
        // Consentements
        cgv_accepted: payment.acceptCGV,
        newsletter_accepted: payment.acceptNewsletter,
      });

      // 7. Bloquer le stock pour chaque produit
      for (const item of cartItems) {
        const startDate = item.start_date || delivery.date;
        const endDate = item.end_date || delivery.pickupDate || delivery.date;

        await ProductsService.createReservationAvailability({
          product_id: item.product.id,
          start_date: startDate,
          end_date: endDate,
          quantity: item.quantity,
          reservation_id: reservation.id,
        });
      }

      // 8. Succès - vider le panier et rediriger
      clearCart();
      navigate(`/confirmation/${reservation.id}`);

    } catch (error) {
      console.error('Erreur création réservation:', error);

      // Afficher un message d'erreur explicite
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Une erreur est survenue lors de la création de votre réservation. Veuillez réessayer.');
      }

      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Si panier vide
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Panier vide</h1>
          <p className="text-gray-400 mb-6">Ajoutez des produits avant de commander</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors";
  const labelClass = "block text-sm text-gray-400 mb-1.5";
  const errorClass = "text-red-400 text-xs mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/panier"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Panier
          </Link>
          <h1 className="text-2xl font-bold text-white">Finaliser la commande</h1>
        </div>

        {/* Stepper */}
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

        {/* Contenu */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-4 md:p-6">

          {/* ÉTAPE 1: Client */}
          {currentStep === 'customer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Vos coordonnées</h2>
                <p className="text-gray-400 text-sm">Informations de facturation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Prénom *</label>
                  <input
                    type="text"
                    value={customer.firstName}
                    onChange={(e) => setCustomer({...customer, firstName: e.target.value})}
                    className={inputClass}
                    placeholder="Jean"
                  />
                  {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
                </div>
                <div>
                  <label className={labelClass}>Nom *</label>
                  <input
                    type="text"
                    value={customer.lastName}
                    onChange={(e) => setCustomer({...customer, lastName: e.target.value})}
                    className={inputClass}
                    placeholder="Dupont"
                  />
                  {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                      className={`${inputClass} pl-10`}
                      placeholder="jean@email.com"
                    />
                  </div>
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                      className={`${inputClass} pl-10`}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customer.isProfessional}
                  onChange={(e) => setCustomer({...customer, isProfessional: e.target.checked})}
                  className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                />
                <span className="text-gray-300">Je suis un professionnel</span>
              </label>

              {customer.isProfessional && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <label className={labelClass}>Nom de l'entreprise *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={customer.companyName}
                        onChange={(e) => setCustomer({...customer, companyName: e.target.value})}
                        className={`${inputClass} pl-10`}
                        placeholder="Ma Société SAS"
                      />
                    </div>
                    {errors.companyName && <p className={errorClass}>{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>SIRET (optionnel)</label>
                    <input
                      type="text"
                      value={customer.siret}
                      onChange={(e) => setCustomer({...customer, siret: e.target.value})}
                      className={inputClass}
                      placeholder="123 456 789 00012"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2: Réceptionnaire */}
          {currentStep === 'recipient' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Qui réceptionne le matériel ?</h2>
                <p className="text-gray-400 text-sm">Personne présente lors de la livraison</p>
              </div>

              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recipient.sameAsCustomer}
                  onChange={(e) => setRecipient({...recipient, sameAsCustomer: e.target.checked})}
                  className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                />
                <div>
                  <span className="text-white font-medium">Moi-même</span>
                  <p className="text-gray-500 text-sm">{customer.firstName} {customer.lastName} - {customer.phone}</p>
                </div>
              </label>

              {!recipient.sameAsCustomer && (
                <div className="space-y-4 p-4 bg-[#33ffcc]/5 rounded-xl border border-[#33ffcc]/20">
                  <p className="text-[#33ffcc] text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Coordonnées de la personne qui réceptionnera le matériel
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Prénom *</label>
                      <input
                        type="text"
                        value={recipient.firstName}
                        onChange={(e) => setRecipient({...recipient, firstName: e.target.value})}
                        className={inputClass}
                      />
                      {errors.recipientFirstName && <p className={errorClass}>{errors.recipientFirstName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Nom *</label>
                      <input
                        type="text"
                        value={recipient.lastName}
                        onChange={(e) => setRecipient({...recipient, lastName: e.target.value})}
                        className={inputClass}
                      />
                      {errors.recipientLastName && <p className={errorClass}>{errors.recipientLastName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Téléphone *</label>
                      <input
                        type="tel"
                        value={recipient.phone}
                        onChange={(e) => setRecipient({...recipient, phone: e.target.value})}
                        className={inputClass}
                        placeholder="06 12 34 56 78"
                      />
                      {errors.recipientPhone && <p className={errorClass}>{errors.recipientPhone}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Email (optionnel)</label>
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) => setRecipient({...recipient, email: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 3: Mode de livraison (Pickup OU Livraison) */}
          {currentStep === 'delivery' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Mode de récupération</h2>
                <p className="text-gray-400 text-sm">Comment souhaitez-vous récupérer le matériel ?</p>
              </div>

              {/* Toggle Pickup / Livraison */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryMode('pickup')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isPickup
                      ? 'border-[#33ffcc] bg-[#33ffcc]/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Package className={`w-6 h-6 ${isPickup ? 'text-[#33ffcc]' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${isPickup ? 'text-[#33ffcc]' : 'text-white'}`}>
                      Retrait à l'entrepôt
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Gratuit - Venez chercher le matériel</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDeliveryMode('delivery')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    !isPickup
                      ? 'border-[#33ffcc] bg-[#33ffcc]/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className={`w-6 h-6 ${!isPickup ? 'text-[#33ffcc]' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${!isPickup ? 'text-[#33ffcc]' : 'text-white'}`}>
                      Livraison
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Nous livrons sur le lieu de l'événement</p>
                </button>
              </div>

              {isPickup ? (
                /* MODE PICKUP - Retrait à l'entrepôt */
                <PickupForm
                  selectedDate={startDate}
                  endDate={endDate}
                  pickupTime={pickup.pickupTime}
                  returnTime={pickup.returnTime}
                  onPickupTimeChange={(time) => setPickup({...pickup, pickupTime: time})}
                  onReturnTimeChange={(time) => setPickup({...pickup, returnTime: time})}
                  errors={errors}
                />
              ) : (
                /* MODE LIVRAISON - Adresse + Créneaux + Détails événement */
                <>
                  {/* Adresse de livraison */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#33ffcc]" />
                      Adresse de livraison
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Adresse *</label>
                        <input
                          type="text"
                          value={delivery.address}
                          onChange={(e) => setDelivery({...delivery, address: e.target.value})}
                          className={inputClass}
                          placeholder="123 rue de la Paix"
                        />
                        {errors.address && <p className={errorClass}>{errors.address}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Complément d'adresse</label>
                        <input
                          type="text"
                          value={delivery.addressComplement}
                          onChange={(e) => setDelivery({...delivery, addressComplement: e.target.value})}
                          className={inputClass}
                          placeholder="Bâtiment, étage, digicode..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Code postal *</label>
                          <input
                            type="text"
                            value={delivery.postalCode}
                            onChange={(e) => setDelivery({...delivery, postalCode: e.target.value})}
                            className={inputClass}
                            placeholder="13001"
                          />
                          {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Ville *</label>
                          <input
                            type="text"
                            value={delivery.city}
                            onChange={(e) => setDelivery({...delivery, city: e.target.value})}
                            className={inputClass}
                            placeholder="Marseille"
                          />
                          {errors.city && <p className={errorClass}>{errors.city}</p>}
                        </div>
                      </div>

                      {/* Affichage des frais kilométriques */}
                      {(delivery.address && delivery.city && delivery.postalCode) && (
                        <div className="mt-4 p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/30">
                          {isCalculatingFee ? (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Calcul des frais de livraison...</span>
                            </div>
                          ) : deliveryDistance > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Distance depuis l'entrepôt</span>
                                <span className="text-white font-medium">{deliveryDistance} km</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Tarif kilométrique</span>
                                <span className="text-white">{PRICE_PER_KM.toFixed(2)}€ / km</span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <span className="text-[#33ffcc] font-medium">Frais de livraison</span>
                                <span className="text-[#33ffcc] font-bold">{formatPrice(calculatedDeliveryFee)}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">
                              Les frais de livraison seront calculés après vérification de l'adresse
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Créneaux de livraison */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#33ffcc]" />
                      Créneau de livraison
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Date de livraison *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="date"
                            value={delivery.date}
                            onChange={(e) => setDelivery({...delivery, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            className={`${inputClass} pl-10 [color-scheme:dark]`}
                          />
                        </div>
                        {errors.date && <p className={errorClass}>{errors.date}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Créneau horaire *</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <select
                            value={delivery.timeSlot}
                            onChange={(e) => setDelivery({...delivery, timeSlot: e.target.value})}
                            className={`${inputClass} pl-10`}
                          >
                            <option value="" className="bg-[#000033]">Sélectionnez</option>
                            {timeSlots.map(slot => (
                              <option key={slot} value={slot} className="bg-[#000033]">{slot}</option>
                            ))}
                          </select>
                        </div>
                        {errors.timeSlot && <p className={errorClass}>{errors.timeSlot}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Créneaux de récupération */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#33ffcc] rotate-180" />
                      Créneau de récupération
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Date de récupération</label>
                        <input
                          type="date"
                          value={delivery.pickupDate}
                          onChange={(e) => setDelivery({...delivery, pickupDate: e.target.value})}
                          min={delivery.date || new Date().toISOString().split('T')[0]}
                          className={`${inputClass} [color-scheme:dark]`}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Créneau horaire</label>
                        <select
                          value={delivery.pickupTimeSlot}
                          onChange={(e) => setDelivery({...delivery, pickupTimeSlot: e.target.value})}
                          className={inputClass}
                        >
                          <option value="" className="bg-[#000033]">Sélectionnez</option>
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot} className="bg-[#000033]">{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Détails de l'événement (intégrés pour la livraison) */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-[#33ffcc]" />
                      Détails de l'événement
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Type d'événement *</label>
                          <select
                            value={eventDetails.eventType}
                            onChange={(e) => setEventDetails({...eventDetails, eventType: e.target.value})}
                            className={inputClass}
                          >
                            <option value="" className="bg-[#000033]">Sélectionnez</option>
                            {eventTypes.map(type => (
                              <option key={type} value={type} className="bg-[#000033]">{type}</option>
                            ))}
                          </select>
                          {errors.eventType && <p className={errorClass}>{errors.eventType}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Nombre d'invités estimé</label>
                          <input
                            type="number"
                            value={eventDetails.guestCount}
                            onChange={(e) => setEventDetails({...eventDetails, guestCount: e.target.value})}
                            className={inputClass}
                            placeholder="50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Nom du lieu / Salle</label>
                        <input
                          type="text"
                          value={eventDetails.venueName}
                          onChange={(e) => setEventDetails({...eventDetails, venueName: e.target.value})}
                          className={inputClass}
                          placeholder="Château de..., Salle des fêtes de..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accès au lieu */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#fe1979]" />
                      Accès au lieu
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Difficulté d'accès</label>
                        <select
                          value={eventDetails.accessDifficulty}
                          onChange={(e) => setEventDetails({...eventDetails, accessDifficulty: e.target.value})}
                          className={inputClass}
                        >
                          {accessDifficulties.map(d => (
                            <option key={d.value} value={d.value} className="bg-[#000033]">{d.label}</option>
                          ))}
                        </select>
                      </div>

                      {eventDetails.accessDifficulty !== 'none' && (
                        <div>
                          <label className={labelClass}>Précisions sur l'accès</label>
                          <textarea
                            value={eventDetails.accessDetails}
                            onChange={(e) => setEventDetails({...eventDetails, accessDetails: e.target.value})}
                            className={`${inputClass} resize-none`}
                            rows={2}
                            placeholder="Décrivez les difficultés d'accès..."
                          />
                          {errors.accessDetails && <p className={errorClass}>{errors.accessDetails}</p>}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eventDetails.hasElevator}
                            onChange={(e) => setEventDetails({...eventDetails, hasElevator: e.target.checked})}
                            className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                          />
                          <span className="text-gray-300">Ascenseur disponible</span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eventDetails.parkingAvailable}
                            onChange={(e) => setEventDetails({...eventDetails, parkingAvailable: e.target.checked})}
                            className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                          />
                          <span className="text-gray-300">Parking disponible</span>
                        </label>
                      </div>

                      {eventDetails.hasElevator && (
                        <div>
                          <label className={labelClass}>Étage</label>
                          <input
                            type="text"
                            value={eventDetails.floorNumber}
                            onChange={(e) => setEventDetails({...eventDetails, floorNumber: e.target.value})}
                            className={inputClass}
                            placeholder="2ème étage"
                          />
                        </div>
                      )}

                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eventDetails.electricityAvailable}
                          onChange={(e) => setEventDetails({...eventDetails, electricityAvailable: e.target.checked})}
                          className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                        />
                        <span className="text-gray-300">Électricité disponible sur place</span>
                      </label>
                    </div>
                  </div>

                  {/* Notes / Demandes particulières */}
                  <div className="pt-4 border-t border-white/10">
                    <label className={labelClass}>Demandes particulières / Notes</label>
                    <textarea
                      value={eventDetails.specialRequests}
                      onChange={(e) => setEventDetails({...eventDetails, specialRequests: e.target.value})}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="Instructions spéciales, demandes particulières..."
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ÉTAPE 4: Récapitulatif (Demande de devis) */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Récapitulatif de votre demande</h2>
                <p className="text-gray-400 text-sm">Vérifiez les détails avant d'envoyer votre demande de devis</p>
              </div>

              {/* Info demande de devis */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Votre demande sera examinée par notre équipe. Vous recevrez une confirmation par email sous 24h.
                </p>
              </div>

              {/* Récap articles */}
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 p-3 bg-white/5 rounded-xl">
                    <img
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.product.name}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(item.start_date).toLocaleDateString('fr-FR')} → {new Date(item.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <p className="text-white font-bold">{formatPrice(item.total_price)}</p>
                  </div>
                ))}
              </div>

              {/* Total avec détail */}
              <div className="p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/20 space-y-3">
                {/* Sous-total produits */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sous-total produits</span>
                  <span className="text-white font-medium">{formatPrice(productsSubtotal)}</span>
                </div>

                {/* Frais de livraison (si mode livraison) */}
                {!isPickup && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      Frais de livraison
                      {deliveryDistance > 0 && (
                        <span className="text-xs ml-1">({deliveryDistance} km × {PRICE_PER_KM.toFixed(2)}€)</span>
                      )}
                    </span>
                    <span className="text-white font-medium">
                      {calculatedDeliveryFee > 0 ? formatPrice(calculatedDeliveryFee) : 'À calculer'}
                    </span>
                  </div>
                )}

                {/* Pickup gratuit */}
                {isPickup && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Retrait à l'entrepôt</span>
                    <span className="text-green-400 font-medium">Gratuit</span>
                  </div>
                )}

                {/* Ligne de séparation */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total estimé</span>
                    <span className="text-2xl font-bold text-[#33ffcc]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-xs">* Le montant final sera confirmé après validation de votre demande</p>
              </div>

              {/* CGV */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payment.acceptCGV}
                    onChange={(e) => setPayment({...payment, acceptCGV: e.target.checked})}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                  />
                  <span className="text-gray-400 text-sm">
                    J'accepte les{' '}
                    <Link to="/cgv" className="text-[#33ffcc] hover:underline">conditions générales de vente</Link>
                    {' '}et la{' '}
                    <Link to="/confidentialite" className="text-[#33ffcc] hover:underline">politique de confidentialité</Link> *
                  </span>
                </label>
                {errors.acceptCGV && <p className={errorClass}>{errors.acceptCGV}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payment.acceptNewsletter}
                    onChange={(e) => setPayment({...payment, acceptNewsletter: e.target.checked})}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                  />
                  <span className="text-gray-400 text-sm">
                    Je souhaite recevoir les offres et nouveautés par email
                  </span>
                </label>
              </div>

              {/* Erreur */}
              {submitError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {submitError}
                  </p>
                </div>
              )}

              {/* Sécurité */}
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Données sécurisées</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>Réponse sous 24h</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={getCurrentStepIndex() === 0}
            className="flex items-center gap-2 px-5 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Précédent
          </button>

          {currentStep === 'payment' ? (
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center gap-2 px-8 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#000033] border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Envoyer ma demande
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
            >
              Continuer
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
