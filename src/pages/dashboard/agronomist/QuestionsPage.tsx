import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  MessageSquare,
  Search,
  Filter,
  User,
  Calendar,
  Tag,
} from "lucide-react"
import {
  useQuestionsList,
  useQuestion,
  useAnswerQuestion,
} from "@/hooks/useQuestions"
import type {
  Question,
  QuestionStatus,
  AnswerQuestionInput,
} from "@/services/questions"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusBadge(status: QuestionStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      )
    case "answered":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Answered
        </Badge>
      )
    case "closed":
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
          <XCircle className="w-3 h-3 mr-1" /> Closed
        </Badge>
      )
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  gradient: "green" | "sky" | "gold" | "earth" | "leaf"
  icon: React.ReactNode
  value: string | number
  label: string
  loading?: boolean
}

function StatCard({ gradient, icon, value, label, loading }: StatCardProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Icon3D gradient={gradient} size="md">{icon}</Icon3D>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Answer Form ───────────────────────────────────────────────────────────────

interface AnswerFormProps {
  question: Question
  submitting: boolean
  onSubmit: (answer: string) => void
  onCancel: () => void
}

function AnswerQuestionForm({ question, submitting, onSubmit, onCancel }: AnswerFormProps) {
  const [answer, setAnswer] = useState("")

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer")
      return
    }
    onSubmit(answer)
  }

  return (
    <>
      <div className="py-4 space-y-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium text-muted-foreground mb-1">Question:</p>
          <p className="text-foreground">{question.question}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {question.farmerName || question.farmerId}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {question.category}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="answer">Your Answer</Label>
          <Textarea
            id="answer"
            placeholder="Provide your expert advice to the farmer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Answer"}
        </Button>
      </div>
    </>
  )
}

// ── View Question Dialog ──────────────────────────────────────────────────────

function ViewQuestionDialog({
  questionId,
  onClose,
  onAnswer,
}: {
  questionId: string | null
  onClose: () => void
  onAnswer: (question: Question) => void
}) {
  const { data: question, loading } = useQuestion(questionId ?? "")

  return (
    <Dialog open={!!questionId} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
        ) : question ? (
          <div className="py-2 space-y-5">
            {/* Header */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    {question.category}
                  </p>
                  <p className="font-semibold text-foreground text-base leading-tight">
                    {question.question}
                  </p>
                </div>
                {statusBadge(question.status)}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {question.farmerName || question.farmerId}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(question.createdAt)}
                </span>
              </div>
            </div>

            {/* Answer if available */}
            {question.answer && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Answer
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    {question.answer}
                  </p>
                  {question.answeredAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Answered on {formatDate(question.answeredAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Farmer location */}
            {(question.farmerDistrict || question.farmerSector) && (
              <div className="text-sm text-muted-foreground">
                📍 {[question.farmerSector, question.farmerDistrict]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}

            {question.status === "pending" && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => { onClose(); onAnswer(question) }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Answer Question
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Could not load question details.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuestionsPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "">("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [search, setSearch] = useState("")

  // Dialog state
  const [viewId, setViewId] = useState<string | null>(null)
  const [answeringQuestion, setAnsweringQuestion] = useState<Question | null>(null)

  // Data
  const { data: questionsData, loading, refetch } = useQuestionsList({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  })

  const questionsList: Question[] = questionsData?.questions ?? []

  // Mutations
  const { mutate: answerQuestionFn, loading: answering } = useAnswerQuestion()

  // Derived stats
  const total = questionsData?.total ?? questionsList.length
  const pending = questionsList.filter(q => q.status === "pending").length
  const answered = questionsList.filter(q => q.status === "answered").length
  const closed = questionsList.filter(q => q.status === "closed").length

  // Unique categories for filter
  const categories = useMemo(() => {
    const unique = new Set(questionsList.map(q => q.category).filter(Boolean))
    return Array.from(unique)
  }, [questionsList])

  // Client-side search filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return questionsList
    return questionsList.filter(
      a =>
        a.question.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.farmerName?.toLowerCase().includes(q) ||
        a.farmerDistrict?.toLowerCase().includes(q)
    )
  }, [questionsList, search])

  // Handlers
  const handleAnswer = (id: string, body: AnswerQuestionInput) => {
    answerQuestionFn(id, body, () => { 
      setAnsweringQuestion(null)
      setViewId(null)
      refetch()
    })
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Farmer Questions"
        subtitle="View and answer questions from farmers in your area"
      />

      <div className="p-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            gradient="sky"
            icon={<HelpCircle className="w-6 h-6" />}
            value={total}
            label="Total Questions"
            loading={loading}
          />
          <StatCard
            gradient="gold"
            icon={<Clock className="w-6 h-6" />}
            value={pending}
            label="Pending"
            loading={loading}
          />
          <StatCard
            gradient="green"
            icon={<CheckCircle2 className="w-6 h-6" />}
            value={answered}
            label="Answered"
            loading={loading}
          />
          <StatCard
            gradient="earth"
            icon={<XCircle className="w-6 h-6" />}
            value={closed}
            label="Closed"
            loading={loading}
          />
        </div>

        {/* ── Questions Table ─────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading questions…"
                      : `${filtered.length} question${filtered.length !== 1 ? "s" : ""} found`}
                  </CardDescription>
                </div>
              </div>

              {/* Filters + CTA */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-52">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions…"
                    className="pl-9"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Status filter */}
                <Select
                  value={statusFilter || "all"}
                  onValueChange={val =>
                    setStatusFilter(val === "all" ? "" : val as QuestionStatus)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category filter */}
                {categories.length > 0 && (
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={val =>
                      setCategoryFilter(val === "all" ? "" : val)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button variant="outline" onClick={() => refetch()} disabled={loading}>
                  <Loader2 className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Question</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(question => (
                      <tr
                        key={question.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-sm text-foreground max-w-[200px] truncate">
                          {question.question}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {question.farmerName || question.farmerId}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {question.category}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(question.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {statusBadge(question.status)}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewId(question.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {question.status === "pending" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="ml-2"
                              onClick={() => setAnsweringQuestion(question)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Answer
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {questionsData?.total != null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Showing {filtered.length} of {questionsData.total} questions
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No questions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusFilter
                    ? `No ${statusFilter} questions yet.`
                    : "Questions from farmers will appear here."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── View Question Dialog ────────────────────────────────────────────── */}
      <ViewQuestionDialog
        questionId={viewId}
        onClose={() => setViewId(null)}
        onAnswer={(question) => {
          setViewId(null)
          setAnsweringQuestion(question)
        }}
      />

      {/* ── Answer Question Dialog ──────────────────────────────────────────── */}
      <Dialog 
        open={!!answeringQuestion} 
        onOpenChange={open => !open && setAnsweringQuestion(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
          </DialogHeader>
          {answeringQuestion && (
            <AnswerQuestionForm
              question={answeringQuestion}
              submitting={answering}
              onSubmit={(answer) => {
                handleAnswer(answeringQuestion.id, { answer })
              }}
              onCancel={() => setAnsweringQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}