import { useState } from 'react';
import type { Technician } from '../../services/technicians.service';

export interface TechnicianFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  vehicleId: string;
  isActive: boolean;
}

const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => chars[b % chars.length])
    .join('');
};

interface UseTechnicianFormProps {
  technician?: Technician | null;
  onSubmit: (data: TechnicianFormData) => Promise<void>;
}

export function useTechnicianForm({ technician, onSubmit }: UseTechnicianFormProps) {
  const isEdit = !!technician;

  const [firstName, setFirstName] = useState(technician?.first_name || '');
  const [lastName, setLastName] = useState(technician?.last_name || '');
  const [email, setEmail] = useState(technician?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(technician?.phone || '');
  const [vehicleId, setVehicleId] = useState(technician?.vehicle_id || '');
  const [isActive, setIsActive] = useState(technician?.is_active ?? true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset password section (edit mode only)
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Prénom et nom sont obligatoires');
      return;
    }
    if (!isEdit && !email.trim()) {
      setError('Email est obligatoire');
      return;
    }
    if (!isEdit && password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: isEdit ? newPassword : password,
        phone: phone.trim(),
        vehicleId,
        isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEdit,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    phone, setPhone,
    vehicleId, setVehicleId,
    isActive, setIsActive,
    showPassword, setShowPassword,
    submitting,
    error,
    showResetPassword, setShowResetPassword,
    newPassword, setNewPassword,
    handleSubmit,
    generatePassword,
  };
}
