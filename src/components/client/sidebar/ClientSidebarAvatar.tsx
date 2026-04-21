import { CheckCircle2 } from 'lucide-react';

interface ClientSidebarAvatarProps {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ClientSidebarAvatar({ firstName, lastName, email }: ClientSidebarAvatarProps) {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'CL';

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center gap-3">
        {/* Avatar with gradient ring */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#33ffcc] via-[#66cccc] to-[#33ffcc]/60 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#000033] flex items-center justify-center">
              <span className="text-xs font-bold text-[#33ffcc] tracking-wide">{initials}</span>
            </div>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#000033] flex items-center justify-center">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {firstName} {lastName}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
        </div>
      </div>
    </div>
  );
}
