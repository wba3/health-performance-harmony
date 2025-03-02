
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LineChart, 
  Moon, 
  BedDouble, 
  ActivitySquare, 
  Bot, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Close mobile menu when route changes
  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/", name: "Dashboard", icon: <LineChart className="w-5 h-5" /> },
    { path: "/sleep", name: "Sleep", icon: <BedDouble className="w-5 h-5" /> },
    { path: "/training", name: "Training", icon: <ActivitySquare className="w-5 h-5" /> },
    { path: "/ai-coach", name: "AI Coach", icon: <Bot className="w-5 h-5" /> },
    { path: "/settings", name: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2">
              <Moon className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">Health Harmony</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium rounded-md transition-colors relative",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.icon}
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-primary"
                          layoutId="navbar-indicator"
                          transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-3 flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
