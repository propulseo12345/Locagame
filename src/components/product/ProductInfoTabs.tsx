import { useState } from 'react';
import { Info, Check, Ruler, Truck, MessageCircle, Package, Shield, Zap, Users, Clock, Weight } from 'lucide-react';
import { Product } from '../../types';

interface ProductInfoTabsProps {
  product: Product;
}

type TabId = 'description' | 'includes' | 'specs';

export function ProductInfoTabs({ product }: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');

  const tabs = [
    { id: 'description' as TabId, label: 'Description', icon: Info },
    { id: 'includes' as TabId, label: 'Inclus', icon: Check },
    { id: 'specs' as TabId, label: 'Spécifications', icon: Ruler }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#33ffcc]/10 text-[#33ffcc] border-b-2 border-[#33ffcc]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <div className="text-white/70 leading-relaxed [&_strong]:font-bold [&_div]:mb-1" dangerouslySetInnerHTML={{ __html: product.description }} />
            {product.shortDescription && (
              <p className="text-white/50 text-sm italic">
                {product.shortDescription}
              </p>
            )}
          </div>
        )}

        {activeTab === 'includes' && (
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                <Truck className="w-4 h-4 text-[#33ffcc]" />
              </div>
              <span>Livraison et installation sur site</span>
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-[#33ffcc]" />
              </div>
              <span>Explication des règles du jeu</span>
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-[#33ffcc]" />
              </div>
              <span>Reprise du matériel en fin d'événement</span>
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#33ffcc]" />
              </div>
              <span>Assurance matériel incluse</span>
            </li>
            {product.specifications.electricity && (
              <li className="flex items-center gap-3 text-[#fe1979]">
                <div className="w-8 h-8 rounded-lg bg-[#fe1979]/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#fe1979]" />
                </div>
                <span className="font-medium">Nécessite une prise électrique</span>
              </li>
            )}
          </ul>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Users className="w-5 h-5 text-[#33ffcc] mb-2" />
              <div className="text-2xl font-black text-white">{product.specifications.players.min}-{product.specifications.players.max}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Joueurs</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Clock className="w-5 h-5 text-[#66cccc] mb-2" />
              <div className="text-2xl font-black text-white">{product.specifications.setup_time}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Min installation</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Ruler className="w-5 h-5 text-[#33ffcc] mb-2" />
              <div className="text-lg font-black text-white">{product.specifications.dimensions.width}×{product.specifications.dimensions.length}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Dimensions (cm)</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Weight className="w-5 h-5 text-[#66cccc] mb-2" />
              <div className="text-2xl font-black text-white">{product.specifications.weight}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Poids (kg)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
