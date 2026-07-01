import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import CropsPage from './pages/dashboard/CropsPage'
import DiseasePage from './pages/dashboard/DiseasePage'
import WeatherPage from './pages/dashboard/WeatherPage'
import SoilPage from './pages/dashboard/SoilPage'
import MarketPage from './pages/dashboard/MarketPage'
import TrainingPage from './pages/dashboard/TrainingPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import NotificationsPage from './pages/dashboard/NotificationsPage'

// Agronomist Portal
import AgronomistLayout from './pages/agronomist/AgronomistLayout'
import AgronomistOverviewPage from './pages/agronomist/AgronomistOverviewPage'
import GISPage from './pages/dashboard/agronomist/GISPage'
import AIValidationPage from './pages/dashboard/agronomist/AIValidationPage'
import CommsPage from './pages/dashboard/agronomist/CommsPage'
import PathologyPage from './pages/dashboard/agronomist/PathologyPage'
import AdvisoryPage from './pages/dashboard/agronomist/AdvisoryPage'
import WorkforcePage from './pages/dashboard/agronomist/WorkforcePage'

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCooperativesPage from './pages/admin/AdminCooperativesPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AiOverviewPage from './pages/admin/ai/AiOverviewPage'
import AiDatasetsPage from './pages/admin/ai/AiDatasetsPage'
import AiTrainingPage from './pages/admin/ai/AiTrainingPage'
import AiModelsPage from './pages/admin/ai/AiModelsPage'
import AiReviewPage from './pages/admin/ai/AiReviewPage'
import AiPerformancePage from './pages/admin/ai/AiPerformancePage'
import AdminCropsPage from './pages/admin/AdminCropsPage'
import AiOptimizationPage from './pages/admin/ai/AiOptimizationPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'

// Cooperative Portal
import CooperativeLayout from './pages/cooperative/CooperativeLayout'
import CooperativeOverviewPage from './pages/cooperative/CooperativeOverviewPage'
import CooperativeFarmsPage from './pages/cooperative/CooperativeFarmsPage'
import CooperativeMembersPage from './pages/cooperative/CooperativeMembersPage'
import CooperativeMarketPage from './pages/cooperative/CooperativeMarketPage'
import CooperativeAiInsightsPage from './pages/cooperative/CooperativeAiInsightsPage'
import CooperativeCropAdvisoryPage from './pages/cooperative/CooperativeCropAdvisoryPage'
import CooperativeDiseaseAlertsPage from './pages/cooperative/CooperativeDiseaseAlertsPage'
import CooperativeSettingsPage from './pages/cooperative/CooperativeSettingsPage'

// Auth Pages
import SignInPage from './pages/auth/SignInPage'
import RegisterPage from './pages/auth/RegisterPage'

import { NotificationsProvider } from './context/NotificationsContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicLayout } from './components/PublicLayout'
import { authService } from './services/auth'

const roleHome: Record<string, string> = {
  farmer: '/dashboard',
  'agro-dealer': '/agro-dealer',
  agronomist: '/agronomist',
  admin: '/admin',
  cooperative: '/cooperative',
}

function HomeRoute() {
  const location = useLocation()
  const user = authService.getCurrentUser()
  if (user && authService.isAuthenticated()) {
    const home = roleHome[user.role] ?? '/dashboard'
    return <Navigate to={home} state={{ from: location }} replace />
  }
  return <HomePage />
}

function App() {
  return (
    <NotificationsProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Farmer-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['farmer', 'agro-dealer']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="crops" element={<CropsPage />} />
            <Route path="disease" element={<DiseasePage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="soil" element={<SoilPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['agro-dealer']} />}>
          <Route path="/agro-dealer" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Agronomist-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['agronomist']} />}>
          <Route path="/agronomist" element={<AgronomistLayout />}>
            <Route index element={<AgronomistOverviewPage />} />
            <Route path="gis" element={<GISPage />} />
            <Route path="ai-validation" element={<AIValidationPage />} />
            <Route path="comms" element={<CommsPage />} />
            <Route path="pathology" element={<PathologyPage />} />
            <Route path="advisory" element={<AdvisoryPage />} />
            <Route path="workforce" element={<WorkforcePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="cooperatives" element={<AdminCooperativesPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="ai" element={<AiOverviewPage />} />
            <Route path="ai/datasets" element={<AiDatasetsPage />} />
            <Route path="ai/training" element={<AiTrainingPage />} />
            <Route path="ai/models" element={<AiModelsPage />} />
            <Route path="ai/review" element={<AiReviewPage />} />
            <Route path="ai/performance" element={<AiPerformancePage />} />
            <Route path="ai/optimization" element={<AiOptimizationPage />} />
            <Route path="crops" element={<AdminCropsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        {/* Cooperative portal */}
        <Route element={<ProtectedRoute allowedRoles={['cooperative']} />}>
          <Route path="/cooperative" element={<CooperativeLayout />}>
            <Route index element={<CooperativeOverviewPage />} />
            <Route path="farms" element={<CooperativeFarmsPage />} />
            <Route path="members" element={<CooperativeMembersPage />} />
            <Route path="market" element={<CooperativeMarketPage />} />
            <Route path="ai-insights" element={<CooperativeAiInsightsPage />} />
            <Route path="crop-advisory" element={<CooperativeCropAdvisoryPage />} />
            <Route path="disease-alerts" element={<CooperativeDiseaseAlertsPage />} />
            <Route path="settings" element={<CooperativeSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </NotificationsProvider>
  )
}

export default App
