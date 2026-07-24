import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BadgeCheck, BriefcaseBusiness, MapPin, MessageSquare, Search, Stethoscope } from "lucide-react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { agronomistService, type AgronomistDirectoryEntry } from "@/services/agronomist.service"
import { agroDealerMarketplaceService } from "@/services/agroDealerMarketplace.service"
import { authService } from "@/services/auth"

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).filter(Boolean).join("").slice(0, 2).toUpperCase()
}

export default function AgronomistsDirectoryPage() {
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  const [agronomists, setAgronomists] = useState<AgronomistDirectoryEntry[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    async function loadAgronomists() {
      try {
        setAgronomists(await agronomistService.getDirectory())
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load agronomists")
      }
    }
    void loadAgronomists()
  }, [])

  const visibleAgronomists = useMemo(() => {
    const location = (currentUser?.location || "").toLowerCase()
    const term = query.trim().toLowerCase()
    return [...agronomists]
      .filter((item) =>
        !term ||
        [item.name, item.location, item.agronomistProfile?.district, item.agronomistProfile?.sector, item.agronomistProfile?.specialization]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      )
      .sort((a, b) => {
        const aNear = location && (a.agronomistProfile?.district || a.location || "").toLowerCase().includes(location)
        const bNear = location && (b.agronomistProfile?.district || b.location || "").toLowerCase().includes(location)
        return Number(bNear) - Number(aNear)
      })
  }, [agronomists, currentUser?.location, query])

  async function startChat(agronomist: AgronomistDirectoryEntry) {
    try {
      const conversation = await agroDealerMarketplaceService.startConversation({
        agronomistId: agronomist.id,
        topicName: agronomist.agronomistProfile?.specialization || "Agronomist support",
        initialMessage: `Hello, I need advice related to ${agronomist.agronomistProfile?.specialization || "farming support"}.`,
      })
      navigate(`/dashboard/dealer-messages?conversation=${conversation.id}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to open agronomist chat")
    }
  }

  return (
    <div className="farmer-workspace-page">
      <Header title="Agronomists Nearby" subtitle="Find qualified agricultural support and start a direct conversation." />

      <main className="mx-auto max-w-7xl space-y-5 p-3 pb-28 sm:p-6 lg:p-8 lg:pb-8">
        <section className="grid gap-4 border border-[#d7e5da] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5 dark:border-[#2b4235] dark:bg-[#17271e]">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#477326]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8fe82e]" /> Advisory network
            </p>
            <h2 className="mt-2 text-lg font-black text-[#21392b] dark:text-[#edf5ef]">{agronomists.length} specialists available</h2>
            <p className="mt-1 text-xs text-[#6a7e70]">Professionals near your location are shown first.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7e70]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, district, or specialty…" className="pl-10" />
          </div>
        </section>

        {status && <div className="border-l-2 border-[#d51f2c] bg-[#fff3f3] px-4 py-3 text-xs text-[#a81722]">{status}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleAgronomists.map((agronomist) => {
            const place = agronomist.agronomistProfile?.district || agronomist.location || "Location not set"
            const nearby = Boolean(currentUser?.location && place.toLowerCase().includes(currentUser.location.toLowerCase()))
            return (
              <article key={agronomist.id} className="flex flex-col border border-[#d7e5da] bg-white p-5 shadow-[0_7px_24px_rgba(35,72,50,.04)] dark:border-[#2b4235] dark:bg-[#17271e]">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#153923] text-xs font-black text-[#b5ff62]">{initials(agronomist.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-black text-[#21392b] dark:text-[#edf5ef]">{agronomist.name}</h3>
                      <BadgeCheck className="h-4 w-4 shrink-0 text-[#477326]" />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#6a7e70]"><MapPin className="h-3 w-3" /> {place}</p>
                  </div>
                  {nearby && <span className="bg-[#e9f8dd] px-2 py-1 text-[8px] font-black uppercase tracking-wide text-[#315900]">Nearby</span>}
                </div>

                <div className="mt-5 border-y border-[#e3ece5] py-4 dark:border-[#2b4235]">
                  <p className="flex items-center gap-2 text-xs font-bold text-[#365541] dark:text-[#c8d5cc]">
                    <Stethoscope className="h-4 w-4 text-[#477326]" />
                    {agronomist.agronomistProfile?.specialization || "General agronomy"}
                  </p>
                  <p className="mt-2 line-clamp-3 min-h-[54px] text-xs leading-[18px] text-[#647b6b]">
                    {agronomist.agronomistProfile?.bio || "Available to provide practical farming advice and crop support."}
                  </p>
                </div>

                <p className="mt-4 flex items-center gap-2 text-[10px] text-[#647b6b]">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  {agronomist.agronomistProfile?.yearsOfExperience || 0} years experience
                  <span className="text-[#b3c2b6]">•</span>
                  {agronomist.agronomistProfile?.sector || "Sector not set"}
                </p>
                <Button className="mt-5 w-full bg-[#315900] text-[#b5ff62] hover:bg-[#254500]" onClick={() => startChat(agronomist)}>
                  <MessageSquare className="h-4 w-4" /> Start conversation
                </Button>
              </article>
            )
          })}
        </section>

        {visibleAgronomists.length === 0 && (
          <section className="grid min-h-64 place-items-center border border-dashed border-[#b9ccbd] bg-white/60 p-8 text-center dark:bg-[#17271e]/60">
            <div><Stethoscope className="mx-auto h-9 w-9 text-[#64806e]" /><h3 className="mt-4 font-black">No specialists found</h3><p className="mt-1 text-xs text-[#6a7e70]">Try another district or specialty.</p></div>
          </section>
        )}
      </main>
    </div>
  )
}
