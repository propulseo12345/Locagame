import { Mail, CheckCircle2 } from 'lucide-react';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
}

export default function ProfileHeader({ firstName, lastName, email, initials }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#33ffcc] via-[#66cccc] to-[#33ffcc]/60 p-[2px]">
          <div className="w-full h-full rounded-full bg-[#000033] flex items-center justify-center">
            <span className="text-lg font-bold text-[#33ffcc]">{initials}</span>
          </div>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#000033] flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Info */}
      <div>
        <h1 className="text-xl font-bold text-white">
          {firstName} {lastName}
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5">
          <Mail className="w-3.5 h-3.5" />
          {email}
        </p>
      </div>
    </div>
  );
}
