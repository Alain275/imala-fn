import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import agroDealerProfileService, { AgroDealerProfileData } from "@/services/agroDealerProfile.service";
import { authService } from "@/services/auth";

const CATEGORY_OPTIONS = [
  "manure",
  "fertilizer",
  "pesticide",
  "seed",
  "veterinary",
  "other",
] as const;

const LANGUAGE_OPTIONS = [
  "Kinyarwanda",
  "English",
  "French",
  "Swahili",
] as const;

const PAYMENT_OPTIONS = [
  "Cash",
  "Mobile Money",
  "Bank Transfer",
  "Card",
  "Credit",
] as const;

export default function DealerProfilePage() {
  const currentUser = authService.getCurrentUser();
  const [profile, setProfile] = useState<AgroDealerProfileData>({
    businessName: "",
    ownerFullName: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
    district: "",
    physicalAddress: currentUser?.location ?? "",
    description: "",
    licenseNumber: "",
    tin: "",
    categories: [],
    languages: [],
    paymentMethods: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await agroDealerProfileService.getProfile();
        const data = response.data as AgroDealerProfileData;
        setProfile((prev) => ({ ...prev, ...data }));
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const summaryBadges = useMemo(
    () => [
      ...(profile.categories || []),
      ...(profile.languages || []).map((language) => `Language: ${language}`),
    ],
    [profile.categories, profile.languages]
  );

  function toggleArrayField(field: "categories" | "languages" | "paymentMethods", value: string) {
    setProfile((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter((item) => item !== value) : [...current, value],
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const payload: Partial<AgroDealerProfileData> = {
        ...profile,
      };
      const response = await agroDealerProfileService.updateProfile(payload);
      setProfile(response.data);
      setStatus("Profile saved successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (currentUser?.role !== "agro-dealer") {
    return <div className="p-6">Only agro-dealers can manage this page.</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Agro-Dealer Profile"
        subtitle="Show farmers your business identity, working location, and trusted contact details."
      />

      <div className="p-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>These details appear when farmers open your profile or contact you from a product listing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Business name"
                value={profile.businessName || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, businessName: e.target.value }))}
              />
              <Input
                placeholder="Owner full name"
                value={profile.ownerFullName || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, ownerFullName: e.target.value }))}
              />
              <Input
                placeholder="Phone number"
                value={profile.phone || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Email"
                value={profile.email || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="District"
                value={profile.district || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, district: e.target.value }))}
              />
              <Input
                placeholder="Working location"
                value={profile.physicalAddress || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, physicalAddress: e.target.value }))}
              />
              <Input
                placeholder="License number"
                value={profile.licenseNumber || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              />
              <Input
                placeholder="TIN / tax identity"
                value={profile.tin || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, tin: e.target.value }))}
              />
            </div>

            <Textarea
              placeholder="Describe your shop, the inputs you provide, and how farmers can work with you."
              value={profile.description || ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Categories you deal in</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => {
                  const active = profile.categories?.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayField("categories", option)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-border hover:bg-muted"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Languages</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((option) => {
                  const active = profile.languages?.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayField("languages", option)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-border hover:bg-muted"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment methods</p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const active = profile.paymentMethods?.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayField("paymentMethods", option)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-border hover:bg-muted"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? "Saving..." : "Save profile"}
              </Button>
              {status && <p className="text-sm text-muted-foreground">{status}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Public Preview</CardTitle>
            <CardDescription>This is the kind of information farmers will see when deciding to contact you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xl font-semibold">{profile.businessName || currentUser?.name || "Your business name"}</p>
              <p className="text-sm text-muted-foreground">{profile.ownerFullName || currentUser?.name}</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{profile.physicalAddress || "No working address yet"}</p>
              <p>{profile.district || currentUser?.location || "No district yet"}</p>
              <p>{profile.phone || currentUser?.phone || "No phone yet"}</p>
              <p>{profile.email || currentUser?.email || "No email yet"}</p>
            </div>
            <p className="text-sm">{profile.description || "Add a short description so farmers know what you stock and how you serve them."}</p>
            <div className="flex flex-wrap gap-2">
              {summaryBadges.length > 0 ? (
                summaryBadges.map((badge) => <Badge key={badge} variant="secondary">{badge}</Badge>)
              ) : (
                <p className="text-sm text-muted-foreground">Add categories and languages to strengthen your profile.</p>
              )}
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-medium">System identities</p>
              <p>Name: {currentUser?.name}</p>
              <p>Email: {currentUser?.email}</p>
              <p>Role: {currentUser?.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
