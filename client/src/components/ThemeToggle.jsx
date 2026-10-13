import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative grid grid-cols-2 items-center rounded-full border border-default bg-surface p-1 shadow-sm">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-all duration-500 ease-in-out ${
          theme === "dark"
            ? "translate-x-full bg-purple-600"
            : "translate-x-0 bg-blue-600"
        }`}
      />

      <Button
        size="sm"
        variant="light"
        isIconOnly
        aria-label="Use light theme"
        aria-pressed={theme === "light"}
        onPress={() => setTheme("light")}
        className={`relative z-10 justify-self-center ${
          theme === "light" ? "text-white" : "text-foreground"
        }`}
      >
        <Sun className="size-4" />
      </Button>

      <Button
        size="sm"
        variant="light"
        isIconOnly
        aria-label="Use dark theme"
        aria-pressed={theme === "dark"}
        onPress={() => setTheme("dark")}
        className={`relative z-10 justify-self-center ${
          theme === "dark" ? "text-white" : "text-foreground"
        }`}
      >
        <Moon className="size-4" />
      </Button>
    </div>
  );
}