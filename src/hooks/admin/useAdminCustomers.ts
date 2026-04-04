import { useState, useEffect, useMemo, useRef } from 'react';
import { CustomersService } from '../../services';
import { Customer } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

export interface CustomerStats {
  total: number;
  particulier: number;
  professionnel: number;
  vip: number;
  actif: number;
}

export interface ImportResult {
  success: number;
  errors: string[];
}

export function useAdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Customer | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const loadCustomers = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await CustomersService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Impossible de charger la liste des clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const rows = customers.map((c) => {
        const res = (c as Customer & { reservations?: Array<{ status: string; total: number }> }).reservations || [];
        const valid = res.filter((r) => r.status !== 'cancelled');
        const total = valid.reduce((sum: number, r) => sum + (r.total || 0), 0);
        const avg = valid.length > 0 ? total / valid.length : 0;
        return {
          'Prénom': c.first_name || '',
          'Nom': c.last_name || '',
          'Email': c.email || '',
          'Téléphone': c.phone || '',
          'Type': c.customer_type === 'professional' ? 'Professionnel' : 'Particulier',
          'Entreprise': c.company_name || '',
          'SIRET': c.siret || '',
          'Date inscription': c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '',
          'Nb réservations': valid.length,
          'Total dépensé (€)': Math.round(total * 100) / 100,
          'Panier moyen (€)': Math.round(avg * 100) / 100,
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clients');
      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `locagame-clients-${today}.xlsx`);
      toast.success('Export terminé');
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const successes: number[] = [0];
    const errors: string[] = [];

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const rows = rawRows.map(row => {
        const normalized: Record<string, unknown> = {};
        for (const key of Object.keys(row)) {
          normalized[key.trim().toLowerCase()] = row[key];
        }
        return normalized;
      });

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const lineNum = i + 2;
        const email = (row['email'] || '').toString().trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(`Ligne ${lineNum}: email invalide ou manquant (${email || 'vide'})`);
          continue;
        }

        const firstName = (row['prénom'] || row['prenom'] || '').toString().trim();
        const lastName = (row['nom'] || '').toString().trim();
        const phone = (row['téléphone'] || row['telephone'] || '').toString().trim();
        const typeRaw = (row['type'] || '').toString().trim().toLowerCase();
        const company = (row['entreprise'] || '').toString().trim();
        const siret = (row['siret'] || '').toString().trim();

        const customerType = typeRaw.startsWith('pro') ? 'professional' : 'individual';

        try {
          const { data: existing } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (existing) {
            const updates: Record<string, string> = {};
            if (firstName) updates.first_name = firstName;
            if (lastName) updates.last_name = lastName;
            if (phone) updates.phone = phone;
            if (typeRaw) updates.customer_type = customerType;
            if (company) updates.company_name = company;
            if (siret) updates.siret = siret;

            if (Object.keys(updates).length > 0) {
              const { error: updateErr } = await supabase
                .from('customers')
                .update(updates)
                .eq('id', existing.id);
              if (updateErr) throw updateErr;
            }
          } else {
            const { error: insertErr } = await supabase
              .from('customers')
              .insert({
                id: crypto.randomUUID(),
                email,
                first_name: firstName || null,
                last_name: lastName || null,
                phone: phone || null,
                customer_type: customerType,
                company_name: company || null,
                siret: siret || null,
              });
            if (insertErr) throw insertErr;
          }
          successes[0]++;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Erreur inconnue';
          errors.push(`Ligne ${lineNum} (${email}): ${message}`);
        }
      }

      setImportResult({ success: successes[0], errors });
      await loadCustomers();
    } catch {
      toast.error("Erreur lors de la lecture du fichier");
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const templateData = [
      { 'Prénom': 'Jean', 'Nom': 'Dupont', 'Email': 'jean.dupont@email.com', 'Téléphone': '0612345678', 'Type': 'Particulier', 'Entreprise': '', 'SIRET': '' },
      { 'Prénom': 'Marie', 'Nom': 'Martin', 'Email': 'marie.martin@entreprise.fr', 'Téléphone': '0698765432', 'Type': 'Professionnel', 'Entreprise': 'Martin Events', 'SIRET': '12345678901234' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modèle');
    XLSX.writeFile(wb, 'modele-import-clients.xlsx');
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.company_name && customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [customers, searchTerm, typeFilter]);

  const stats: CustomerStats = useMemo(() => ({
    total: customers.length,
    particulier: customers.filter(c => c.customer_type === 'individual').length,
    professionnel: customers.filter(c => c.customer_type === 'professional').length,
    vip: 0,
    actif: customers.length,
  }), [customers]);

  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  };

  return {
    customers,
    filteredCustomers,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    hasActiveFilters,
    clearFilters,
    isExporting,
    importResult,
    setImportResult,
    fileInputRef,
    handleExport,
    handleImport,
    downloadTemplate,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteCustomer,
    loadCustomers,
  };
}
