import { Switch } from "@/components/ui/switch";

interface AppearanceSettingsProps {
  darkMode: boolean;
  onDarkModeToggle: (checked: boolean) => void;
}

export const AppearanceSettings = ({ darkMode, onDarkModeToggle }: AppearanceSettingsProps) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-base font-medium">Dark Mode</span>
      <Switch
        checked={darkMode}
        onCheckedChange={onDarkModeToggle}
      />
    </div>
  );
};