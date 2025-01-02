import { Switch } from "@/components/ui/switch";

interface AppearanceSettingsProps {
  darkMode: boolean;
  onDarkModeToggle: (checked: boolean) => void;
}

export const AppearanceSettings = ({ darkMode, onDarkModeToggle }: AppearanceSettingsProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">APPEARANCE</h2>
      <div className="bg-card rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Dark Mode</span>
          <Switch
            checked={darkMode}
            onCheckedChange={onDarkModeToggle}
          />
        </div>
      </div>
    </section>
  );
};