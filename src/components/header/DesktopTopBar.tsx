import { Link } from 'react-router-dom';
import { Phone, Instagram } from 'lucide-react';
import { LOGO_SCROLLED, LOGO_DEFAULT } from './constants';

interface DesktopTopBarProps {
  isScrolled: boolean;
}

export function DesktopTopBar({ isScrolled }: DesktopTopBarProps) {
  return (
    <div className={`hidden md:block relative transition-all duration-300 ${isScrolled ? 'h-16' : 'h-28'}`}>
      {/* Ligne centrale uniquement */}
      {!isScrolled && (
        <div className="absolute bottom-0 left-[46%] -translate-x-1/2 w-[45%] h-px bg-white/10"></div>
      )}
      {/* Logo */}
      <Link to="/" className={`absolute left-12 transition-all duration-300 ${isScrolled ? 'left-6 bottom-0 translate-y-5' : 'top-1/2 -translate-y-1/3'}`} aria-label="Retour a l'accueil">
        <img
          src={isScrolled ? LOGO_SCROLLED : LOGO_DEFAULT}
          alt="LOCAGAME - Logo de location de jeux et animations pour evenements en region PACA"
          className={`w-auto transition-all duration-300 ${isScrolled ? 'h-16' : 'h-32'}`}
          width={isScrolled ? "200" : "128"}
          height={isScrolled ? "64" : "128"}
          fetchpriority="high"
        />
      </Link>

      {/* Titre + slogan */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center text-center select-text">
        <span className={`font-black text-black tracking-wider uppercase bg-[#33ffcc] inline-block transition-all duration-300 ${isScrolled ? 'text-lg px-3 py-1' : 'text-2xl px-4 py-2'}`} aria-label="LOCAGAME - Location de fun">
          LOCATION DE FUN !
        </span>
        {!isScrolled && (
          <p className="text-3xl text-[#33ffcc] friendly-text italic tracking-wide mt-2 uppercase font-bold transition-opacity duration-300">
            EN RETRAIT SUR MARSEILLE OU EN LIVRAISON (PACA)
          </p>
        )}
      </div>

      {/* Actions a droite */}
      <div className={`absolute top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ${isScrolled ? 'right-4 gap-3' : 'right-8 gap-5'}`}>
        <Link
          to="/catalogue"
          className={`rounded-full bg-[#33ffcc] text-[#000033] friendly-text font-black uppercase tracking-wider hover:bg-[#66cccc] hover:shadow-lg hover:shadow-[#33ffcc]/20 transition-all duration-300 ${
            isScrolled ? 'px-4 py-1.5 text-2xl' : 'px-6 py-3 text-3xl'
          }`}
        >
          RESERVE EN LIGNE
        </Link>

        <a
          href="tel:0430220383"
          className="flex items-center text-[#33ffcc] hover:text-[#66cccc] transition-all duration-300 group"
          style={{ gap: isScrolled ? '0.5rem' : '0.75rem' }}
        >
          <Phone className={`group-hover:scale-110 transition-transform ${isScrolled ? 'w-4 h-4' : 'w-6 h-6'}`} />
          <span className={`font-bold tracking-wide transition-all duration-300 ${isScrolled ? 'text-base' : 'text-xl'}`}>
            04 30 22 03 83
          </span>
        </a>

        <a
          href="https://www.instagram.com/locagame_13?igsh=MTU3MjM4NWY1a3l5Zw=="
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#33ffcc] hover:text-[#66cccc] transition-all duration-300 group"
          aria-label="Suivez-nous sur Instagram"
        >
          <Instagram className={`group-hover:scale-110 transition-transform ${isScrolled ? 'w-5 h-5' : 'w-7 h-7'}`} />
        </a>
      </div>
    </div>
  );
}
