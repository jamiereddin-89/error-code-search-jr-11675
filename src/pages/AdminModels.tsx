import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BrandSelect } from "@/components/admin/Selectors";

export default function AdminModels(){
  const [models, setModels] = useState<any[]>([]);
  const [brands, setBrands] = useState<{id:string;name:string}[]>([]);
  const [editing, setEditing] = useState<any|null>(null);
  const { toast } = useToast();

  useEffect(()=>{ load(); loadBrands(); },[]);

  async function load(){
    const { data, error } = await supabase.from('models').select('id,name,model_number,brand_id,brands(name)').order('name');
    if(error) return toast({ title: 'Error loading models', description: error.message, variant: 'destructive' });
    setModels(data||[]);
  }
  async function loadBrands(){
    const { data } = await supabase.from('brands').select('id,name').order('name');
    setBrands(data||[]);
  }

  async function save(){
    if(!editing) return;
    if(!editing.name?.trim() || !editing.brand_id) return toast({ title: 'Brand & name required', variant: 'destructive' });
    const payload = { name: editing.name.trim(), brand_id: editing.brand_id, model_number: editing.model_number || null };
    if(editing.id){
      const { error } = await supabase.from('models').update(payload).eq('id', editing.id);
      if(error) return toast({ title: 'Error updating model', description: error.message, variant: 'destructive' });
      toast({ title: 'Model updated' });
      try { (await import('@/lib/tracking')).log('Info', `Model updated: ${editing.name.trim()}`, { id: editing.id, brand_id: editing.brand_id }); } catch(e){}
    } else {
      const { data, error } = await supabase.from('models').insert(payload).select().maybeSingle();
      if(error) return toast({ title: 'Error creating model', description: error.message, variant: 'destructive' });
      toast({ title: 'Model created' });
      try { (await import('@/lib/tracking')).log('Info', `Model created: ${editing.name.trim()}`, { id: data?.id, brand_id: data?.brand_id }); } catch(e){}
    }
    setEditing(null); await load();
  }

  async function remove(id:string){
    if(!confirm('Delete this model?')) return;
    const { error } = await supabase.from('models').delete().eq('id', id);
    if(error) return toast({ title: 'Error deleting model', description: error.message, variant: 'destructive' });
    toast({ title: 'Model deleted' });
    await load();
  }

  return (
    <div className="page-container">
      <TopRightControls />
      <header className="flex items-center justify-between mb-8 w-full max-w-xl">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <button className="home-button" aria-label="Back to Admin">
              <ArrowLeft className="inline mr-2" /> Back
            </button>
          </Link>
          <Link to="/">
            <button className="home-button" aria-label="Go Home">
              <Home className="inline mr-2" /> Home
            </button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Models</h1>
        <div className="w-10" />
      </header>

      <div className="w-full max-w-xl">
        <Dialog open={!!editing} onOpenChange={(v)=>{ if(!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <button className="nav-button flex items-center gap-2" onClick={()=>setEditing({ name: '', brand_id: undefined })}>
              <Plus size={16} /> Add Model
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.id ? 'Edit Model' : 'Add Model'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Brand</Label>
              <BrandSelect value={editing?.brand_id||null} onChange={(val)=>setEditing({...editing, brand_id: val})} />
              <Label>Name</Label>
              <Input value={editing?.name||''} onChange={(e)=>setEditing({...editing, name: e.target.value})} />
              <Label>Model Number</Label>
              <Input value={editing?.model_number||''} onChange={(e)=>setEditing({...editing, model_number: e.target.value})} />
              <div className="flex gap-2 justify-end">
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-2 mt-4">
          {models.map(m=> (
            <div key={m.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{m.name}{m.model_number?` (${m.model_number})`:''}</div>
                <div className="text-sm text-muted-foreground">{m.brands?.name||''}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={()=>setEditing({ id: m.id, name: m.name, model_number: m.model_number, brand_id: m.brand_id })} aria-label="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={()=>remove(m.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
