// ─────────────────────────────────────────────────────────────────────────────
// Admin AI Mock Service
// TODO: replace with real /api/admin/ai endpoints when backend is ready.
// Flip USE_MOCK_ADMIN (from adminMock.ts) to false and swap each function body
// for a real fetch call with matching signature.
// ─────────────────────────────────────────────────────────────────────────────

import { USE_MOCK_ADMIN } from './adminMock'
export { USE_MOCK_ADMIN }

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ── Types ────────────────────────────────────────────────────────────────────

export interface AiStats {
  deployedModel: string
  modelVersion: string
  overallAccuracy: number
  totalPredictions: number
  pendingReviews: number
  datasetImageCount: number
  diseaseClassCount: number
}

export interface DiseaseClass {
  id: string
  name: string
  imageCount: number
  targetCount: number
  isBalanced: boolean
  lastUpdated: string
}

export interface Dataset {
  id: string
  version: string
  totalImages: number
  classes: DiseaseClass[]
  createdAt: string
}

export type TrainingStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface EpochMetric {
  epoch: number
  loss: number
  accuracy: number
  valLoss: number
  valAccuracy: number
}

export interface TrainingJob {
  id: string
  name: string
  baseModel: string
  epochs: number
  datasetVersion: string
  status: TrainingStatus
  progress: number
  startedAt: string | null
  completedAt: string | null
  metrics: EpochMetric[]
  errorMessage?: string
}

export type ModelStatus = 'staged' | 'deployed' | 'archived'

export interface AiModel {
  id: string
  version: string
  status: ModelStatus
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainedAt: string
  deployedAt: string | null
  trainingJobId: string
  description: string
}

export interface PredictionReviewItem {
  id: string
  farmerId: string
  farmerName: string
  location: string
  cropType: string
  submittedAt: string
  predictedDisease: string
  confidence: number
  status: 'pending' | 'approved' | 'corrected' | 'rejected'
  correctedLabel?: string
  reviewedAt?: string
}

export interface ReviewParams {
  page?: number
  pageSize?: number
  status?: PredictionReviewItem['status'] | 'all'
}

export interface PerClassAccuracy {
  disease: string
  accuracy: number
  sampleCount: number
}

export interface AccuracyPoint {
  date: string
  accuracy: number
  valAccuracy: number
}

export interface AiPerformance {
  perClass: PerClassAccuracy[]
  confidenceDistribution: { range: string; count: number }[]
  accuracyOverTime: AccuracyPoint[]
  confusionHighlights: { predicted: string; actual: string; count: number }[]
}

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'
export type RiskCategory = 'pest_disease' | 'weather'

export interface RiskAlert {
  id: string
  category: RiskCategory
  severity: RiskSeverity
  title: string
  description: string
  affectedCrop?: string
  affectedRegion: string
  probability?: number
  timeframe: string
  createdAt: string
}

export type OptimizationType = 'planting' | 'harvesting' | 'resource'
export type OptimizationStatus = 'pending' | 'applied' | 'dismissed'

export interface OptimizationSuggestion {
  id: string
  type: OptimizationType
  crop?: string
  title: string
  rationale: string
  confidence: number
  expectedImpact: string
  window?: { start: string; end: string }
  status: OptimizationStatus
}

// ── In-memory stores ──────────────────────────────────────────────────────────

const _dataset: Dataset = {
  id: 'ds-1',
  version: '2.4.0',
  totalImages: 94820,
  createdAt: '2026-05-10',
  classes: [
    { id: 'dc1', name: 'Maize Leaf Blight', imageCount: 12400, targetCount: 10000, isBalanced: true, lastUpdated: '2026-05-10' },
    { id: 'dc2', name: 'Bean Rust', imageCount: 9800, targetCount: 10000, isBalanced: true, lastUpdated: '2026-05-08' },
    { id: 'dc3', name: 'Cassava Mosaic', imageCount: 11200, targetCount: 10000, isBalanced: true, lastUpdated: '2026-05-09' },
    { id: 'dc4', name: 'Tomato Early Blight', imageCount: 10500, targetCount: 10000, isBalanced: true, lastUpdated: '2026-05-07' },
    { id: 'dc5', name: 'Rice Blast', imageCount: 8100, targetCount: 10000, isBalanced: false, lastUpdated: '2026-04-30' },
    { id: 'dc6', name: 'Banana Bacterial Wilt', imageCount: 7900, targetCount: 10000, isBalanced: false, lastUpdated: '2026-04-28' },
    { id: 'dc7', name: 'Coffee Berry Disease', imageCount: 10200, targetCount: 10000, isBalanced: true, lastUpdated: '2026-05-05' },
    { id: 'dc8', name: 'Sorghum Downy Mildew', imageCount: 6200, targetCount: 10000, isBalanced: false, lastUpdated: '2026-04-20' },
    { id: 'dc9', name: 'Healthy (Control)', imageCount: 18520, targetCount: 10000, isBalanced: false, lastUpdated: '2026-05-10' },
  ],
}

let _jobs: TrainingJob[] = [
  {
    id: 'job-4', name: 'Run #4 — EfficientNet-B2', baseModel: 'EfficientNet-B2', epochs: 40, datasetVersion: '2.4.0',
    status: 'completed', progress: 100, startedAt: '2026-05-15T08:00:00Z', completedAt: '2026-05-15T14:32:00Z',
    metrics: Array.from({ length: 40 }, (_, i) => ({
      epoch: i + 1,
      loss: +(1.8 * Math.exp(-i * 0.09) + 0.08).toFixed(4),
      accuracy: +(0.55 + 0.44 * (1 - Math.exp(-i * 0.1))).toFixed(4),
      valLoss: +(1.9 * Math.exp(-i * 0.085) + 0.12).toFixed(4),
      valAccuracy: +(0.52 + 0.41 * (1 - Math.exp(-i * 0.095))).toFixed(4),
    })),
  },
  {
    id: 'job-3', name: 'Run #3 — MobileNetV3', baseModel: 'MobileNetV3-Large', epochs: 30, datasetVersion: '2.3.0',
    status: 'completed', progress: 100, startedAt: '2026-04-20T10:00:00Z', completedAt: '2026-04-20T15:10:00Z',
    metrics: Array.from({ length: 30 }, (_, i) => ({
      epoch: i + 1,
      loss: +(2.0 * Math.exp(-i * 0.08) + 0.15).toFixed(4),
      accuracy: +(0.50 + 0.38 * (1 - Math.exp(-i * 0.09))).toFixed(4),
      valLoss: +(2.1 * Math.exp(-i * 0.075) + 0.18).toFixed(4),
      valAccuracy: +(0.48 + 0.35 * (1 - Math.exp(-i * 0.085))).toFixed(4),
    })),
  },
  {
    id: 'job-2', name: 'Run #2 — ResNet-50', baseModel: 'ResNet-50', epochs: 25, datasetVersion: '2.2.0',
    status: 'failed', progress: 62, startedAt: '2026-03-10T09:00:00Z', completedAt: null,
    metrics: Array.from({ length: 16 }, (_, i) => ({
      epoch: i + 1,
      loss: +(2.2 * Math.exp(-i * 0.07) + 0.20).toFixed(4),
      accuracy: +(0.45 + 0.32 * (1 - Math.exp(-i * 0.08))).toFixed(4),
      valLoss: +(2.3 * Math.exp(-i * 0.065) + 0.22).toFixed(4),
      valAccuracy: +(0.43 + 0.30 * (1 - Math.exp(-i * 0.075))).toFixed(4),
    })),
    errorMessage: 'OOM: GPU memory exceeded at epoch 16 (batch size 64). Try reducing to 32.',
  },
]

let _models: AiModel[] = [
  {
    id: 'model-3', version: 'v3.0.0', status: 'deployed', accuracy: 0.934, precision: 0.921, recall: 0.918, f1Score: 0.919,
    trainedAt: '2026-05-15', deployedAt: '2026-05-18', trainingJobId: 'job-4',
    description: 'EfficientNet-B2 trained on dataset v2.4.0 with 9-class disease classification. Best model to date.',
  },
  {
    id: 'model-2', version: 'v2.1.0', status: 'archived', accuracy: 0.881, precision: 0.874, recall: 0.862, f1Score: 0.868,
    trainedAt: '2026-04-20', deployedAt: '2026-04-22', trainingJobId: 'job-3',
    description: 'MobileNetV3-Large on dataset v2.3.0. Replaced by v3.0.0.',
  },
  {
    id: 'model-1', version: 'v1.0.0', status: 'archived', accuracy: 0.812, precision: 0.798, recall: 0.781, f1Score: 0.789,
    trainedAt: '2025-12-01', deployedAt: '2025-12-05', trainingJobId: 'job-1',
    description: 'Initial ResNet-50 baseline on 6-class dataset.',
  },
]

let _reviewQueue: PredictionReviewItem[] = [
  { id: 'rv1', farmerId: 'u1', farmerName: 'Jean Habimana', location: 'Kigali', cropType: 'Maize', submittedAt: '2026-06-23T08:14:00Z', predictedDisease: 'Maize Leaf Blight', confidence: 68, status: 'pending' },
  { id: 'rv2', farmerId: 'u2', farmerName: 'Amina Uwase', location: 'Bugesera', cropType: 'Beans', submittedAt: '2026-06-23T09:02:00Z', predictedDisease: 'Bean Rust', confidence: 71, status: 'pending' },
  { id: 'rv3', farmerId: 'u7', farmerName: 'Grace Ingabire', location: 'Nyagatare', cropType: 'Cassava', submittedAt: '2026-06-23T09:45:00Z', predictedDisease: 'Cassava Mosaic', confidence: 63, status: 'pending' },
  { id: 'rv4', farmerId: 'u10', farmerName: 'Alice Uwimana', location: 'Rubavu', cropType: 'Tomato', submittedAt: '2026-06-22T15:30:00Z', predictedDisease: 'Tomato Early Blight', confidence: 74, status: 'approved', reviewedAt: '2026-06-22T16:00:00Z' },
  { id: 'rv5', farmerId: 'u11', farmerName: 'David Nzeyimana', location: 'Gicumbi', cropType: 'Rice', submittedAt: '2026-06-22T14:10:00Z', predictedDisease: 'Healthy (Control)', confidence: 58, status: 'corrected', correctedLabel: 'Rice Blast', reviewedAt: '2026-06-22T15:00:00Z' },
  { id: 'rv6', farmerId: 'u6', farmerName: 'Emmanuel Bizimana', location: 'Gatsibo', cropType: 'Maize', submittedAt: '2026-06-21T11:00:00Z', predictedDisease: 'Sorghum Downy Mildew', confidence: 52, status: 'rejected', reviewedAt: '2026-06-21T12:30:00Z' },
]

let _riskAlerts: RiskAlert[] = [
  {
    id: 'ra1', category: 'pest_disease', severity: 'high',
    title: 'Fall Armyworm Surge — Maize',
    description: 'AI model detects 34% spike in maize leaf blight scans from Nyagatare district over last 7 days. Pattern consistent with Fall Armyworm outbreak. Immediate field scouting advised.',
    affectedCrop: 'Maize', affectedRegion: 'Nyagatare, Eastern Province',
    probability: 82, timeframe: '5–10 days', createdAt: '2026-06-22T08:00:00Z',
  },
  {
    id: 'ra2', category: 'pest_disease', severity: 'medium',
    title: 'Bean Rust Spreading — Southern Province',
    description: 'Elevated bean rust submissions observed across 3 districts in the Southern Province. Early-stage spread confirmed by 4 agronomist field reports.',
    affectedCrop: 'Beans', affectedRegion: 'Huye, Nyanza, Muhanga',
    probability: 67, timeframe: '2–3 weeks', createdAt: '2026-06-21T10:30:00Z',
  },
  {
    id: 'ra3', category: 'weather', severity: 'critical',
    title: 'Prolonged Dry Spell Forecast — Bugesera',
    description: 'Meteorological models predict below-average rainfall (<30mm) for 18–21 days in Bugesera. Immediate irrigation advisory recommended for all active farms in the zone.',
    affectedRegion: 'Bugesera, Eastern Province',
    probability: 91, timeframe: '18–21 days', createdAt: '2026-06-23T06:00:00Z',
  },
  {
    id: 'ra4', category: 'weather', severity: 'low',
    title: 'Localized Hail Risk — Musanze Highlands',
    description: 'Convective storm activity near Musanze may produce localized hail events. Risk is low but may impact coffee plantation canopy.',
    affectedCrop: 'Coffee', affectedRegion: 'Musanze, Northern Province',
    probability: 38, timeframe: '2–3 days', createdAt: '2026-06-23T07:45:00Z',
  },
]

let _optimizationSuggestions: OptimizationSuggestion[] = [
  {
    id: 'os1', type: 'planting', crop: 'Maize',
    title: 'Optimal Maize Planting Window — Eastern Province',
    rationale: 'Soil moisture, temperature trends, and 5-year historical yield data indicate peak planting window in the next 12 days for Nyagatare and Bugesera districts. Soil temperature averaging 24°C and moisture at 62% field capacity.',
    confidence: 88,
    expectedImpact: '+14% predicted yield vs off-window planting',
    window: { start: '2026-06-25', end: '2026-07-07' },
    status: 'pending',
  },
  {
    id: 'os2', type: 'harvesting', crop: 'Beans',
    title: 'Harvest Beans Before Rain Onset — Southern Province',
    rationale: 'Rainfall model predicts 80mm/week starting first week of July. Early harvest recommended to prevent pod rot and grain quality degradation. Current crop maturity is 95% based on GDD calculations.',
    confidence: 76,
    expectedImpact: 'Prevents estimated 20–30% post-harvest loss',
    window: { start: '2026-06-28', end: '2026-07-04' },
    status: 'pending',
  },
  {
    id: 'os3', type: 'resource', crop: 'Tomato',
    title: 'Reduce Pesticide Application Frequency — Rubavu Farms',
    rationale: 'AI disease detection shows below-threshold pathogen activity in Rubavu and Gisenyi tomato farms across last 3 scan cycles. Standard 7-day spray cycle can safely extend to 14 days without disease risk.',
    confidence: 71,
    expectedImpact: '~18% reduction in pesticide costs for affected farms',
    status: 'pending',
  },
  {
    id: 'os4', type: 'planting', crop: 'Rice',
    title: 'Delay Rice Transplanting — Kagera Marshlands',
    rationale: 'Water levels in marshland irrigation channels are 22% below optimal. Transplanting under current conditions increases seedling mortality risk significantly. Awaiting water management report from Kagera basin authority.',
    confidence: 84,
    expectedImpact: 'Avoids 15–25% seedling mortality risk',
    window: { start: '2026-07-10', end: '2026-07-20' },
    status: 'applied',
  },
  {
    id: 'os5', type: 'resource',
    title: 'Fertilizer Redistribution — COOPAC Hub',
    rationale: 'COOPAC Rwamagana has surplus NPK (23-0-0) stock of approximately 2.4 tonnes. Three member farms in Kayonza are reporting shortage. Internal redistribution eliminates external procurement need.',
    confidence: 93,
    expectedImpact: 'Cost saving ~RWF 340,000 across 3 farms',
    status: 'dismissed',
  },
]

// ── Service ───────────────────────────────────────────────────────────────────

export const adminAiService = {
  // TODO: replace with GET /api/admin/ai/overview
  async getAiOverview(): Promise<AiStats> {
    await delay()
    const deployed = _models.find(m => m.status === 'deployed')
    return {
      deployedModel: deployed?.description.split(' trained')[0] ?? 'None',
      modelVersion: deployed?.version ?? '—',
      overallAccuracy: deployed?.accuracy ?? 0,
      totalPredictions: 142_805,
      pendingReviews: _reviewQueue.filter(r => r.status === 'pending').length,
      datasetImageCount: _dataset.totalImages,
      diseaseClassCount: _dataset.classes.length,
    }
  },

  // TODO: replace with GET /api/admin/ai/datasets
  async getDatasets(): Promise<Dataset> {
    await delay()
    return { ..._dataset, classes: [..._dataset.classes] }
  },

  // TODO: replace with GET /api/admin/ai/training/jobs
  async getTrainingJobs(): Promise<TrainingJob[]> {
    await delay()
    return [..._jobs]
  },

  // TODO: replace with POST /api/admin/ai/training/jobs
  async startTrainingJob(config: { baseModel: string; epochs: number; datasetVersion: string }): Promise<TrainingJob> {
    await delay(800)
    const newJob: TrainingJob = {
      id: `job-${Date.now()}`,
      name: `Run #${_jobs.length + 1} — ${config.baseModel}`,
      baseModel: config.baseModel,
      epochs: config.epochs,
      datasetVersion: config.datasetVersion,
      status: 'queued',
      progress: 0,
      startedAt: null,
      completedAt: null,
      metrics: [],
    }
    _jobs = [newJob, ..._jobs]
    return newJob
  },

  // TODO: replace with DELETE /api/admin/ai/training/jobs/:id
  async cancelTrainingJob(id: string): Promise<void> {
    await delay(400)
    _jobs = _jobs.map(j => j.id === id ? { ...j, status: 'failed' as const, errorMessage: 'Cancelled by admin.' } : j)
  },

  // TODO: replace with GET /api/admin/ai/models
  async getModels(): Promise<AiModel[]> {
    await delay()
    return [..._models]
  },

  // TODO: replace with POST /api/admin/ai/models/:id/deploy
  async deployModel(id: string): Promise<AiModel[]> {
    await delay(600)
    _models = _models.map(m => ({
      ...m,
      status: m.id === id ? 'deployed' as const : m.status === 'deployed' ? 'staged' as const : m.status,
      deployedAt: m.id === id ? new Date().toISOString().split('T')[0] : m.deployedAt,
    }))
    return [..._models]
  },

  // TODO: replace with POST /api/admin/ai/models/:id/archive
  async archiveModel(id: string): Promise<AiModel[]> {
    await delay(400)
    _models = _models.map(m => m.id === id ? { ...m, status: 'archived' as const } : m)
    return [..._models]
  },

  // TODO: replace with GET /api/admin/ai/review
  async getReviewQueue(params: ReviewParams = {}): Promise<{ data: PredictionReviewItem[]; total: number }> {
    await delay()
    const { page = 1, pageSize = 10, status = 'all' } = params
    let filtered = [..._reviewQueue]
    if (status !== 'all') filtered = filtered.filter(r => r.status === status)
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)
    return { data, total }
  },

  // TODO: replace with POST /api/admin/ai/review/:id
  async reviewPrediction(
    id: string,
    action: 'approve' | 'correct' | 'reject',
    correctedLabel?: string,
  ): Promise<PredictionReviewItem> {
    await delay(500)
    const idx = _reviewQueue.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Review item not found')
    const statusMap = { approve: 'approved', correct: 'corrected', reject: 'rejected' } as const
    _reviewQueue[idx] = {
      ..._reviewQueue[idx],
      status: statusMap[action],
      correctedLabel: action === 'correct' ? correctedLabel : undefined,
      reviewedAt: new Date().toISOString(),
    }
    return _reviewQueue[idx]
  },

  // TODO: replace with GET /api/admin/ai/performance
  async getAiPerformance(): Promise<AiPerformance> {
    await delay()
    return {
      perClass: [
        { disease: 'Maize Leaf Blight', accuracy: 0.961, sampleCount: 1240 },
        { disease: 'Bean Rust', accuracy: 0.944, sampleCount: 980 },
        { disease: 'Cassava Mosaic', accuracy: 0.938, sampleCount: 1120 },
        { disease: 'Tomato Early Blight', accuracy: 0.927, sampleCount: 1050 },
        { disease: 'Rice Blast', accuracy: 0.891, sampleCount: 810 },
        { disease: 'Banana Bact. Wilt', accuracy: 0.876, sampleCount: 790 },
        { disease: 'Coffee Berry', accuracy: 0.912, sampleCount: 1020 },
        { disease: 'Sorghum Mildew', accuracy: 0.843, sampleCount: 620 },
        { disease: 'Healthy (Control)', accuracy: 0.978, sampleCount: 1852 },
      ],
      confidenceDistribution: [
        { range: '50-60%', count: 234 },
        { range: '60-70%', count: 1820 },
        { range: '70-80%', count: 4560 },
        { range: '80-90%', count: 9840 },
        { range: '90-100%', count: 12480 },
      ],
      accuracyOverTime: [
        { date: 'Jan', accuracy: 0.812, valAccuracy: 0.798 },
        { date: 'Feb', accuracy: 0.830, valAccuracy: 0.814 },
        { date: 'Mar', accuracy: 0.858, valAccuracy: 0.841 },
        { date: 'Apr', accuracy: 0.881, valAccuracy: 0.868 },
        { date: 'May', accuracy: 0.934, valAccuracy: 0.918 },
        { date: 'Jun', accuracy: 0.934, valAccuracy: 0.919 },
      ],
      confusionHighlights: [
        { predicted: 'Maize Leaf Blight', actual: 'Healthy (Control)', count: 14 },
        { predicted: 'Rice Blast', actual: 'Sorghum Mildew', count: 22 },
        { predicted: 'Bean Rust', actual: 'Tomato Early Blight', count: 9 },
        { predicted: 'Sorghum Mildew', actual: 'Rice Blast', count: 31 },
      ],
    }
  },

  // TODO: replace with GET /api/admin/ai/accuracy-trend
  async getAccuracyTrend(): Promise<{ date: string; accuracy: number }[]> {
    await delay()
    return [
      { date: 'Jan', accuracy: 0.812 },
      { date: 'Feb', accuracy: 0.830 },
      { date: 'Mar', accuracy: 0.858 },
      { date: 'Apr', accuracy: 0.881 },
      { date: 'May', accuracy: 0.934 },
      { date: 'Jun', accuracy: 0.934 },
    ]
  },

  // TODO: replace with GET /api/admin/ai/risk-alerts
  async getRiskAlerts(): Promise<RiskAlert[]> {
    await delay()
    return [..._riskAlerts]
  },

  // TODO: replace with GET /api/admin/ai/optimization
  async getOptimizationSuggestions(): Promise<OptimizationSuggestion[]> {
    await delay()
    return [..._optimizationSuggestions]
  },

  // TODO: replace with PATCH /api/admin/ai/optimization/:id/apply
  async applyOptimization(id: string): Promise<OptimizationSuggestion> {
    await delay(500)
    const idx = _optimizationSuggestions.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('Suggestion not found')
    _optimizationSuggestions[idx] = { ..._optimizationSuggestions[idx], status: 'applied' }
    return _optimizationSuggestions[idx]
  },

  // TODO: replace with PATCH /api/admin/ai/optimization/:id/dismiss
  async dismissOptimization(id: string): Promise<OptimizationSuggestion> {
    await delay(400)
    const idx = _optimizationSuggestions.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('Suggestion not found')
    _optimizationSuggestions[idx] = { ..._optimizationSuggestions[idx], status: 'dismissed' }
    return _optimizationSuggestions[idx]
  },
}
