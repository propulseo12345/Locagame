import { Mail, Sparkles, Camera } from 'lucide-react';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
}

export default function ProfileHeader({ firstName, lastName, email, initials }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#33ffcc] to-[#66cccc] rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black text-[#000033] shadow-lg shadow-[#33ffcc]/30">
            {initials}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-[#33ffcc] hover:text-[#000033] transition-all opacity-0 group-hover:opacity-100">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-[#33ffcc]" />
            <span className="text-sm text-[#33ffcc] font-medium">Compte verifie</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            {firstName} {lastName}
          </h1>
          <p className="text-white/60 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}
