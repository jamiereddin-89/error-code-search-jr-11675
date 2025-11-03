import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function BrandSelect({ value, onChange }: { value?: string | null; onChange: (val: string | null) => void; }) {
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const load = async () => {
    const { data, error } = await supabase.from("brands").select("id,name").order("name");
    if (error) return toast({ title: "Error loading brands", description: error.message, variant: "destructive" });
    setBrands(data || []);
  };

  useEffect(() => { load(); }, []);

  const saveNew = async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase.from("brands").insert({ name: newName.trim() }).select("id,name").maybeSingle();
    if (error) {
      toast({ title: "Error creating brand", description: error.message, variant: "destructive" });
      return;
    }
    setNewName("");
    setOpen(false);
    await load();
    onChange(data.id);
    toast({ title: "Brand added" });
  };

  return (
    <div>
      <Label>Brand</Label>
      <div className="flex gap-2">
        <select className="home-button w-full" value={value || ""} onChange={(e)=>onChange(e.target.value || null)}>
          <option value="">— Select Brand —</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          <option value="__add_new">+ Add Brand</option>
        </select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Brand</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Brand name" value={newName} onChange={(e)=>setNewName(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <Button onClick={saveNew}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* open dialog when user selects Add from select */}
      <SelectAddWatcher selected={value} onAddRequested={() => setOpen(true)} />
    </div>
  );
}

function SelectAddWatcher({ selected, onAddRequested }: { selected?: string | null; onAddRequested: () => void }) {
  useEffect(() => {
    if (selected === "__add_new") onAddRequested();
  }, [selected]);
  return null;
}

export function ModelSelect({ value, brandId, onChange }: { value?: string | null; brandId?: string | null; onChange: (val: string | null) => void; }) {
  const [models, setModels] = useState<{ id: string; name: string; model_number?: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandOptions, setBrandOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(brandId || null);
  const [newModelName, setNewModelName] = useState("");
  const [hasModelNumber, setHasModelNumber] = useState(false);
  const [newModelNumber, setNewModelNumber] = useState("");
  const { toast } = useToast();

  const load = async (bId?: string | null) => {
    if (!bId) return setModels([]);
    const { data, error } = await supabase.from("models").select("id,name,model_number").eq("brand_id", bId).order("name");
    if (error) return toast({ title: "Error loading models", description: error.message, variant: "destructive" });
    setModels(data || []);
  };

  useEffect(() => { setSelectedBrandId(brandId || null); load(brandId || null); }, [brandId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!brandSearch) return setBrandOptions([]);
      const { data } = await supabase.from("brands").select("id,name").ilike("name", `%${brandSearch}%`).limit(10);
      setBrandOptions(data || []);
    }, 200);
    return () => clearTimeout(timer);
  }, [brandSearch]);

  const saveNew = async () => {
    if (!newModelName.trim() || !selectedBrandId) return toast({ title: "Brand & Model required", variant: "destructive" });
    const payload: any = { name: newModelName.trim(), brand_id: selectedBrandId };
    if (hasModelNumber && newModelNumber.trim()) payload.model_number = newModelNumber.trim();
    const { data, error } = await supabase.from("models").insert(payload).select("id,name,model_number").maybeSingle();
    if (error) return toast({ title: "Error creating model", description: error.message, variant: "destructive" });
    setNewModelName("");
    setNewModelNumber("");
    setHasModelNumber(false);
    setOpen(false);
    await load(selectedBrandId);
    onChange(data.id);
    toast({ title: "Model added" });
  };

  return (
    <div>
      <Label>Model</Label>
      <div className="flex gap-2">
        <select className="home-button w-full" value={value || ""} onChange={(e)=>onChange(e.target.value || null)}>
          <option value="">— Select Model —</option>
          {models.map(m => <option key={m.id} value={m.id}>{m.name}{m.model_number?` (${m.model_number})` : ""}</option>)}
          <option value="__add_new">+ Add Model</option>
        </select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Search Brand</Label>
              <Input placeholder="Type to search brands" value={brandSearch} onChange={(e)=>setBrandSearch(e.target.value)} />
              <div className="max-h-36 overflow-auto border rounded p-2">
                {brandOptions.map(b => (
                  <div key={b.id} className={`p-1 cursor-pointer ${selectedBrandId===b.id?"bg-primary/10":""}`} onClick={()=>{ setSelectedBrandId(b.id); setBrandSearch(b.name); setBrandOptions([]); }}>
                    {b.name}
                  </div>
                ))}
              </div>

              <Input placeholder="Model name" value={newModelName} onChange={(e)=>setNewModelName(e.target.value)} />
              <div className="flex items-center gap-2">
                <input id="model-number-cb" type="checkbox" checked={hasModelNumber} onChange={(e)=>setHasModelNumber(e.target.checked)} />
                <label htmlFor="model-number-cb">Model Number</label>
              </div>
              {hasModelNumber && <Input placeholder="Model number" value={newModelNumber} onChange={(e)=>setNewModelNumber(e.target.value)} />}
              <div className="flex gap-2 justify-end">
                <Button onClick={saveNew}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <SelectAddWatcher selected={value} onAddRequested={() => setOpen(true)} />
    </div>
  );
}

export function CategorySelect({ value, onChange }: { value?: string | null; onChange: (val: string | null) => void; }) {
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();
  const load = async () => {
    const { data, error } = await supabase.from("categories").select("id,name").order("name");
    if (error) return toast({ title: "Error loading categories", description: error.message, variant: "destructive" });
    setCats(data || []);
  };
  useEffect(()=>{load();},[]);
  const saveNew = async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase.from("categories").insert({ name: newName.trim() }).select("id,name").maybeSingle();
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setNewName(""); setOpen(false); load(); onChange(data.id);
    toast({ title: "Category added" });
  };
  return (
    <div>
      <Label>Category</Label>
      <div className="flex gap-2">
        <select className="home-button w-full" value={value||""} onChange={(e)=>onChange(e.target.value||null)}>
          <option value="">— Select Category —</option>
          {cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="__add_new">+ Add Category</option>
        </select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Category name" value={newName} onChange={(e)=>setNewName(e.target.value)} />
              <div className="flex gap-2 justify-end"><Button onClick={saveNew}>Save</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <SelectAddWatcher selected={value} onAddRequested={()=>setOpen(true)} />
    </div>
  );
}

export function TagInput({ value, onChange }: { value?: string[]; onChange: (vals: string[]) => void }) {
  const [text, setText] = useState((value||[]).join(", "));
  useEffect(()=>{ setText((value||[]).join(", ")); }, [value]);
  return (
    <div>
      <Label>Tags</Label>
      <Input value={text} onChange={(e)=>{ setText(e.target.value); onChange(e.target.value.split(",").map(t=>t.trim()).filter(Boolean)); }} placeholder="comma separated tags" />
    </div>
  );
}
