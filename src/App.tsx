import { Routes, Route } from 'react-router-dom'
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

// Agronomist Dashboard Modules
import AgronomistLayout from './pages/agronomist/AgronomistLayout'
import AgronomistOverviewPage from './pages/agronomist/AgronomistOverviewPage'
import GISPage from './pages/dashboard/agronomist/GISPage'
import AIValidationPage from './pages/dashboard/agronomist/AIValidationPage'
import CommsPage from './pages/dashboard/agronomist/CommsPage'
import PathologyPage from './pages/dashboard/agronomist/PathologyPage'
import AdvisoryPage from './pages/dashboard/agronomist/AdvisoryPage'
import WorkforcePage from './pages/dashboard/agronomist/WorkforcePage'

// Auth Pages
import SignInPage from './pages/auth/SignInPage'
import RegisterPage from './pages/auth/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="crops" element={<CropsPage />} />
        <Route path="disease" element={<DiseasePage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="soil" element={<SoilPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Agronomist Dashboard Portal */}
      <Route path="/agronomist" element={<AgronomistLayout />}>
        <Route index element={<AgronomistOverviewPage />} />
        <Route path="gis" element={<GISPage />} />
        <Route path="ai-validation" element={<AIValidationPage />} />
        <Route path="comms" element={<CommsPage />} />
        <Route path="pathology" element={<PathologyPage />} />
        <Route path="advisory" element={<AdvisoryPage />} />
        <Route path="workforce" element={<WorkforcePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
