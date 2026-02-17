import { Link } from 'react-router-dom';
import { UserCog, Users, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { DemoCard } from './DemoCard';
import { DEMO_MODE_ENABLED, DEMO_CREDENTIALS, type DemoType } from '../../hooks/useLoginAuth';

interface DemoSectionProps {
  loading: boolean;
  onDemoLogin: (demoType: DemoType) => void;
}

/**
 * Right column of the login page.
 * Shows demo account cards in demo mode, or branding section in production.
 */
export function DemoSection({ loading, onDemoLogin }: DemoSectionProps) {
  return (
    <div className="order-1 lg:order-2 flex flex-col">
      {DEMO_MODE_ENABLED && DEMO_CREDENTIALS ? (
        <>
          {/* Demo accounts header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#33ffcc]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mode démo</h2>
                <p className="text-white/40 text-sm">Testez les interfaces en un clic</p>
              </div>
            </div>
          </div>

          {/* Demo cards */}
          <div className="space-y-4 flex-1">
            <DemoCard
              type="admin"
              icon={UserCog}
              title="Administrateur"
              description={DEMO_CREDENTIALS.admin.description}
              email={DEMO_CREDENTIALS.admin.email}
              password={DEMO_CREDENTIALS.admin.password}
              gradient="bg-gradient-to-br from-[#33ffcc] to-[#00aa88]"
              accentColor="#33ffcc"
              onClick={() => onDemoLogin('admin')}
              loading={loading}
            />

            <DemoCard
              type="client"
              icon={Users}
              title="Client"
              description={DEMO_CREDENTIALS.client.description}
              email={DEMO_CREDENTIALS.client.email}
              password={DEMO_CREDENTIALS.client.password}
              gradient="bg-gradient-to-br from-[#66cccc] to-[#33aaaa]"
              accentColor="#66cccc"
              onClick={() => onDemoLogin('client')}
              loading={loading}
            />

            <DemoCard
              type="technician"
              icon={Truck}
              title="Technicien"
              description={DEMO_CREDENTIALS.technician.description}
              email={DEMO_CREDENTIALS.technician.email}
              password={DEMO_CREDENTIALS.technician.password}
              gradient="bg-gradient-to-br from-[#fe1979] to-[#cc1166]"
              accentColor="#fe1979"
              onClick={() => onDemoLogin('technician')}
              loading={loading}
            />
          </div>

          {/* Back link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <span>←</span>
              <span>Retour au site vitrine</span>
            </Link>
          </div>
        </>
      ) : (
        <BrandingSection />
      )}
    </div>
  );
}

/**
 * Production branding section shown when demo mode is disabled.
 */
function BrandingSection() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12 lg:py-0">
      {/* Large decorative element */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#33ffcc]/30 to-[#66cccc]/30 blur-3xl rounded-full" />
        <div className="relative">
          <img
            src="/logo-client.png"
            alt="LOCAGAME"
            className="h-20 w-auto mx-auto mb-6"
            onError={(e) => {
              // Fallback if logo doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#33ffcc] via-[#66cccc] to-[#33ffcc] bg-clip-text text-transparent">
            LOCAGAME
          </h2>
        </div>
      </div>

      <p className="text-white/50 text-lg max-w-sm mb-8 leading-relaxed">
        Votre partenaire pour des événements <br />
        <span className="text-[#33ffcc] font-semibold">mémorables</span> et{' '}
        <span className="text-[#66cccc] font-semibold">ludiques</span>
      </p>

      {/* Features list */}
      <div className="space-y-3 text-left">
        {[
          'Location de jeux et animations',
          'Livraison et installation',
          'Service clé en main',
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-3 text-white/60">
            <div className="w-6 h-6 rounded-full bg-[#33ffcc]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#33ffcc]" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-[#33ffcc]/50 transition-all group"
        >
          <span>←</span>
          <span>Découvrir nos services</span>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
