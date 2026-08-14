import { Navigate, Routes, Route } from 'react-router-dom'    
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import PublicOverviewPage from './pages/dashboard/PublicOverviewPage'
import DiseasePage from './pages/dashboard/DiseasePage'
import WeatherPage from './pages/dashboard/WeatherPage'
import SoilPage from './pages/dashboard/SoilPage'
import MarketPage from './pages/dashboard/MarketPage'   
import AIPage from './pages/dashboard/AIPage'
import TrainingPage from './pages/dashboard/TrainingPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import FarmerProfileCompletionPage from './pages/dashboard/FarmerProfileCompletionPage'
import DealerProfilePage from './pages/dashboard/agrodealer/DealerProfilePage'
import DealerProductsPage from './pages/dashboard/agrodealer/DealerProductsPage'
import DealerMarketplacePage from './pages/dashboard/farmer/DealerMarketplacePage'
import AgronomistsDirectoryPage from './pages/dashboard/farmer/AgronomistsDirectoryPage'
import FarmPlanPage from './pages/dashboard/farmer/FarmPlanPage'
import DealerMessagesPage from './pages/dashboard/shared/DealerMessagesPage'
import AgronomistProfilePage from './pages/agronomist/AgronomistProfilePage'

// Agronomist Portal
import AgronomistLayout from './pages/agronomist/AgronomistLayout'
import AgronomistOverviewPage from './pages/agronomist/AgronomistOverviewPage'
import AgronomistFarmersPage from './pages/agronomist/AgronomistFarmersPage'
import AgronomistFarmerDetailPage from './pages/agronomist/AgronomistFarmerDetailPage'
import AgronomistFarmVisitsPage from './pages/agronomist/AgronomistFarmVisitsPage'
import AgronomistAdvicePage from './pages/agronomist/AgronomistAdvicePage'
import AgronomistQuestionsPage from './pages/agronomist/AgronomistQuestionsPage'
import AgronomistTrainingMaterialsPage from './pages/agronomist/AgronomistTrainingMaterialsPage'
import AgronomistTrainingMaterialDetailPage from './pages/agronomist/AgronomistTrainingMaterialDetailPage'
import GISPage from './pages/dashboard/agronomist/GISPage'
import AIValidationPage from './pages/dashboard/agronomist/AIValidationPage'
import CommsPage from './pages/dashboard/agronomist/CommsPage'
import PathologyPage from './pages/dashboard/agronomist/PathologyPage'
import AgronomistAnalyticsPage from './pages/agronomist/AgronomistAnalyticsPage'

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
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage'

import { NotificationsProvider } from './context/NotificationsContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicLayout } from './components/PublicLayout'
import { authService } from './services/auth'

import DealerOverviewPage from './pages/dashboard/agrodealer/DealerOverViewPage'
import DealerOrdersPage from './pages/dashboard/agrodealer/DealerOrdersPage'

function App() {
  return (
    <NotificationsProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
        </Route>

        {/* Public farmer dashboard routes - no farmer account required */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          

          // PUBLIC ROUTES 
          <Route
              index
              element={
                !authService.isAuthenticated()
                  ? <PublicOverviewPage />
                  : authService.getCurrentUser()?.role === 'agro-dealer'
                    ? <DealerOverviewPage />
                    : <DashboardPage />
              }
            />
          <Route path="crops" element={<AIPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="disease" element={<DiseasePage />} />
          <Route path="weather" element={<WeatherPage />} />
        </Route>

        {/* Account-protected farmer and agro-dealer routes */}
        <Route element={<ProtectedRoute allowedRoles={['farmer', 'agro-dealer']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="soil" element={<SoilPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="dealer-profile" element={<DealerProfilePage />} />
            <Route path="dealer-orders" element={<DealerOrdersPage />} />
            <Route path="dealer-products" element={<DealerProductsPage />} />
            <Route path="farm-plan" element={<FarmPlanPage />} />
            <Route path="dealer-marketplace" element={<DealerMarketplacePage />} />
            <Route path="agronomists" element={<AgronomistsDirectoryPage />} />
            <Route path="dealer-messages" element={<DealerMessagesPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="farmer-profile" element={<FarmerProfileCompletionPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['agro-dealer']} />}>
          <Route path="/agro-dealer" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Agronomist-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['agronomist']} />}>
          <Route path="/agronomist" element={<AgronomistLayout />}>
            <Route index element={<AgronomistOverviewPage />} />
            <Route path="profile" element={<AgronomistProfilePage />} />
            <Route path="farmers" element={<AgronomistFarmersPage />} />
            <Route path="farmers/:farmerId" element={<AgronomistFarmerDetailPage />} />
            <Route path="farm-visits" element={<AgronomistFarmVisitsPage />} />
            <Route path="advice" element={<AgronomistAdvicePage />} />
            <Route path="questions" element={<AgronomistQuestionsPage />} />
            <Route path="training-materials" element={<AgronomistTrainingMaterialsPage />} />
            <Route path="training-materials/:materialId" element={<AgronomistTrainingMaterialDetailPage />} />
            <Route path="gis" element={<GISPage />} />
            <Route path="ai-validation" element={<AIValidationPage />} />
            <Route path="comms" element={<CommsPage />} />
            <Route path="pathology" element={<PathologyPage />} />
            <Route path="analytics" element={<AgronomistAnalyticsPage />} />
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
