import { Link } from "react-router-dom";
import { Star, Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import TopRightControls from "@/components/TopRightControls";
import { ServiceHistory } from "@/components/ServiceHistory";
import { EquipmentScanner } from "@/components/EquipmentScanner";
import { TroubleshootingWizard } from "@/components/TroubleshootingWizard";
import { PhotoDiagnosis } from "@/components/PhotoDiagnosis";
import { CostEstimator } from "@/components/CostEstimator";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const extraButtons = ["Smart Control", "System Status"];

const Index = () => {
  const { isAdmin } = useUserRole();
  const [dynamicButtons, setDynamicButtons] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('models').select('id,name,model_number,brand_id,brands(name)').order('name');
        if (error) throw error;
        const names = (data||[]).map((m:any) => `${m.brands?.name||''} ${m.name}`.trim());
        setDynamicButtons([...new Set(names.concat(extraButtons))]);
      } catch (err) {
        console.error('Error loading dynamic buttons', err);
        setDynamicButtons(extraButtons);
      }
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <TopRightControls />

      <main>
        <h1 className="header">JR Heat Pumps</h1>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
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

          {dynamicButtons.map((name, index) => (
            <Link
              key={index}
              to={`/${name.toLowerCase().replace(/\s+/g, "-")}`}
              className="nav-button"
            >
              {name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              className="nav-button flex items-center justify-center gap-2 bg-primary/10 border-primary"
            >
              <Shield size={20} />
              Admin Dashboard
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
};

export default Index;
