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
    <div className="bg-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/20 overflow-hidden">
      <div className="px-6 py-5 border-b border-red-500/20">
        <h2 className="text-lg font-bold text-red-400">Zone de danger</h2>
      </div>
      <div className="p-6">
        <p className="text-sm text-white/60 mb-4">
          La suppression de votre compte est irreversible. Toutes vos donnees seront perdues.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-colors"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">
                Cette action supprimera votre compte, vos reservations et toutes vos donnees. Tapez <strong>SUPPRIMER</strong> pour confirmer.
              </p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="w-full px-3 py-2 bg-white/5 border border-red-500/30 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              disabled={deleting}
            />

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(''); setError(''); }}
                disabled={deleting}
                className="flex-1 px-3 py-2 border border-white/20 text-white/70 rounded-lg text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== 'SUPPRIMER'}
                className="flex-1 px-3 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
