// TODO: Replace every method with real API calls once backend endpoints are ready

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CooperativeStats {
  totalFarms: number
  pendingReview: number
  activeMembers: number
  totalYield: number
  cropsPlanted: number
  aiAlerts: number
  seasonProgress: number
}

export interface YieldDataPoint {
  month: string
  maize: number
  beans: number
  potato: number
}

export interface FarmStatusItem {
  key: 'good' | 'fair' | 'low' | 'inactive'
  value: number
}

export interface AiInsightItem {
  id: string
  type: 'alert' | 'market' | 'soil'
  textKey: string
  time: string
}

// ─── Farm types ──────────────────────────────────────────────────────────────

export type FarmStatus = 'good' | 'fair' | 'low' | 'inactive'

export interface CooperativeFarm {
  id: string
  name: string
  farmerName: string
  location: string
  sector: string
  sizeHa: number
  crops: string[]
  lastYieldTons: number
  yieldChange: number
  status: FarmStatus
  pendingReview: boolean
  phone: string
  joinedDate: string
  lastActivity: string
}

// ─── Member types ────────────────────────────────────────────────────────────

export type MemberRole = 'leader' | 'treasurer' | 'secretary' | 'member'

export interface CooperativeMember {
  id: string
  name: string
  phone: string
  email: string
  location: string
  role: MemberRole
  farmsCount: number
  status: 'active' | 'inactive'
  joinedDate: string
}

export interface NewMemberData {
  name: string
  phone: string
  email: string
  location: string
  role: MemberRole
}

// ─── Market types ────────────────────────────────────────────────────────────

export interface MarketCrop {
  id: string
  name: string
  pricePerKg: number
  change: number
  trend: 'up' | 'down' | 'stable'
  ourStockTons: number
  demandLevel: 'high' | 'medium' | 'low'
}

export interface MarketBuyer {
  id: string
  companyName: string
  contactPerson: string
  location: string
  phone: string
  cropsWanted: string[]
  minQuantityTons: number
  pricePerKg: number
  rating: number
  verified: boolean
}

export interface MarketPriceHistory {
  week: string
  maize: number
  beans: number
  potato: number
}

export interface BulkSaleOrder {
  id: string
  crop: string
  quantityTons: number
  targetPricePerKg: number
  status: 'pending' | 'confirmed' | 'completed'
  buyer: string
  createdDate: string
}

// ─── AI Insight types ────────────────────────────────────────────────────────

export type InsightType = 'alert' | 'market' | 'soil' | 'weather'
export type InsightSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface FullAiInsight {
  id: string
  type: InsightType
  severity: InsightSeverity
  title: string
  description: string
  affectedFarms: number
  timestamp: string
  actionRoute: string
  dismissed: boolean
}

// ─── Crop Advisory types ─────────────────────────────────────────────────────

export interface FertilizerRec {
  name: string
  amountKgPerHa: number
  timing: string
}

export interface CropRisk {
  name: string
  severity: 'high' | 'medium' | 'low'
  prevention: string
}

export interface CalendarEntry {
  month: string
  activity: string
  done: boolean
}

export interface CropAdvisory {
  cropId: string
  cropName: string
  icon: string
  currentStage: string
  stagePct: number
  nextAction: string
  daysToHarvest: number
  expectedYieldTons: number
  irrigationDays: number
  fertilizers: FertilizerRec[]
  risks: CropRisk[]
  calendar: CalendarEntry[]
}

// ─── Disease Alert types ──────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertStatus = 'active' | 'resolved'

export interface DiseaseAlert {
  id: string
  diseaseName: string
  cropType: string
  severity: AlertSeverity
  affectedFarms: number
  detectedDate: string
  symptoms: string
  prevention: string
  status: AlertStatus
  broadcastSent: boolean
}

// ─── Settings types ──────────────────────────────────────────────────────────

export interface CooperativeProfile {
  name: string
  location: string
  district: string
  registrationNumber: string
  season: string
  contactEmail: string
  contactPhone: string
  foundedYear: string
  description: string
}

export interface CooperativeSettings {
  profile: CooperativeProfile
  notifications: {
    diseaseAlerts: boolean
    marketUpdates: boolean
    weatherWarnings: boolean
    aiRecommendations: boolean
    weeklyReport: boolean
  }
  access: {
    membersCanViewPrices: boolean
    requireFarmApproval: boolean
    shareDataWithGov: boolean
  }
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const FARMS: CooperativeFarm[] = [
  { id: 'f01', name: 'Uwimana Farm A', farmerName: 'Alexis Uwimana',   location: 'Musanze, Cyuve',     sector: 'Cyuve',     sizeHa: 2.5, crops: ['Maize','Beans'],          lastYieldTons: 8.2,  yieldChange: 12,   status: 'good',     pendingReview: false, phone: '+250788100001', joinedDate: '2023-01-15', lastActivity: '2026-06-20' },
  { id: 'f02', name: 'Ingabire Plot B',farmerName: 'Marie Ingabire',   location: 'Musanze, Muhoza',    sector: 'Muhoza',    sizeHa: 1.8, crops: ['Potato','Maize'],         lastYieldTons: 5.6,  yieldChange: 8,    status: 'good',     pendingReview: false, phone: '+250788100002', joinedDate: '2023-02-10', lastActivity: '2026-06-22' },
  { id: 'f03', name: 'Nkurunziza Land',farmerName: 'Eric Nkurunziza', location: 'Musanze, Kinigi',    sector: 'Kinigi',    sizeHa: 3.2, crops: ['Beans','Sorghum'],        lastYieldTons: 9.1,  yieldChange: 18,   status: 'good',     pendingReview: false, phone: '+250788100003', joinedDate: '2023-01-20', lastActivity: '2026-06-21' },
  { id: 'f04', name: 'Mukarutabana F4',farmerName: 'Grace Mukarutabana',location:'Musanze, Busogo',   sector: 'Busogo',    sizeHa: 1.2, crops: ['Maize'],                  lastYieldTons: 3.4,  yieldChange: -5,   status: 'fair',     pendingReview: false, phone: '+250788100004', joinedDate: '2023-03-05', lastActivity: '2026-06-18' },
  { id: 'f05', name: 'Habimana Fields', farmerName: 'Pierre Habimana', location: 'Musanze, Nyange',   sector: 'Nyange',    sizeHa: 2.0, crops: ['Potato','Beans'],         lastYieldTons: 6.0,  yieldChange: 5,    status: 'good',     pendingReview: true,  phone: '+250788100005', joinedDate: '2023-04-12', lastActivity: '2026-06-19' },
  { id: 'f06', name: 'Nyiramana Plot',  farmerName: 'Jacqueline Nyiramana',location:'Musanze, Shingiro',sector:'Shingiro', sizeHa: 0.8, crops: ['Beans'],                  lastYieldTons: 1.8,  yieldChange: -12,  status: 'low',      pendingReview: false, phone: '+250788100006', joinedDate: '2023-05-08', lastActivity: '2026-06-10' },
  { id: 'f07', name: 'Karangwa Farm',   farmerName: 'Joseph Karangwa', location: 'Musanze, Gataraga', sector: 'Gataraga',  sizeHa: 4.0, crops: ['Maize','Beans','Potato'], lastYieldTons: 14.2, yieldChange: 22,   status: 'good',     pendingReview: false, phone: '+250788100007', joinedDate: '2023-01-05', lastActivity: '2026-06-24' },
  { id: 'f08', name: 'Mukamana Land',   farmerName: 'Alice Mukamana',  location: 'Musanze, Muhoza',   sector: 'Muhoza',    sizeHa: 1.5, crops: ['Sorghum','Maize'],        lastYieldTons: 4.1,  yieldChange: 2,    status: 'fair',     pendingReview: false, phone: '+250788100008', joinedDate: '2023-06-15', lastActivity: '2026-06-17' },
  { id: 'f09', name: 'Nsengimana Plot', farmerName: 'Claude Nsengimana',location:'Musanze, Cyuve',    sector: 'Cyuve',     sizeHa: 2.8, crops: ['Potato'],                 lastYieldTons: 7.5,  yieldChange: -8,   status: 'fair',     pendingReview: true,  phone: '+250788100009', joinedDate: '2023-07-20', lastActivity: '2026-06-15' },
  { id: 'f10', name: 'Uwera Fields',    farmerName: 'Diane Uwera',     location: 'Musanze, Kinigi',   sector: 'Kinigi',    sizeHa: 1.0, crops: ['Beans','Maize'],          lastYieldTons: 2.2,  yieldChange: -18,  status: 'low',      pendingReview: false, phone: '+250788100010', joinedDate: '2023-08-01', lastActivity: '2026-06-05' },
  { id: 'f11', name: 'Bizimana Farm',   farmerName: 'Frank Bizimana',  location: 'Musanze, Busogo',   sector: 'Busogo',    sizeHa: 3.5, crops: ['Maize','Potato','Beans'], lastYieldTons: 11.8, yieldChange: 15,   status: 'good',     pendingReview: false, phone: '+250788100011', joinedDate: '2023-02-28', lastActivity: '2026-06-23' },
  { id: 'f12', name: 'Uwineza Plot',    farmerName: 'Solange Uwineza', location: 'Musanze, Nyange',   sector: 'Nyange',    sizeHa: 0.5, crops: ['Beans'],                  lastYieldTons: 0.9,  yieldChange: -30,  status: 'inactive', pendingReview: false, phone: '+250788100012', joinedDate: '2023-09-10', lastActivity: '2025-11-01' },
  { id: 'f13', name: 'Niyonsaba Land',  farmerName: 'Robert Niyonsaba',location:'Musanze, Shingiro',  sector: 'Shingiro',  sizeHa: 2.2, crops: ['Maize','Sorghum'],        lastYieldTons: 6.8,  yieldChange: 10,   status: 'good',     pendingReview: true,  phone: '+250788100013', joinedDate: '2023-10-05', lastActivity: '2026-06-22' },
  { id: 'f14', name: 'Mukandori Farm',  farmerName: 'Vestine Mukandori',location:'Musanze, Gataraga', sector: 'Gataraga',  sizeHa: 1.6, crops: ['Potato','Beans'],         lastYieldTons: 4.4,  yieldChange: 3,    status: 'fair',     pendingReview: false, phone: '+250788100014', joinedDate: '2023-11-12', lastActivity: '2026-06-20' },
]

const MEMBERS: CooperativeMember[] = [
  { id: 'm01', name: 'Alexis Uwimana',    phone: '+250788100001', email: 'alexis@coop.rw',    location: 'Musanze, Cyuve',     role: 'leader',    farmsCount: 2, status: 'active', joinedDate: '2023-01-01' },
  { id: 'm02', name: 'Marie Ingabire',    phone: '+250788100002', email: 'marie@coop.rw',     location: 'Musanze, Muhoza',    role: 'treasurer', farmsCount: 1, status: 'active', joinedDate: '2023-01-15' },
  { id: 'm03', name: 'Eric Nkurunziza',   phone: '+250788100003', email: 'eric@coop.rw',      location: 'Musanze, Kinigi',    role: 'secretary', farmsCount: 3, status: 'active', joinedDate: '2023-01-20' },
  { id: 'm04', name: 'Grace Mukarutabana',phone: '+250788100004', email: 'grace@coop.rw',     location: 'Musanze, Busogo',    role: 'member',    farmsCount: 2, status: 'active', joinedDate: '2023-02-10' },
  { id: 'm05', name: 'Pierre Habimana',   phone: '+250788100005', email: 'pierre@coop.rw',    location: 'Musanze, Nyange',    role: 'member',    farmsCount: 4, status: 'active', joinedDate: '2023-02-15' },
  { id: 'm06', name: 'Jacqueline Nyiramana',phone:'+250788100006',email:'jacqueline@coop.rw', location: 'Musanze, Shingiro',  role: 'member',    farmsCount: 1, status: 'active', joinedDate: '2023-03-01' },
  { id: 'm07', name: 'Joseph Karangwa',   phone: '+250788100007', email: 'joseph@coop.rw',    location: 'Musanze, Gataraga',  role: 'member',    farmsCount: 5, status: 'active', joinedDate: '2023-03-10' },
  { id: 'm08', name: 'Alice Mukamana',    phone: '+250788100008', email: 'alice@coop.rw',     location: 'Musanze, Muhoza',    role: 'member',    farmsCount: 3, status: 'active', joinedDate: '2023-04-05' },
  { id: 'm09', name: 'Claude Nsengimana', phone: '+250788100009', email: 'claude@coop.rw',    location: 'Musanze, Cyuve',     role: 'member',    farmsCount: 2, status: 'active', joinedDate: '2023-04-20' },
  { id: 'm10', name: 'Diane Uwera',       phone: '+250788100010', email: 'diane@coop.rw',     location: 'Musanze, Kinigi',    role: 'member',    farmsCount: 2, status: 'active', joinedDate: '2023-05-01' },
  { id: 'm11', name: 'Frank Bizimana',    phone: '+250788100011', email: 'frank@coop.rw',     location: 'Musanze, Busogo',    role: 'member',    farmsCount: 4, status: 'active', joinedDate: '2023-05-15' },
  { id: 'm12', name: 'Solange Uwineza',   phone: '+250788100012', email: 'solange@coop.rw',   location: 'Musanze, Nyange',    role: 'member',    farmsCount: 1, status: 'inactive',joinedDate: '2023-06-01' },
]

const MARKET_CROPS: MarketCrop[] = [
  { id: 'maize',  name: 'Maize',        pricePerKg: 450, change: 5.2,  trend: 'up',     ourStockTons: 68,  demandLevel: 'high'   },
  { id: 'beans',  name: 'Beans',        pricePerKg: 800, change: 2.8,  trend: 'up',     ourStockTons: 28,  demandLevel: 'high'   },
  { id: 'potato', name: 'Irish Potato', pricePerKg: 350, change: -1.5, trend: 'down',   ourStockTons: 20,  demandLevel: 'medium' },
  { id: 'sorghum',name: 'Sorghum',      pricePerKg: 320, change: 0.8,  trend: 'stable', ourStockTons: 12,  demandLevel: 'medium' },
  { id: 'wheat',  name: 'Wheat',        pricePerKg: 550, change: 3.1,  trend: 'up',     ourStockTons: 8,   demandLevel: 'low'    },
  { id: 'tomato', name: 'Tomatoes',     pricePerKg: 600, change: -4.3, trend: 'down',   ourStockTons: 5,   demandLevel: 'medium' },
]

const MARKET_BUYERS: MarketBuyer[] = [
  { id: 'b01', companyName: 'Rwanda Grains Ltd',    contactPerson: 'Jean Paul Nzabahimana', location: 'Kigali, Nyarugenge', phone: '+250788200001', cropsWanted: ['Maize','Beans'],   minQuantityTons: 10, pricePerKg: 460, rating: 4.8, verified: true  },
  { id: 'b02', companyName: 'Northern Agro Exports',contactPerson: 'Sarah Mutesi',          location: 'Musanze, CBD',       phone: '+250788200002', cropsWanted: ['Potato','Maize'],  minQuantityTons: 5,  pricePerKg: 370, rating: 4.5, verified: true  },
  { id: 'b03', companyName: 'Kigali Food Market',   contactPerson: 'David Habumugisha',     location: 'Kigali, Remera',     phone: '+250788200003', cropsWanted: ['Beans','Tomatoes'],minQuantityTons: 2,  pricePerKg: 820, rating: 4.2, verified: true  },
  { id: 'b04', companyName: 'East Africa Foods Co', contactPerson: 'Amina Omar',            location: 'Huye, Southern',     phone: '+250788200004', cropsWanted: ['Sorghum','Wheat'], minQuantityTons: 8,  pricePerKg: 340, rating: 3.9, verified: false },
]

const MARKET_PRICE_HISTORY: MarketPriceHistory[] = [
  { week: 'W1', maize: 425, beans: 780, potato: 360 },
  { week: 'W2', maize: 430, beans: 790, potato: 355 },
  { week: 'W3', maize: 435, beans: 785, potato: 358 },
  { week: 'W4', maize: 440, beans: 795, potato: 352 },
  { week: 'W5', maize: 445, beans: 800, potato: 348 },
  { week: 'W6', maize: 450, beans: 800, potato: 350 },
]

const BULK_ORDERS: BulkSaleOrder[] = [
  { id: 'o01', crop: 'Maize',  quantityTons: 20, targetPricePerKg: 455, status: 'confirmed', buyer: 'Rwanda Grains Ltd',    createdDate: '2026-06-20' },
  { id: 'o02', crop: 'Beans',  quantityTons: 8,  targetPricePerKg: 810, status: 'pending',   buyer: 'Kigali Food Market',   createdDate: '2026-06-24' },
  { id: 'o03', crop: 'Potato', quantityTons: 12, targetPricePerKg: 365, status: 'completed', buyer: 'Northern Agro Exports', createdDate: '2026-06-10' },
]

const AI_INSIGHTS: FullAiInsight[] = [
  { id: 'i01', type: 'alert',   severity: 'critical', title: 'Late Blight on Potato Farms',         description: 'Late blight risk detected on 14 potato farms in Kinigi and Cyuve sectors. Weather conditions (high humidity + low temperature) create ideal spread conditions. Immediate fungicide application required.', affectedFarms: 14, timestamp: '2 hours ago',  actionRoute: '/cooperative/disease-alerts', dismissed: false },
  { id: 'i02', type: 'market',  severity: 'high',     title: 'Maize Price Rally — Sell Now',         description: 'Maize prices are rising 18% over the next 3 weeks based on regional demand patterns. Coordinate bulk sale with Rwanda Grains Ltd to maximize cooperative revenue. Current price: 450 RWF/kg, projected: 531 RWF/kg.', affectedFarms: 9, timestamp: '5 hours ago',  actionRoute: '/cooperative/market',         dismissed: false },
  { id: 'i03', type: 'soil',    severity: 'high',     title: 'Soil Acidity on 3 Farms',             description: '3 farms in Busogo sector show pH levels below 5.5 (acidic). Group lime application of 500 kg/ha recommended. Coordinating group purchase saves 40% on lime costs compared to individual purchases.', affectedFarms: 3, timestamp: '1 day ago',    actionRoute: '/cooperative/crop-advisory',  dismissed: false },
  { id: 'i04', type: 'weather', severity: 'medium',   title: 'Heavy Rains Expected — Prepare Drains',description: 'Meteorological Service Rwanda forecasts 80mm+ rainfall over Musanze district in the next 5 days. Farms in low-lying sectors (Muhoza, Nyange) should prepare drainage channels to prevent waterlogging.', affectedFarms: 7, timestamp: '3 hours ago',  actionRoute: '/cooperative/disease-alerts', dismissed: false },
  { id: 'i05', type: 'alert',   severity: 'medium',   title: 'Bean Aphids Detected in Muhoza',       description: 'Bean aphid colonies observed on 4 farms in Muhoza sector. Early intervention with approved pesticides will prevent spread to neighbouring farms. Cooperative group treatment recommended.', affectedFarms: 4, timestamp: '2 days ago',   actionRoute: '/cooperative/disease-alerts', dismissed: false },
  { id: 'i06', type: 'soil',    severity: 'low',      title: 'Nitrogen Deficiency in Maize Plots',   description: '6 maize farms show early signs of nitrogen deficiency (yellowing lower leaves). Apply urea at 50kg/ha before next rainfall for absorption. Best timing is within 48 hours.', affectedFarms: 6, timestamp: '3 days ago',   actionRoute: '/cooperative/crop-advisory',  dismissed: false },
]

const CROP_ADVISORIES: CropAdvisory[] = [
  {
    cropId: 'maize', cropName: 'Maize', icon: '🌽',
    currentStage: 'Grain Filling', stagePct: 75, nextAction: 'Apply top-dress fertilizer (CAN 50kg/ha)', daysToHarvest: 28, expectedYieldTons: 72, irrigationDays: 3,
    fertilizers: [
      { name: 'DAP',  amountKgPerHa: 100, timing: 'At planting'       },
      { name: 'Urea', amountKgPerHa: 50,  timing: '4 weeks after plant'},
      { name: 'CAN',  amountKgPerHa: 50,  timing: 'Grain filling stage'},
    ],
    risks: [
      { name: 'Maize Streak Virus', severity: 'medium', prevention: 'Use certified seed, control aphid vectors' },
      { name: 'Stalk Borer',        severity: 'high',   prevention: 'Apply Furadan at whorl stage, monitor weekly' },
      { name: 'Grey Leaf Spot',     severity: 'low',    prevention: 'Improve air circulation, avoid over-irrigation' },
    ],
    calendar: [
      { month: 'Jan', activity: 'Land preparation & planting',  done: true  },
      { month: 'Feb', activity: 'First weeding, apply DAP',     done: true  },
      { month: 'Mar', activity: 'Top-dress with Urea',          done: true  },
      { month: 'Apr', activity: 'Second weeding, pest scouting',done: true  },
      { month: 'May', activity: 'Apply CAN, monitor disease',   done: true  },
      { month: 'Jun', activity: 'Harvest (late June)',          done: false },
    ],
  },
  {
    cropId: 'beans', cropName: 'Beans', icon: '🫘',
    currentStage: 'Pod Development', stagePct: 60, nextAction: 'Scout for bean fly & aphids this week', daysToHarvest: 35, expectedYieldTons: 28, irrigationDays: 4,
    fertilizers: [
      { name: 'DAP',  amountKgPerHa: 75,  timing: 'At planting'       },
      { name: 'CAN',  amountKgPerHa: 30,  timing: 'Flowering stage'   },
    ],
    risks: [
      { name: 'Bean Aphids',       severity: 'high',   prevention: 'Spray Dimethoate 400ml/L, monitor bi-weekly' },
      { name: 'Angular Leaf Spot', severity: 'medium', prevention: 'Use certified seed, avoid overhead irrigation' },
      { name: 'Bean Fly',          severity: 'medium', prevention: 'Seed treatment with Carbofuran 3G at 10g/hole' },
    ],
    calendar: [
      { month: 'Feb', activity: 'Land prep & planting (Season B)', done: true  },
      { month: 'Mar', activity: 'First weeding, apply DAP',        done: true  },
      { month: 'Apr', activity: 'Flowering — apply CAN',           done: true  },
      { month: 'May', activity: 'Pod development — pest scouting', done: true  },
      { month: 'Jun', activity: 'Maturity monitoring',             done: false },
      { month: 'Jul', activity: 'Harvest (early July)',            done: false },
    ],
  },
  {
    cropId: 'potato', cropName: 'Irish Potato', icon: '🥔',
    currentStage: 'Tuber Bulking', stagePct: 55, nextAction: 'Apply Mancozeb for late blight prevention', daysToHarvest: 45, expectedYieldTons: 22, irrigationDays: 5,
    fertilizers: [
      { name: 'DAP',    amountKgPerHa: 150, timing: 'At planting'          },
      { name: 'Urea',   amountKgPerHa: 80,  timing: 'Hilling (30 DAP)'     },
      { name: 'Potash', amountKgPerHa: 100, timing: 'Tuber initiation'      },
    ],
    risks: [
      { name: 'Late Blight',       severity: 'high',   prevention: 'Spray Mancozeb 2g/L every 7 days in wet weather' },
      { name: 'Early Blight',      severity: 'medium', prevention: 'Avoid excessive nitrogen, improve air flow' },
      { name: 'Potato Cyst Nematode',severity:'low',   prevention: 'Crop rotation, use resistant varieties (Kirundo)' },
    ],
    calendar: [
      { month: 'Feb', activity: 'Seed selection & land prep',  done: true  },
      { month: 'Mar', activity: 'Planting & basal fertilizer', done: true  },
      { month: 'Apr', activity: 'Hilling, Urea application',   done: true  },
      { month: 'May', activity: 'Tuber bulking, blight spray', done: true  },
      { month: 'Jun', activity: 'Final blight protection',     done: false },
      { month: 'Jul', activity: 'Harvest',                     done: false },
    ],
  },
]

const DISEASE_ALERTS: DiseaseAlert[] = [
  { id: 'd01', diseaseName: 'Late Blight',       cropType: 'Irish Potato', severity: 'critical', affectedFarms: 14, detectedDate: '2026-06-25', symptoms: 'Dark water-soaked lesions on leaves, white mold on undersides, brown rot in tubers', prevention: 'Apply Mancozeb 2g/L or Ridomil Gold every 5-7 days. Remove and destroy infected plant material.',  status: 'active',   broadcastSent: false },
  { id: 'd02', diseaseName: 'Bean Aphids',        cropType: 'Beans',        severity: 'high',     affectedFarms: 4,  detectedDate: '2026-06-23', symptoms: 'Clusters of small green/black insects on young shoots and undersides of leaves, leaf curling and yellowing', prevention: 'Spray Dimethoate 400 EC at 1L/200L water. Introduce beneficial insects (ladybirds).', status: 'active',   broadcastSent: true  },
  { id: 'd03', diseaseName: 'Maize Stalk Borer',  cropType: 'Maize',        severity: 'high',     affectedFarms: 6,  detectedDate: '2026-06-22', symptoms: 'Dead heart in young plants, window pane damage on leaves, frass at stem base, broken tassels', prevention: 'Apply Furadan 3G granules 10g/plant at whorl stage. Use Bt-based biopesticides.',   status: 'active',   broadcastSent: true  },
  { id: 'd04', diseaseName: 'Angular Leaf Spot',  cropType: 'Beans',        severity: 'medium',   affectedFarms: 3,  detectedDate: '2026-06-18', symptoms: 'Angular water-soaked lesions on leaves turning grey-brown, premature leaf drop', prevention: 'Use certified disease-free seed. Spray copper-based fungicide (Kocide 350g/200L).', status: 'active',   broadcastSent: false },
  { id: 'd05', diseaseName: 'Grey Leaf Spot',     cropType: 'Maize',        severity: 'medium',   affectedFarms: 2,  detectedDate: '2026-06-15', symptoms: 'Rectangular tan-brown lesions on lower leaves, parallel to veins, leaf tissue dies', prevention: 'Improve air circulation between plants. Apply Folicur or similar triazole fungicide.', status: 'active',   broadcastSent: false },
  { id: 'd06', diseaseName: 'Maize Streak Virus', cropType: 'Maize',        severity: 'low',      affectedFarms: 2,  detectedDate: '2026-06-10', symptoms: 'Yellow streaks along veins, stunted growth, mosaic discolouration on leaves', prevention: 'Remove infected plants, control leafhopper vectors with insecticides.',            status: 'resolved', broadcastSent: true  },
  { id: 'd07', diseaseName: 'Early Blight',       cropType: 'Irish Potato', severity: 'low',      affectedFarms: 1,  detectedDate: '2026-06-05', symptoms: 'Circular brown spots with concentric rings (target board appearance) on older leaves', prevention: 'Apply Mancozeb or Chlorothalonil. Ensure balanced nitrogen nutrition.',           status: 'resolved', broadcastSent: false },
]

const COOP_SETTINGS: CooperativeSettings = {
  profile: {
    name: 'Musanze North Cooperative',
    location: 'Musanze, Northern Province',
    district: 'Musanze',
    registrationNumber: 'COOP/2023/MN/047',
    season: 'Season B 2026',
    contactEmail: 'musanzenorthcoop@gmail.com',
    contactPhone: '+250788100001',
    foundedYear: '2023',
    description: 'A cooperative of smallholder farmers in Musanze District focused on maize, beans, and potato production with shared market access and group input purchasing.',
  },
  notifications: {
    diseaseAlerts: true,
    marketUpdates: true,
    weatherWarnings: true,
    aiRecommendations: true,
    weeklyReport: false,
  },
  access: {
    membersCanViewPrices: true,
    requireFarmApproval: true,
    shareDataWithGov: false,
  },
}

// ─── Service ─────────────────────────────────────────────────────────────────

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

export const cooperativeService = {

  // ── Overview ──────────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/stats
  async getStats(): Promise<CooperativeStats> {
    await delay()
    return { totalFarms: 47, pendingReview: 3, activeMembers: 12, totalYield: 182, cropsPlanted: 6, aiAlerts: 3, seasonProgress: 68 }
  },

  // TODO: GET /api/cooperative/yield-trend?season=B2026
  async getYieldTrend(): Promise<YieldDataPoint[]> {
    await delay()
    return [
      { month: 'Jan', maize: 12, beans: 8,  potato: 5  },
      { month: 'Feb', maize: 18, beans: 10, potato: 7  },
      { month: 'Mar', maize: 24, beans: 14, potato: 9  },
      { month: 'Apr', maize: 35, beans: 18, potato: 12 },
      { month: 'May', maize: 52, beans: 22, potato: 16 },
      { month: 'Jun', maize: 68, beans: 28, potato: 20 },
    ]
  },

  // TODO: GET /api/cooperative/farm-status
  async getFarmStatus(): Promise<FarmStatusItem[]> {
    await delay()
    return [
      { key: 'good',     value: 28 },
      { key: 'fair',     value: 12 },
      { key: 'low',      value: 5  },
      { key: 'inactive', value: 2  },
    ]
  },

  // TODO: GET /api/cooperative/ai-insights?limit=3
  async getAiInsights(): Promise<AiInsightItem[]> {
    await delay()
    return [
      { id: '1', type: 'alert',  textKey: 'lateBlight',  time: '2h' },
      { id: '2', type: 'market', textKey: 'maizePrice',  time: '5h' },
      { id: '3', type: 'soil',   textKey: 'soilAcidity', time: '1d' },
    ]
  },

  // ── Farms ─────────────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/farms
  async getFarms(): Promise<CooperativeFarm[]> {
    await delay()
    return [...FARMS]
  },

  // TODO: PATCH /api/cooperative/farms/:id/status
  async updateFarmStatus(id: string, status: FarmStatus): Promise<void> {
    await delay(300)
    const farm = FARMS.find(f => f.id === id)
    if (farm) { farm.status = status; farm.pendingReview = false }
  },

  // ── Members ───────────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/members
  async getMembers(): Promise<CooperativeMember[]> {
    await delay()
    return [...MEMBERS]
  },

  // TODO: POST /api/cooperative/members
  async addMember(data: NewMemberData): Promise<CooperativeMember> {
    await delay(400)
    const newMember: CooperativeMember = {
      id: `m${Date.now()}`,
      ...data,
      farmsCount: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    }
    MEMBERS.push(newMember)
    return newMember
  },

  // TODO: DELETE /api/cooperative/members/:id
  async removeMember(id: string): Promise<void> {
    await delay(300)
    const idx = MEMBERS.findIndex(m => m.id === id)
    if (idx !== -1) MEMBERS.splice(idx, 1)
  },

  // ── Market ────────────────────────────────────────────────────────────────

  // TODO: GET /api/market/crops
  async getMarketCrops(): Promise<MarketCrop[]> {
    await delay()
    return [...MARKET_CROPS]
  },

  // TODO: GET /api/market/buyers
  async getMarketBuyers(): Promise<MarketBuyer[]> {
    await delay()
    return [...MARKET_BUYERS]
  },

  // TODO: GET /api/market/price-history
  async getMarketPriceHistory(): Promise<MarketPriceHistory[]> {
    await delay()
    return [...MARKET_PRICE_HISTORY]
  },

  // TODO: GET /api/cooperative/bulk-orders
  async getBulkOrders(): Promise<BulkSaleOrder[]> {
    await delay()
    return [...BULK_ORDERS]
  },

  // TODO: POST /api/cooperative/bulk-orders
  async createBulkOrder(data: Omit<BulkSaleOrder, 'id' | 'status' | 'createdDate'>): Promise<BulkSaleOrder> {
    await delay(400)
    const order: BulkSaleOrder = { id: `o${Date.now()}`, status: 'pending', createdDate: new Date().toISOString().split('T')[0], ...data }
    BULK_ORDERS.push(order)
    return order
  },

  // ── AI Insights ───────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/ai-insights/full
  async getFullInsights(): Promise<FullAiInsight[]> {
    await delay()
    return [...AI_INSIGHTS]
  },

  // TODO: PATCH /api/cooperative/ai-insights/:id/dismiss
  async dismissInsight(id: string): Promise<void> {
    await delay(200)
    const insight = AI_INSIGHTS.find(i => i.id === id)
    if (insight) insight.dismissed = true
  },

  // ── Crop Advisory ─────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/crop-advisory
  async getCropAdvisories(): Promise<CropAdvisory[]> {
    await delay()
    return [...CROP_ADVISORIES]
  },

  // ── Disease Alerts ────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/disease-alerts
  async getDiseaseAlerts(): Promise<DiseaseAlert[]> {
    await delay()
    return [...DISEASE_ALERTS]
  },

  // TODO: PATCH /api/cooperative/disease-alerts/:id/resolve
  async resolveAlert(id: string): Promise<void> {
    await delay(300)
    const alert = DISEASE_ALERTS.find(a => a.id === id)
    if (alert) alert.status = 'resolved'
  },

  // TODO: POST /api/cooperative/disease-alerts/:id/broadcast
  async broadcastAlert(id: string): Promise<void> {
    await delay(400)
    const alert = DISEASE_ALERTS.find(a => a.id === id)
    if (alert) alert.broadcastSent = true
  },

  // TODO: POST /api/cooperative/group-alerts
  async sendGroupAlert(_data: { type: string; message: string; urgency: string; targetAll: boolean }): Promise<void> {
    await delay(600)
  },

  // ── Settings ──────────────────────────────────────────────────────────────

  // TODO: GET /api/cooperative/settings
  async getSettings(): Promise<CooperativeSettings> {
    await delay()
    return { ...COOP_SETTINGS, profile: { ...COOP_SETTINGS.profile }, notifications: { ...COOP_SETTINGS.notifications }, access: { ...COOP_SETTINGS.access } }
  },

  // TODO: PATCH /api/cooperative/settings/profile
  async saveProfile(profile: CooperativeProfile): Promise<void> {
    await delay(400)
    Object.assign(COOP_SETTINGS.profile, profile)
  },

  // TODO: PATCH /api/cooperative/settings/notifications
  async saveNotifications(notifs: CooperativeSettings['notifications']): Promise<void> {
    await delay(300)
    Object.assign(COOP_SETTINGS.notifications, notifs)
  },

  // TODO: PATCH /api/cooperative/settings/access
  async saveAccess(access: CooperativeSettings['access']): Promise<void> {
    await delay(300)
    Object.assign(COOP_SETTINGS.access, access)
  },
}
