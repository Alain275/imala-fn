import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Phone, UserSearch } from "lucide-react"
import { toast } from "sonner"
import { cooperativeApi, type CooperativeAgronomists } from "@/services/cooperative.service"

/**
 * The existing agronomist directory (`agronomist_profiles` — the same verified
 * rows /api/agronomists/directory serves), scoped by default to the
 * cooperative's own district. Not a duplicate list.
 */
export default function CooperativeAgronomistsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<CooperativeAgronomists | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const load = useCallback(async (all: boolean) => {
    setLoading(true)
    try {
      setData(await cooperativeApi.getAgronomists(all))
    } catch {
      toast.error(t("cooperative.agronomists.loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { void load(showAll) }, [load, showAll])

  return (
    <>
      <Header
        title={t("cooperative.agronomists.title")}
        subtitle={t("cooperative.agronomists.subtitle")}
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {data?.scopedToDistrict && data.district
              ? t("cooperative.agronomists.inDistrict", { district: data.district })
              : null}
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowAll(v => !v)}>
            {showAll
              ? t("cooperative.agronomists.showDistrict")
              : t("cooperative.agronomists.showAll")}
          </Button>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.agronomists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
              <UserSearch className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">{t("cooperative.agronomists.empty")}</p>
              <p className="text-sm text-muted-foreground">{t("cooperative.agronomists.emptyHint")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.agronomists.map(person => (
              <Card key={person.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{person.name}</CardTitle>
                  <CardDescription>
                    {person.specialization ?? "—"}
                    {person.district ? ` · ${person.district}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {person.yearsOfExperience != null && (
                    <p className="text-muted-foreground">
                      {t("cooperative.agronomists.experience")}: {person.yearsOfExperience}{" "}
                      {t("cooperative.agronomists.years")}
                    </p>
                  )}
                  {person.bio && <p className="line-clamp-3 text-muted-foreground">{person.bio}</p>}
                  <div className="space-y-1 pt-1">
                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="break-all">{person.email}</span>
                    </a>
                    {person.phone && (
                      <a
                        href={`tel:${person.phone}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {person.phone}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
