import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

export default function DangerZone() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'SUPPRIMER') return;

    setDeleting(true);
    setError('');

    try {
      const { error: fnError } = await supabase.functions.invoke('delete-account');

      if (fnError) {
        let msg = 'Erreur lors de la suppression';
        try {
          if (fnError.context && typeof fnError.context.json === 'function') {
            const body = await fnError.context.json();
            msg = body?.error || msg;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-red-500/10">
        <h2 className="text-sm font-semibold text-red-400">Zone de danger</h2>
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-400 mb-4">
          La suppression de votre compte est irréversible. Toutes vos données seront perdues.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-3 py-3 min-h-[48px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/15 transition-colors active:scale-95"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-red-300 leading-relaxed">
                Tapez <strong>SUPPRIMER</strong> pour confirmer la suppression définitive.
              </p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="w-full px-3 py-2 bg-white/[0.04] border border-red-500/20 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-red-500/40"
              disabled={deleting}
            />

            {error && <p className="text-[11px] text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(''); setError(''); }}
                disabled={deleting}
                className="flex-1 px-3 py-3 min-h-[48px] border border-white/[0.08] text-gray-400 rounded-lg text-sm hover:bg-white/5 transition-colors active:scale-95 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== 'SUPPRIMER'}
                className="flex-1 px-3 py-3 min-h-[48px] bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Suppression...</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> Confirmer</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
