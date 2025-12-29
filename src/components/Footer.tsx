import { MapPin, Phone, Mail, Facebook, Instagram, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#000022] relative overflow-hidden">
      {/* Accent décoratif */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#33ffcc]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Section principale */}
      <div className="relative max-w-7xl mx-auto px-1 sm:px-2 lg:px-3 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Colonne gauche - Branding */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6">
              <img
                src="https://lh3.googleusercontent.com/pw/AP1GczNsJRsM7UbxHQrEZhFqb1YszYP5cjNFJ34YwDcIzp2lUGPdcD2fcOfKc711Hl87YKNu-9E8UGM0blce_Kdpi88lXExFSue4X6kFNXPFQCPo71g2KLjk_ov6g-_wclof_1r50cgrxVX4q-PSnXqiOqik=w587-h425-s-no-gm?authuser=0"
                alt="LOCAGAME - Location de jeux et animations pour événements à Marseille et en région PACA"
                className="h-28 w-auto"
                width="112"
                height="112"
                loading="lazy"
              />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
              Location de jeux variés, rares et insolites pour vos événements en région PACA depuis 2015.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/locagame13"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#33ffcc]/10 hover:border-[#33ffcc]/30 hover:text-[#33ffcc] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/locagame_13/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#33ffcc]/10 hover:border-[#33ffcc]/30 hover:text-[#33ffcc] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Colonnes de liens */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            {/* Navigation */}
            <div>
              <h3 className="text-white font-bold mb-5">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/catalogue" className="text-gray-400 hover:text-[#33ffcc] transition-colors inline-flex items-center gap-1 group">
                    Catalogue
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
                <li>
                  <Link to="/evenements" className="text-gray-400 hover:text-[#33ffcc] transition-colors inline-flex items-center gap-1 group">
                    Événements
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
                <li>
                  <Link to="/zones" className="text-gray-400 hover:text-[#33ffcc] transition-colors inline-flex items-center gap-1 group">
                    Zones de livraison
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-[#33ffcc] transition-colors inline-flex items-center gap-1 group">
                    Contact
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Informations */}
            <div>
              <h3 className="text-white font-bold mb-5">Informations</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/a-propos" className="text-gray-400 hover:text-[#33ffcc] transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link to="/contact?subject=devis" className="text-gray-400 hover:text-[#33ffcc] transition-colors">
                    Demande de devis
                  </Link>
                </li>
                <li>
                  <Link to="/cgv" className="text-gray-400 hover:text-[#33ffcc] transition-colors">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link to="/mentions-legales" className="text-gray-400 hover:text-[#33ffcc] transition-colors">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold mb-5">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+33430220383"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#33ffcc] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#33ffcc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#33ffcc]/20 transition-colors">
                    <Phone className="w-5 h-5 text-[#33ffcc]" />
                  </div>
                  <span className="font-medium">04 30 22 03 83</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@locagame.net"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#33ffcc] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#33ffcc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#33ffcc]/20 transition-colors">
                    <Mail className="w-5 h-5 text-[#33ffcc]" />
                  </div>
                  <span>contact@locagame.net</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=553+rue+Saint+Pierre+13012+Marseille"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#33ffcc] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#33ffcc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#33ffcc]/20 transition-colors">
                    <MapPin className="w-5 h-5 text-[#33ffcc]" />
                  </div>
                  <span>553 rue St Pierre, 13012 Marseille</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barre de copyright */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 LOCAGAME - Poker Agency®. Tous droits réservés.
            </p>
            <p className="text-gray-600 text-sm">
              Fait avec passion par{' '}
              <a
                href="https://propulseo-site.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#33ffcc]/70 hover:text-[#33ffcc] transition-colors"
              >
                Propul'SEO
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
