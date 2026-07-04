import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { agronomistService } from "@/services/agronomist.service";

export default function AgronomistProfilePage() {
  const [form, setForm] = useState({
    district: "",
    sector: "",
    specialization: "",
    yearsOfExperience: 0,
    bio: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await agronomistService.getMyProfile();
        const profile = data.agronomistProfile || {};
        setForm({
          district: profile.district || "",
          sector: profile.sector || "",
          specialization: profile.specialization || "",
          yearsOfExperience: profile.yearsOfExperience || 0,
          bio: profile.bio || "",
        });
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load agronomist profile");
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      await agronomistService.updateMyProfile(form);
      setStatus("Agronomist profile saved successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save agronomist profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Agronomist Profile"
        subtitle="Add your working location so farmers can choose the nearest agronomist and chat with you."
      />
      <div className="p-6">
        <Card className="border-0 shadow-md max-w-4xl">
          <CardHeader>
            <CardTitle>Location and expertise</CardTitle>
            <CardDescription>Your district, sector, and specialization help farmers find the right agronomist nearby.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="District" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
              <Input placeholder="Sector" value={form.sector} onChange={(e) => setForm((prev) => ({ ...prev, sector: e.target.value }))} />
              <Input placeholder="Specialization" value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} />
              <Input placeholder="Years of experience" type="number" value={String(form.yearsOfExperience)} onChange={(e) => setForm((prev) => ({ ...prev, yearsOfExperience: Number(e.target.value) || 0 }))} />
            </div>
            <Textarea placeholder="Short bio and support focus" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
              {status && <p className="text-sm text-muted-foreground">{status}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
