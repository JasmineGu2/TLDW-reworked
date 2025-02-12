import { motion } from "framer-motion";
import { Moon, Sun, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import Button from "../Button/button.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { theme, setTheme, systemTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("Current theme:", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // Determine which theme should be applied
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full bg-background border-b-2 border-primary z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between h-16">
          <a href="/app" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <FileText className="w-6 h-6" />
            <span className="font-mono text-lg font-bold">TL;DW</span>
          </a>

          <div className="flex items-center space-x-8">
            {/* Button to toggle theme */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="relative flex items-center justify-center w-10 h-10"
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            >
              {mounted && currentTheme === "dark" ? (
                <Sun className="h-6 w-6 text-yellow-400 transition-transform transform rotate-0 scale-100" />
              ) : (
                <Moon className="h-6 w-6 text-blue-500 transition-transform transform rotate-180 scale-100" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button> */}

            {/* Navigation links and Logout button */}
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Application", "Process"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="font-mono text-foreground hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
              <Button
                onClick={handleLogout}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
