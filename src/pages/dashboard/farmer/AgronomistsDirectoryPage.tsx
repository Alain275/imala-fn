import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agronomistService, AgronomistDirectoryEntry } from "@/services/agronomist.service";
import { agroDealerMarketplaceService } from "@/services/agroDealerMarketplace.service";
import { authService } from "@/services/auth";

export default function AgronomistsDirectoryPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [agronomists, setAgronomists] = useState<AgronomistDirectoryEntry[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgronomists() {
      try {
        const result = await agronomistService.getDirectory();
        setAgronomists(result);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load agronomists");
      }
    }

    loadAgronomists();
  }, []);

  const sortedAgronomists = useMemo(() => {
    const location = (currentUser?.location || "").toLowerCase();
    return [...agronomists].sort((a, b) => {
      const aNear = location && ((a.agronomistProfile?.district || a.location || "").toLowerCase().includes(location));
      const bNear = location && ((b.agronomistProfile?.district || b.location || "").toLowerCase().includes(location));
      return Number(bNear) - Number(aNear);
    });
  }, [agronomists, currentUser?.location]);

  async function startChat(agronomist: AgronomistDirectoryEntry) {
    try {
      const conversation = await agroDealerMarketplaceService.startConversation({
        agronomistId: agronomist.id,
        topicName: agronomist.agronomistProfile?.specialization || "Agronomist support",
        initialMessage: `Hello, I need advice related to ${agronomist.agronomistProfile?.specialization || "farming support"}.`,
      });
      navigate(`/dashboard/dealer-messages?conversation=${conversation.id}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to open agronomist chat");
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Agronomists Nearby"
        subtitle="Choose a nearby agronomist, review their location and specialization, then open a direct chat."
      />
      <div className="p-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Available agronomists</CardTitle>
            <CardDescription>Farmers can compare district, specialization, and experience before starting a conversation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedAgronomists.map((agronomist) => {
              const nearby =
                currentUser?.location &&
                ((agronomist.agronomistProfile?.district || agronomist.location || "")
                  .toLowerCase()
                  .includes(currentUser.location.toLowerCase()));
              return (
                <div key={agronomist.id} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{agronomist.name}</p>
                      <p className="text-sm text-muted-foreground">{agronomist.agronomistProfile?.district || agronomist.location || "Unknown location"}</p>
                    </div>
                    {nearby ? <Badge>Nearby</Badge> : null}
                  </div>
                  <p className="text-sm">{agronomist.agronomistProfile?.specialization || "General agronomy"}</p>
                  <p className="text-sm text-muted-foreground">{agronomist.agronomistProfile?.bio || "No bio yet."}</p>
                  <p className="text-sm text-muted-foreground">
                    {agronomist.agronomistProfile?.yearsOfExperience || 0} years experience · {agronomist.agronomistProfile?.sector || "Sector not set"}
                  </p>
                  <Button className="w-full" onClick={() => startChat(agronomist)}>
                    Chat agronomist
                  </Button>
                </div>
              );
            })}
            {sortedAgronomists.length === 0 ? <p className="text-sm text-muted-foreground">{status || "No agronomists available yet."}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
