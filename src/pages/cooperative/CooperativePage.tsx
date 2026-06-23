import { Building2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

// TODO: cooperative portal — build full cooperative portal when backend endpoints are ready
export default function CooperativePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
        <Building2 className="w-10 h-10 text-white" />
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold text-foreground">Cooperative Portal</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The cooperative management portal is coming soon. Check back later or contact your administrator.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link to="/sign-in">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>
      </Button>
    </div>
  )
}
