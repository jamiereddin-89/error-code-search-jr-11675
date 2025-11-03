import { useState, useEffect } from "react";
import { QrCode, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { Card } from "./ui/card";

interface Equipment {
  id: string;
  qr_code: string;
  system_name: string;
  model: string;
  serial_number: string;
  installation_date: string;
  location: string;
  notes: string;
}

export const EquipmentScanner = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [foundEquipment, setFoundEquipment] = useState<Equipment | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    qr_code: "",
    system_name: "",
    model: "",
    serial_number: "",
    installation_date: "",
    location: "",
    notes: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  useEffect(() => {
    loadEquipment();
  }, []);

  function formatError(err: any) {
    try {
      if (!err) return 'Unknown error';
      if (typeof err === 'string') return err;
      if (err.message) return String(err.message);
      if (err.error) return String(err.error);
      if (err.status) return `${err.status} ${err.statusText || ''}`;
      return JSON.stringify(err);
    } catch (e) {
      return String(err);
    }
  }

  const loadEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading equipment:", error);
        toast({ title: "Error loading equipment", description: formatError(error), variant: "destructive" });
        setEquipment([]);
        return;
      }

      setEquipment(data || []);
    } catch (err: any) {
      console.error("Error loading equipment (exception):", err);
      toast({ title: "Error loading equipment", description: formatError(err), variant: "destructive" });
      setEquipment([]);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setFoundEquipment(null);
      return;
    }

    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("qr_code", searchCode.trim())
      .single();

    if (error || !data) {
      toast({
        title: "Equipment not found",
        description: "No equipment found with this QR code",
        variant: "destructive",
      });
      setFoundEquipment(null);
      return;
    }

    setFoundEquipment(data);
    toast({
      title: "Equipment found",
      description: `${data.system_name} - ${data.model}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add equipment",
        variant: "destructive",
      });
      return;
    }

    let storagePath = null;

    try {
      if (selectedImage) {
        if (!ALLOWED_TYPES.includes(selectedImage.type)) {
          toast({ title: "Invalid file type", description: "Only JPG, PNG, WEBP allowed", variant: "destructive" });
          return;
        }
        if (selectedImage.size > MAX_FILE_SIZE) {
          toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
          return;
        }

        const fileName = `${user.id}/${Date.now()}_${selectedImage.name}`;
        const { error: uploadError } = await supabase.storage.from("equipment-photos").upload(fileName, selectedImage);
        if (uploadError) throw uploadError;
        storagePath = fileName;
      }

      const { error } = await supabase.from("equipment").insert({
        user_id: user.id,
        ...formData,
        image_path: storagePath,
      });

      if (error) {
        toast({
          title: "Error adding equipment",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Equipment added",
          description: "Equipment has been registered successfully",
        });
        setFormData({
          qr_code: "",
          system_name: "",
          model: "",
          serial_number: "",
          installation_date: "",
          location: "",
          notes: "",
        });
        setSelectedImage(null);
        setPreview("");
        loadEquipment();
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Scan equipment QR code">
          <QrCode className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Equipment Scanner</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          <h3 className="font-semibold">Scan Equipment</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR/Barcode"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {foundEquipment && (
            <Card className="p-4">
              <h4 className="font-medium mb-2">{foundEquipment.system_name}</h4>
              <div className="text-sm space-y-1">
                <p>Model: {foundEquipment.model}</p>
                <p>Serial: {foundEquipment.serial_number}</p>
                <p>Location: {foundEquipment.location}</p>
                {foundEquipment.installation_date && (
                  <p>Installed: {foundEquipment.installation_date}</p>
                )}
              </div>
            </Card>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold">Register New Equipment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qr_code">QR/Barcode *</Label>
              <Input
                id="qr_code"
                value={formData.qr_code}
                onChange={(e) =>
                  setFormData({ ...formData, qr_code: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="system_name">System Name *</Label>
              <Input
                id="system_name"
                value={formData.system_name}
                onChange={(e) =>
                  setFormData({ ...formData, system_name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Upload Image (optional)</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => document.getElementById("equip-photo-input")?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                Select Image
              </Button>
              <input
                id="equip-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSelectedImage(f);
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result as string);
                    reader.readAsDataURL(f);
                  }
                }}
              />
              {selectedImage && <span className="text-sm">{selectedImage.name}</span>}
            </div>
            {preview && <img src={preview} className="mt-2 max-h-40 rounded" />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="installation_date">Installation Date</Label>
              <Input
                id="installation_date"
                type="date"
                value={formData.installation_date}
                onChange={(e) =>
                  setFormData({ ...formData, installation_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Register Equipment
          </Button>
        </form>

        <div className="space-y-2">
          <h3 className="font-semibold">Registered Equipment</h3>
          {equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No equipment registered yet
            </p>
          ) : (
            equipment.slice(0, 5).map((eq) => (
              <Card key={eq.id} className="p-3">
                <p className="font-medium text-sm">
                  {eq.system_name} - {eq.model}
                </p>
                <p className="text-xs text-muted-foreground">
                  QR: {eq.qr_code}
                </p>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
