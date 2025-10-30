import { Link } from "react-router-dom";
import { Moon, Sun, Star, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthButton } from "@/components/AuthButton";
import { Settings } from "@/components/Settings";
import { ServiceHistory } from "@/components/ServiceHistory";
import { EquipmentScanner } from "@/components/EquipmentScanner";
import { TroubleshootingWizard } from "@/components/TroubleshootingWizard";
import { PhotoDiagnosis } from "@/components/PhotoDiagnosis";
import { CostEstimator } from "@/components/CostEstimator";

const buttonNames = [
  "Joule Victorum",
  "Joule Samsung",
  "Joule Modular Air",
  "DeDietrich Strateo",
  "LG Thermia",
  "Hitachi Yutaki",
  "Panasonic Aquarea",
  "Grant Areona",
  "Itec Thermia",
  "Smart Control",
  "System Status",
];

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useUserRole();

  return (
    <div className="page-container">
      <div className="absolute top-4 right-4 flex gap-2 items-center">
        <AuthButton />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-[hsl(var(--button-border))] transition-all duration-300 hover:scale-110 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <main>
        <h1 className="header">Error Code Search</h1>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Settings />
          <ServiceHistory />
          <EquipmentScanner />
          <TroubleshootingWizard />
          <PhotoDiagnosis />
          <CostEstimator />
        </div>

        <nav className="button-container">
          <Link
            to="/favorites"
            className="nav-button flex items-center justify-center gap-2"
          >
            <Star size={20} />
            My Favorites
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="nav-button flex items-center justify-center gap-2 bg-primary/10 border-primary"
            >
              <Shield size={20} />
              Admin Dashboard
            </Link>
          )}
          
          {buttonNames.map((name, index) => (
            <Link
              key={index}
              to={`/${name.toLowerCase().replace(/\s+/g, "-")}`}
              className="nav-button"
            >
              {name}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Index;
