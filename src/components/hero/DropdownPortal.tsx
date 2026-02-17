import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Gamepad2, ChevronRight } from 'lucide-react';
import { Product } from '../../types';

export interface DropdownPortalProps {
  suggestions: Product[];
  onSelect: (e: React.MouseEvent, id: string) => void;
  anchorRef: React.RefObject<HTMLElement>;
  isVisible: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export function DropdownPortal({ suggestions, onSelect, anchorRef, isVisible, dropdownRef }: DropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (anchorRef.current && isVisible) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [anchorRef, isVisible]);

  if (!isVisible || suggestions.length === 0) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 999999,
        backgroundColor: '#0f0f23',
        borderRadius: '12px',
        border: '2px solid #3b82f6',
        boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 0 4px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: '#1a1a3e', padding: '12px 16px', borderBottom: '2px solid #3b82f6' }}>
        <p style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Resultats de recherche
        </p>
      </div>

      {/* Liste */}
      <div style={{ maxHeight: '320px', overflowY: 'auto', backgroundColor: '#0f0f23' }}>
        {suggestions.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={(e) => onSelect(e, product.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              textAlign: 'left',
              backgroundColor: '#0f0f23',
              border: 'none',
              borderBottom: '1px solid #2a2a4a',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f0f23'}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#2a2a4a',
              border: '1px solid #3b3b5c'
            }}>
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gamepad2 style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {product.name}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
                {product.pricing?.oneDay ? (
                  <>
                    <span style={{ color: '#33ffcc', fontWeight: 700 }}>{product.pricing.oneDay}€</span>
                    <span style={{ color: '#6b7280' }}> /jour</span>
                  </>
                ) : 'Prix sur demande'}
              </p>
            </div>
            <ChevronRight style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
