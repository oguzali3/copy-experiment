
import { Switch } from "@/components/ui/switch";

interface AppearanceSettingsProps {
  darkMode: boolean;
  onDarkModeToggle: (checked: boolean) => void;
}

export const AppearanceSettings = ({ darkMode, onDarkModeToggle }: AppearanceSettingsProps) => {
  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-4">APPEARANCE</h2>
      <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center">
          <span className="dark:text-gray-200">Dark Mode</span>
          <Switch
            checked={darkMode}
            onCheckedChange={onDarkModeToggle}
          />
        </div>
      </div>
    </section>
  );
};
