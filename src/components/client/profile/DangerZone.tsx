export default function DangerZone() {
  return (
    <div className="bg-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/20 overflow-hidden">
      <div className="px-6 py-5 border-b border-red-500/20">
        <h2 className="text-lg font-bold text-red-400">Zone de danger</h2>
      </div>
      <div className="p-6">
        <p className="text-sm text-white/60 mb-4">
          La suppression de votre compte est irreversible. Toutes vos donnees seront perdues.
        </p>
        <button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-colors">
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
