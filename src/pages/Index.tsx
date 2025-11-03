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
        const rows = data || [];
        const map = new Map<string, string[]>();
        for (const r of rows) {
          const brand = r.brands?.name || '';
          const model = r.name || '';
          if (!map.has(brand)) map.set(brand, []);
          map.get(brand)!.push(model);
        }
        const grouped: { brand: string; models: string[] }[] = [];
        for (const [brand, models] of map.entries()) grouped.push({ brand, models });
        // ensure extras at end
        setDynamicButtons(grouped.flatMap(g => g.models.map(m => `${g.brand}|||${m}`)).concat(extraButtons.map(e=>`|||${e}`)));
      } catch (err) {
        console.error('Error loading dynamic buttons', err);
        setDynamicButtons(extraButtons.map(e=>`|||${e}`));
      }
    };
    load();
  }, []);

  function renderButtonLabel(item: string, index: number, prevBrand?: string) {
    // item format: 'Brand|||Model' or '|||Extra'
    const parts = item.split('|||');
    const brand = parts[0];
    const model = parts[1];
    if (!brand) return model;
    // if previous item has same brand, omit brand
    return brand + (prevBrand === brand ? ` ${model}` : ` ${model}`);
  }

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

          {dynamicButtons.map((item, index) => {
            const parts = item.split('|||');
            const brand = parts[0];
            const model = parts[1];
            let label = '';
            if (!brand) {
              label = model;
            } else {
              // determine if previous has same brand
              const prev = dynamicButtons[index-1];
              const prevBrand = prev ? prev.split('|||')[0] : null;
              if (prevBrand === brand) label = model; else label = `${brand} ${model}`;
            }
            const slug = (brand ? (brand + ' ' + model) : model).toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={index} to={`/${slug}`} className="nav-button">
                {label}
              </Link>
            );
          })}

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
