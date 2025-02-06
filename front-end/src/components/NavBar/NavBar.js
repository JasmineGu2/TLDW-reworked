import { motion } from "framer-motion"
import { Moon, Sun, FileText } from "lucide-react"
import { useTheme } from "next-themes"
import Button from "../Button/button.js";

export default function NavBar({ handleLogout }) {
  const { theme, setTheme } = useTheme()

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full bg-background border-b-2 border-primary z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <FileText className="w-6 h-6" />
            <span className="font-mono text-lg font-bold">TL;DW</span>
          </a>

          <div className="flex items-center space-x-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
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
                className="font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

