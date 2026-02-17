import { Bell, Mail, Phone, Globe } from 'lucide-react';

interface Preferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newsletter: boolean;
}

interface NotificationPreferencesProps {
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
}

interface ToggleItemProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleItem({ icon, label, checked, onChange }: ToggleItemProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-white/80">{label}</span>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#33ffcc]' : 'bg-white/20'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${checked ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`}></div>
        </div>
      </div>
    </label>
  );
}

export default function NotificationPreferences({ preferences, setPreferences }: NotificationPreferencesProps) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-xl">
          <Bell className="w-5 h-5 text-yellow-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Notifications</h2>
      </div>

      <div className="p-6 space-y-4">
        <ToggleItem
          icon={<Mail className="w-5 h-5 text-white/40" />}
          label="Notifications email"
          checked={preferences.emailNotifications}
          onChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
        />
        <ToggleItem
          icon={<Phone className="w-5 h-5 text-white/40" />}
          label="Notifications SMS"
          checked={preferences.smsNotifications}
          onChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
        />
        <ToggleItem
          icon={<Globe className="w-5 h-5 text-white/40" />}
          label="Newsletter"
          checked={preferences.newsletter}
          onChange={(checked) => setPreferences({ ...preferences, newsletter: checked })}
        />
      </div>
    </div>
  );
}
