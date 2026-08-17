import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { HelpCircle, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { toast } from "sonner"
import {
  agronomistQuestionsService, type Question, type QuestionStatus,
} from "@/services/agronomistQuestions.service"

const STATUS_FILTERS: Array<QuestionStatus | 'all'> = ['all', 'pending', 'answered', 'closed']

const STATUS_BADGE: Record<QuestionStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  answered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  closed: "bg-muted text-muted-foreground border-border",
}

export default function AgronomistQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const limit = 10

  const [selected, setSelected] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    agronomistQuestionsService.getQuestions({ page, limit, status: statusFilter === 'all' ? undefined : statusFilter })
      .then(({ questions, pagination }) => { setQuestions(questions); setTotal(pagination.total) })
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [statusFilter])

  const openQuestion = (q: Question) => {
    setSelected(q)
    setAnswer(q.answer || "")
  }

  const handleAnswer = async () => {
    if (!selected || !answer.trim()) {
      toast.error("Please write an answer before submitting")
      return
    }
    setSaving(true)
    try {
      await agronomistQuestionsService.answerQuestion(selected.id, answer.trim())
      toast.success("Answer submitted")
      setSelected(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit answer")
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-background">
      <Header title="Questions" subtitle="Answer questions submitted by farmers" />

      <div className="p-3 sm:p-6 space-y-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="w-4 h-4" /> Farmer Questions
              {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HelpCircle className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No questions from farmers yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Questions submitted by farmers will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {questions.map(q => (
                <button
                  key={q.id}
                  onClick={() => openQuestion(q)}
                  className="w-full text-left p-4 sm:px-6 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{q.farmer.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{q.question}</p>
                    {q.answer && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Last answered by {q.answeredByName} · {new Date(q.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize flex-shrink-0 ${STATUS_BADGE[q.status]}`}>{q.status}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="text-xs text-foreground font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.farmer.name}</DialogTitle>
            <DialogDescription>{selected?.farmer.email}{selected?.category ? ` · ${selected.category}` : ""}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Question</p>
              <p className="text-sm text-foreground">{selected?.question}</p>
            </div>

            {selected?.answer && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  This question already has an answer from {selected.answeredByName} ({new Date(selected.updatedAt).toLocaleString()}).
                  Submitting a new answer replaces it — there is no answer history.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Your answer</Label>
              <Textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write your answer to this farmer..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleAnswer} disabled={saving}>{saving ? "Submitting…" : "Submit answer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
