import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle, ShieldCheck, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";
import { Icon3D } from "@/components/icon-3d";
import {
  agronomistService,
  type AgronomistFullProfile,
  type AgronomistProfileUpdatePayload,
} from "@/services/agronomist.service";

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgronomistProfilePage() {
  const [profile, setProfile] = useState<AgronomistFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Required<AgronomistProfileUpdatePayload>>({
    district: "",
    sector: "",
    yearsOfExperience: 0,
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(() => {
    setLoading(true);
    setError(null);
    agronomistService.getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          district: data.agronomistProfile?.district || "",
          sector: data.agronomistProfile?.sector || "",
          yearsOfExperience: data.agronomistProfile?.yearsOfExperience || 0,
          bio: data.agronomistProfile?.bio || "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load agronomist profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await agronomistService.updateMyProfile(form);
      setProfile((prev) => (prev ? { ...prev, agronomistProfile: updated } : prev));
      toast.success("Agronomist profile saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save agronomist profile");
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
      <div className="p-3 sm:p-6">
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <Card className="border-0 shadow-md max-w-4xl">
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={loadProfile}>Retry</Button>
            </CardContent>
          </Card>
        ) : profile && (
          <div className="space-y-6 max-w-4xl">
            {/* Identity summary */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex flex-wrap items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {getInitials(profile.name)}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.email} · {profile.phone}</p>
                    {profile.location && <p className="text-xs text-muted-foreground mt-0.5">{profile.location}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary" className="capitalize">{profile.role}</Badge>
                    {profile.isEmailVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Email verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                        <AlertCircle className="w-3 h-3 mr-1" /> Email not verified
                      </Badge>
                    )}
                    {profile.agronomistProfile?.isVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified agronomist
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Verification pending
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={profile.isActive
                        ? "text-emerald-600 border-emerald-300 dark:border-emerald-700"
                        : "text-muted-foreground"}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Member since {new Date(profile.createdAt).toLocaleDateString()} · Last login {new Date(profile.lastLogin).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Read-only registration details */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="earth" size="sm">
                    <User className="w-4 h-4" />
                  </Icon3D>
                  Registration details
                </CardTitle>
                <CardDescription>Set at registration — contact an administrator to change these.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Specialization</Label>
                  <Input value={profile.agronomistProfile?.specialization || "—"} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Certification number</Label>
                  <Input value={profile.agronomistProfile?.certificationNumber || "—"} disabled />
                </div>
              </CardContent>
            </Card>

            {/* Editable location + expertise */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Location and expertise</CardTitle>
                <CardDescription>Your district, sector, and experience help farmers find the right agronomist nearby.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ap-district">District</Label>
                    <Input id="ap-district" placeholder="District" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ap-sector">Sector</Label>
                    <Input id="ap-sector" placeholder="Sector" value={form.sector} onChange={(e) => setForm((prev) => ({ ...prev, sector: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="ap-years">Years of experience</Label>
                    <Input id="ap-years" placeholder="Years of experience" type="number" min={0} value={String(form.yearsOfExperience)} onChange={(e) => setForm((prev) => ({ ...prev, yearsOfExperience: Number(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ap-bio">Bio</Label>
                  <Textarea id="ap-bio" placeholder="Short bio and support focus" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
                </div>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
