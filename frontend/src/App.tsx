import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import PRExplainer from './pages/PRExplainer'
import CodeSearch from './pages/CodeSearch'
import Scanner from './pages/Scanner'
import Onboard from './pages/Onboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pr" element={<PRExplainer />} />
          <Route path="search" element={<CodeSearch />} />
          <Route path="scan" element={<Scanner />} />
          <Route path="onboard" element={<Onboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
