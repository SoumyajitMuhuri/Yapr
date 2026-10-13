import { useTheme } from "../../context/theme";

export const APP_NAME = "Yapr.";

export function AppLogo({ className = "", size=35 ,alt = APP_NAME }) {
  const { theme } = useTheme();
  const logo = theme === "dark" ? "/logo-dark.png" : "/logo-light.png"
  return (
    <img
      src={logo}
      alt={alt}
      width= {size}
      height={size}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable={false}
    />
  );
}