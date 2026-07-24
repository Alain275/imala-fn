import { useTranslation } from "react-i18next"
import { BookOpen } from "lucide-react"
import { Header } from "@/components/header"
import { UnderDevelopmentBanner } from "@/components/UnderDevelopmentBanner"

export default function TrainingPage() {
  const { t } = useTranslation()

  return (
    <div className="farmer-workspace-page">
      <Header
        title={t("dashboard.training.pageTitle")}
        subtitle={t("dashboard.training.pageSubtitle")}
      />

      {/*
        The training dashboard, course catalogue, progress, and achievements
        are intentionally hidden while this area is under development.
      */}
      <UnderDevelopmentBanner
        icon={BookOpen}
        headline="Something great is"
        accent="growing here."
        description="We are preparing practical training experiences to help you build stronger farming skills. Courses, progress tracking, and certificates will be available soon."
        statusText="New learning tools are on the way"
      />
    </div>
  )
}
