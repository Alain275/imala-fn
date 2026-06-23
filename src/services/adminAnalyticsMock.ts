// ─────────────────────────────────────────────────────────────────────────────
// Admin Analytics Mock Service
// TODO: replace with real /api/admin/analytics endpoints when backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

import { USE_MOCK_ADMIN } from './adminMock'
export { USE_MOCK_ADMIN }

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ── Types ────────────────────────────────────────────────────────────────────

export interface CropYieldData {
  crop: string
  yieldTons: number
  targetTons: number
  season: string
}

export interface GrowthStageData {
  crop: string
  germination: number
  vegetative: number
  flowering: number
  maturity: number
}

export interface DetectionTrendPoint {
  month: string
  blight: number
  rust: number
  mosaic: number
  blast: number
}

export interface SoilMetricData {
  zone: string
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
}

export interface ClimatePoint {
  month: string
  rainfall: number
  temp: number
  humidity: number
}

export interface IrrigationData {
  zone: string
  efficiency: number
  usageMm: number
  targetMm: number
}

export interface CostBreakdownData {
  season: string
  seeds: number
  fertilizer: number
  pesticide: number
  labor: number
}

export interface RevenueByCropData {
  crop: string
  revenueM: number
  volumeKg: number
}

export interface MarketPricePoint {
  month: string
  maize: number
  beans: number
  coffee: number
}

export interface CarbonFootprintPoint {
  month: string
  machinery: number
  fertilizer: number
  transport: number
}

export interface SustainabilityScore {
  indicator: string
  current: number
  target: number
}

// ── Service ───────────────────────────────────────────────────────────────────

export const adminAnalyticsService = {
  // ── Crop Performance ───────────────────────────────────────────────────────

  // TODO: replace with GET /api/admin/analytics/crop-yield
  async getCropYield(): Promise<CropYieldData[]> {
    await delay()
    return [
      { crop: 'Maize', yieldTons: 4.8, targetTons: 5.5, season: 'Mar–Jun 2026' },
      { crop: 'Beans', yieldTons: 2.1, targetTons: 2.0, season: 'Mar–Jun 2026' },
      { crop: 'Cassava', yieldTons: 12.4, targetTons: 14.0, season: '2026' },
      { crop: 'Irish Potato', yieldTons: 9.2, targetTons: 10.0, season: 'Mar–Jun 2026' },
      { crop: 'Rice', yieldTons: 5.6, targetTons: 6.0, season: 'Mar–Jul 2026' },
      { crop: 'Sorghum', yieldTons: 3.1, targetTons: 3.5, season: 'Feb–May 2026' },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/growth-stages
  async getGrowthStages(): Promise<GrowthStageData[]> {
    await delay()
    return [
      { crop: 'Maize', germination: 10, vegetative: 35, flowering: 25, maturity: 20 },
      { crop: 'Beans', germination: 8, vegetative: 28, flowering: 22, maturity: 17 },
      { crop: 'Cassava', germination: 20, vegetative: 80, flowering: 60, maturity: 110 },
      { crop: 'Irish Potato', germination: 15, vegetative: 40, flowering: 30, maturity: 25 },
      { crop: 'Rice', germination: 12, vegetative: 45, flowering: 35, maturity: 38 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/disease-detection-trends
  async getDetectionTrends(): Promise<DetectionTrendPoint[]> {
    await delay()
    return [
      { month: 'Jan', blight: 42, rust: 18, mosaic: 31, blast: 9 },
      { month: 'Feb', blight: 55, rust: 22, mosaic: 28, blast: 14 },
      { month: 'Mar', blight: 89, rust: 35, mosaic: 42, blast: 21 },
      { month: 'Apr', blight: 118, rust: 48, mosaic: 56, blast: 33 },
      { month: 'May', blight: 142, rust: 61, mosaic: 64, blast: 28 },
      { month: 'Jun', blight: 167, rust: 74, mosaic: 71, blast: 19 },
    ]
  },

  // ── Soil & Environmental ───────────────────────────────────────────────────

  // TODO: replace with GET /api/admin/analytics/soil-metrics
  async getSoilMetrics(): Promise<SoilMetricData[]> {
    await delay()
    return [
      { zone: 'Nyagatare', ph: 6.2, nitrogen: 78, phosphorus: 42, potassium: 65 },
      { zone: 'Bugesera', ph: 5.8, nitrogen: 61, phosphorus: 38, potassium: 58 },
      { zone: 'Musanze', ph: 6.7, nitrogen: 91, phosphorus: 55, potassium: 82 },
      { zone: 'Huye', ph: 6.1, nitrogen: 74, phosphorus: 46, potassium: 71 },
      { zone: 'Rubavu', ph: 5.9, nitrogen: 68, phosphorus: 39, potassium: 62 },
      { zone: 'Kayonza', ph: 6.3, nitrogen: 72, phosphorus: 44, potassium: 69 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/climate
  async getClimateData(): Promise<ClimatePoint[]> {
    await delay()
    return [
      { month: 'Jan', rainfall: 82, temp: 21.4, humidity: 68 },
      { month: 'Feb', rainfall: 95, temp: 21.8, humidity: 71 },
      { month: 'Mar', rainfall: 148, temp: 21.2, humidity: 78 },
      { month: 'Apr', rainfall: 172, temp: 20.8, humidity: 82 },
      { month: 'May', rainfall: 121, temp: 21.0, humidity: 76 },
      { month: 'Jun', rainfall: 38, temp: 20.5, humidity: 62 },
      { month: 'Jul', rainfall: 22, temp: 20.1, humidity: 58 },
      { month: 'Aug', rainfall: 41, temp: 20.8, humidity: 60 },
      { month: 'Sep', rainfall: 98, temp: 21.6, humidity: 72 },
      { month: 'Oct', rainfall: 145, temp: 21.9, humidity: 79 },
      { month: 'Nov', rainfall: 168, temp: 21.5, humidity: 81 },
      { month: 'Dec', rainfall: 88, temp: 21.2, humidity: 70 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/irrigation
  async getIrrigationData(): Promise<IrrigationData[]> {
    await delay()
    return [
      { zone: 'Nyagatare North', efficiency: 84, usageMm: 320, targetMm: 360 },
      { zone: 'Bugesera Marshland', efficiency: 91, usageMm: 410, targetMm: 420 },
      { zone: 'Kagera Valley', efficiency: 73, usageMm: 280, targetMm: 360 },
      { zone: 'Kayonza Lowland', efficiency: 88, usageMm: 350, targetMm: 380 },
      { zone: 'Kirehe District', efficiency: 67, usageMm: 240, targetMm: 340 },
    ]
  },

  // ── Financial & Resource ───────────────────────────────────────────────────

  // TODO: replace with GET /api/admin/analytics/cost-breakdown
  async getCostBreakdown(): Promise<CostBreakdownData[]> {
    await delay()
    return [
      { season: 'Sep 2025', seeds: 4.2, fertilizer: 11.8, pesticide: 6.4, labor: 18.2 },
      { season: 'Jan 2026', seeds: 3.8, fertilizer: 13.2, pesticide: 5.9, labor: 19.8 },
      { season: 'Mar 2026', seeds: 5.1, fertilizer: 14.6, pesticide: 7.2, labor: 21.4 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/revenue-by-crop
  async getRevenueByCrop(): Promise<RevenueByCropData[]> {
    await delay()
    return [
      { crop: 'Coffee', revenueM: 284.6, volumeKg: 48200 },
      { crop: 'Maize', revenueM: 142.3, volumeKg: 192400 },
      { crop: 'Irish Potato', revenueM: 118.7, volumeKg: 84600 },
      { crop: 'Cassava', revenueM: 96.2, volumeKg: 122800 },
      { crop: 'Beans', revenueM: 88.4, volumeKg: 61200 },
      { crop: 'Rice', revenueM: 74.1, volumeKg: 42800 },
      { crop: 'Banana', revenueM: 52.8, volumeKg: 88400 },
      { crop: 'Sorghum', revenueM: 38.9, volumeKg: 54600 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/market-prices
  async getMarketPrices(): Promise<MarketPricePoint[]> {
    await delay()
    return [
      { month: 'Jan', maize: 280, beans: 520, coffee: 4200 },
      { month: 'Feb', maize: 295, beans: 540, coffee: 4350 },
      { month: 'Mar', maize: 310, beans: 560, coffee: 4280 },
      { month: 'Apr', maize: 325, beans: 510, coffee: 4420 },
      { month: 'May', maize: 298, beans: 495, coffee: 4510 },
      { month: 'Jun', maize: 285, beans: 480, coffee: 4380 },
    ]
  },

  // ── Sustainability & Compliance ────────────────────────────────────────────

  // TODO: replace with GET /api/admin/analytics/carbon-footprint
  async getCarbonFootprint(): Promise<CarbonFootprintPoint[]> {
    await delay()
    return [
      { month: 'Jan', machinery: 12.4, fertilizer: 8.2, transport: 4.6 },
      { month: 'Feb', machinery: 11.8, fertilizer: 9.4, transport: 5.1 },
      { month: 'Mar', machinery: 14.2, fertilizer: 11.8, transport: 6.4 },
      { month: 'Apr', machinery: 15.6, fertilizer: 13.2, transport: 7.2 },
      { month: 'May', machinery: 13.1, fertilizer: 10.4, transport: 6.8 },
      { month: 'Jun', machinery: 10.9, fertilizer: 8.8, transport: 5.4 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/sustainability
  async getSustainabilityScores(): Promise<SustainabilityScore[]> {
    await delay()
    return [
      { indicator: 'Water Efficiency', current: 84, target: 90 },
      { indicator: 'Organic Coverage', current: 62, target: 75 },
      { indicator: 'Soil Health Index', current: 71, target: 80 },
      { indicator: 'Pesticide Compliance', current: 93, target: 95 },
      { indicator: 'Carbon Reduction', current: 48, target: 60 },
      { indicator: 'Biodiversity Score', current: 67, target: 70 },
    ]
  },
}
