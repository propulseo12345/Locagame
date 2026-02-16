import { useState, useEffect } from 'react';

interface DiagResult {
  env: boolean;
  url: string;
  fetch: 'pending' | 'ok' | 'error';
  fetchDetail: string;
  sdk: 'pending' | 'ok' | 'error';
  sdkDetail: string;
}

/**
 * Bandeau de diagnostic Supabase affiché en DEV uniquement.
 * Teste: env vars → fetch brut → SDK query.
 * À supprimer quand tout fonctionne.
 */
export function SupabaseDiagnosticBanner() {
  const [result, setResult] = useState<DiagResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Ne tourne qu'en dev
    if (!import.meta.env.DEV) return;

    const run = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const state: DiagResult = {
        env: Boolean(url && key),
        url: url || 'MANQUANTE',
        fetch: 'pending',
        fetchDetail: '',
        sdk: 'pending',
        sdkDetail: '',
      };

      if (!state.env) {
        state.fetch = 'error';
        state.fetchDetail = 'Env vars manquantes';
        state.sdk = 'error';
        state.sdkDetail = 'Env vars manquantes';
        setResult({ ...state });
        return;
      }

      setResult({ ...state });

      // Test fetch brut
      try {
        const res = await fetch(`${url}/rest/v1/categories?select=id&limit=1`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
        });
        const body = await res.json();
        if (res.ok && Array.isArray(body) && body.length > 0) {
          state.fetch = 'ok';
          state.fetchDetail = `HTTP ${res.status} - ${body.length} row(s)`;
        } else {
          state.fetch = 'error';
          state.fetchDetail = `HTTP ${res.status} - ${JSON.stringify(body).slice(0, 80)}`;
        }
      } catch (err: any) {
        state.fetch = 'error';
        state.fetchDetail = err.message || 'Network error';
      }
      setResult({ ...state });

      // Test SDK
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase.from('categories').select('id').limit(1);
        if (error) {
          state.sdk = 'error';
          state.sdkDetail = `${error.code}: ${error.message}`;
        } else {
          state.sdk = 'ok';
          state.sdkDetail = `${data?.length ?? 0} row(s)`;
        }
      } catch (err: any) {
        state.sdk = 'error';
        state.sdkDetail = err.message || 'Exception';
      }
      setResult({ ...state });
    };

    run();
  }, []);

  // Pas en dev ou déjà fermé
  if (!import.meta.env.DEV || dismissed || !result) return null;

  const allOk = result.env && result.fetch === 'ok' && result.sdk === 'ok';

  // Si tout va bien, ne pas afficher (pas besoin)
  if (allOk) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: '#1a0000',
        borderBottom: '2px solid #ff4444',
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <strong style={{ color: '#ff4444' }}>DIAGNOSTIC SUPABASE (dev only)</strong>
          <div style={{ marginTop: 6 }}>
            {icon(result.env)} ENV: {result.env ? result.url : <span style={{ color: '#ff4444' }}>VITE_SUPABASE_URL ou KEY manquante</span>}
          </div>
          <div>
            {icon(result.fetch === 'ok')} Fetch brut: {result.fetch === 'pending' ? '...' : result.fetchDetail}
          </div>
          <div>
            {icon(result.sdk === 'ok')} SDK Supabase: {result.sdk === 'pending' ? '...' : result.sdkDetail}
          </div>
          {result.fetch === 'error' && (
            <div style={{ marginTop: 8, color: '#ffaa44', fontSize: 12 }}>
              Le navigateur ne peut pas joindre Supabase. Essayez :<br />
              1. Navigation privee (Ctrl+Shift+N)<br />
              2. Desactiver extensions (uBlock, adblock...)<br />
              3. Verifier que le projet Supabase n'est pas en pause sur app.supabase.com
            </div>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: '1px solid #666',
            color: '#999',
            padding: '4px 8px',
            cursor: 'pointer',
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function icon(ok: boolean) {
  return ok ? '✅' : '❌';
}
