import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  size?: number;
  className?: string;
}

export function ThemeToggle({ size = 16, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`relative flex items-center justify-center w-8 h-8 rounded-none transition-colors duration-200 ${className}`}
      style={{
        color: "var(--tfs-text-muted)",
        border: "1px solid var(--tfs-border-subtle)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--tfs-text-primary)";
        e.currentTarget.style.borderColor = "var(--tfs-border-mid)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--tfs-text-muted)";
        e.currentTarget.style.borderColor = "var(--tfs-border-subtle)";
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Sun size={size} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Moon size={size} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
