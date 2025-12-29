import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  UserCheck,
  MapPin,
  ClipboardList,
  CreditCard,
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
  Info
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/pricing';

type CheckoutStep = 'customer' | 'recipient' | 'delivery' | 'details' | 'payment';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems = [], totalPrice = 0, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer');

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

  const steps = [
    { id: 'customer', label: 'Vos coordonnées', icon: User },
    { id: 'recipient', label: 'Réception', icon: UserCheck },
    { id: 'delivery', label: 'Livraison', icon: MapPin },
    { id: 'details', label: 'Événement', icon: ClipboardList },
    { id: 'payment', label: 'Paiement', icon: CreditCard }
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
        if (!delivery.address) newErrors.address = 'Adresse requise';
        if (!delivery.postalCode) newErrors.postalCode = 'Code postal requis';
        if (!delivery.city) newErrors.city = 'Ville requise';
        if (!delivery.date) newErrors.date = 'Date de livraison requise';
        if (!delivery.timeSlot) newErrors.timeSlot = 'Créneau requis';
        break;

      case 'details':
        if (!eventDetails.eventType) newErrors.eventType = 'Type d\'événement requis';
        if (eventDetails.accessDifficulty === 'other' && !eventDetails.accessDetails) {
          newErrors.accessDetails = 'Précisez la difficulté';
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
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simuler la création de réservation
    const reservationId = 'RES-' + Date.now();
    clearCart();
    navigate(`/confirmation/${reservationId}`);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8">

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

          {/* ÉTAPE 3: Livraison */}
          {currentStep === 'delivery' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Adresse de livraison</h2>
                <p className="text-gray-400 text-sm">Lieu de l'événement</p>
              </div>

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
              </div>

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
            </div>
          )}

          {/* ÉTAPE 4: Détails événement */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Détails de l'événement</h2>
                <p className="text-gray-400 text-sm">Aidez-nous à préparer au mieux votre livraison</p>
              </div>

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
                <div className="md:col-span-2">
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
            </div>
          )}

          {/* ÉTAPE 5: Paiement */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Récapitulatif et paiement</h2>
                <p className="text-gray-400 text-sm">Vérifiez votre commande</p>
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

              {/* Total */}
              <div className="p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total à payer</span>
                  <span className="text-2xl font-bold text-[#33ffcc]">{formatPrice(totalPrice)}</span>
                </div>
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

              {/* Sécurité */}
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>SSL 256 bits</span>
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
                  Traitement...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Confirmer et payer
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
