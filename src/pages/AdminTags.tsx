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

export default function AdminTags(){
  const [items, setItems] = useState<{id:string;name:string}[]>([]);
  const [editing, setEditing] = useState<{id?:string;name:string}|null>(null);
  const { toast } = useToast();

  useEffect(()=>{ load(); },[]);
  async function load(){
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if(error) return toast({ title: 'Error loading tags', description: error.message, variant: 'destructive' });
    setItems(data||[]);
  }
  async function save(){
    if(!editing) return;
    if(!editing.name.trim()) return toast({ title: 'Name required', variant: 'destructive' });
    if(editing.id){
      const { error } = await supabase.from('tags').update({ name: editing.name.trim() }).eq('id', editing.id);
      if(error) return toast({ title: 'Error updating tag', description: error.message, variant: 'destructive' });
      toast({ title: 'Tag updated' });
    } else {
      const { error } = await supabase.from('tags').insert({ name: editing.name.trim() });
      if(error) return toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
      toast({ title: 'Tag created' });
    }
    setEditing(null); await load();
  }
  async function remove(id:string){
    if(!confirm('Delete this tag?')) return;
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if(error) return toast({ title: 'Error deleting tag', description: error.message, variant: 'destructive' });
    toast({ title: 'Tag deleted' }); await load();
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
        <h1 className="text-2xl font-bold">Tags</h1>
        <div className="w-10" />
      </header>

      <div className="w-full max-w-xl">
        <Dialog open={!!editing} onOpenChange={(v)=>{ if(!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <button className="nav-button flex items-center gap-2" onClick={()=>setEditing({ name: '' })}>
              <Plus size={16} /> Add Tag
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.id ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editing?.name||''} onChange={(e)=>setEditing(editing?{...editing, name: e.target.value}:{name:e.target.value})} />
              <div className="flex gap-2 justify-end">
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-2 mt-4">
          {items.map(i=> (
            <div key={i.id} className="p-3 border rounded flex justify-between items-center">
              <div>{i.name}</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={()=>setEditing({ id: i.id, name: i.name })} aria-label="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={()=>remove(i.id)} aria-label="Delete">
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
