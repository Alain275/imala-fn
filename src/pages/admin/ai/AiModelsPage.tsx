import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, MoreHorizontal, Rocket, Archive, CheckCircle2, Info } from "lucide-react"
import { toast } from "sonner"
import { adminAiService, type AiModel } from "@/services/adminAiMock"

type ActionType = 'deploy' | 'archive' | null
interface PendingAction { type: ActionType; model: AiModel }

const STATUS_STYLE: Record<AiModel['status'], string> = {
  staged: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40',
  deployed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  archived: 'bg-muted text-muted-foreground border-border',
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{(value * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function AiModelsPage() {
  const [models, setModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    adminAiService.getModels()
      .then(setModels)
      .finally(() => setLoading(false))
  }, [])

  const deployedModel = models.find(m => m.status === 'deployed')

  const handleConfirm = async () => {
    if (!pending) return
    setActionLoading(true)
    try {
      let updated: AiModel[]
      if (pending.type === 'deploy') {
        updated = await adminAiService.deployModel(pending.model.id)
        toast.success(`Model ${pending.model.version} deployed. Previous model moved to staged.`)
      } else {
        updated = await adminAiService.archiveModel(pending.model.id)
        toast.success(`Model ${pending.model.version} archived.`)
      }
      setModels(updated)
      setPending(null)
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Model Registry" subtitle="Version history, deployment control, and model metrics" />

      <div className="p-6 space-y-6">
        {/* Currently deployed banner */}
        {!loading && deployedModel && (
          <Card className="border-0 shadow-md bg-emerald-500/5 border border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Currently Deployed: {deployedModel.version}
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  {deployedModel.description} · Deployed {deployedModel.deployedAt}
                </p>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div><p className="text-xs text-muted-foreground">Accuracy</p><p className="font-bold text-emerald-600 dark:text-emerald-400">{(deployedModel.accuracy * 100).toFixed(1)}%</p></div>
                <div><p className="text-xs text-muted-foreground">F1</p><p className="font-bold text-foreground">{(deployedModel.f1Score * 100).toFixed(1)}%</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model list */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              All Versions
            </CardTitle>
            <CardDescription>Only one model can be deployed at a time. Deploy a new model to automatically move the current one to staged.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {models.map(model => (
                  <div key={model.id} className="flex items-start gap-4 px-6 py-5 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="font-semibold text-foreground">{model.version}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${STATUS_STYLE[model.status]}`}>
                          {model.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{model.description}</p>
                      <div className="flex items-center gap-6">
                        <MetricCell label="Accuracy" value={model.accuracy} />
                        <MetricCell label="Precision" value={model.precision} />
                        <MetricCell label="Recall" value={model.recall} />
                        <MetricCell label="F1 Score" value={model.f1Score} />
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Trained</p>
                          <p className="text-sm font-medium text-foreground">{model.trainedAt}</p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info(`Details for ${model.version} — coming soon`)}>
                          <Info className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {model.status !== 'deployed' && model.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => setPending({ type: 'deploy', model })}>
                            <Rocket className="w-4 h-4 mr-2" /> Deploy
                          </DropdownMenuItem>
                        )}
                        {model.status === 'deployed' && (
                          <DropdownMenuItem onClick={() => toast.info('To rollback, deploy a previous staged model.')}>
                            <Rocket className="w-4 h-4 mr-2" /> Rollback
                          </DropdownMenuItem>
                        )}
                        {model.status !== 'archived' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setPending({ type: 'archive', model })} className="text-muted-foreground">
                              <Archive className="w-4 h-4 mr-2" /> Archive
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={!!pending} onOpenChange={open => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.type === 'deploy' ? `Deploy ${pending.model.version}?` : `Archive ${pending?.model.version}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.type === 'deploy'
                ? `This will deploy ${pending.model.version} and move the current model (${deployedModel?.version ?? '—'}) to staged. Farmer predictions will immediately use the new model.`
                : `This will archive ${pending?.model.version}. It can be restored by an admin.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={actionLoading}
              className={pending?.type === 'deploy' ? '' : 'bg-muted text-foreground hover:bg-muted/80'}
            >
              {actionLoading ? 'Processing…' : pending?.type === 'deploy' ? 'Deploy Model' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
