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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
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
    </Routes>
  )
}

export default App
