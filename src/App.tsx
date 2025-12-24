import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCategories from './pages/admin/Categories'
import AdminUsers from './pages/admin/Users'
import AdminReportCategories from './pages/admin/ReportCategories'
import AdminReports from './pages/admin/Reports'
import AdminDeletedLocations from './pages/admin/DeletedLocations'
import AdminLocations from './pages/admin/Locations'
import AdminLocationForm from './pages/admin/LocationForm'
import AdminSettings from './pages/admin/Settings'
import AdminMenus from './pages/admin/Menus'
import AdminNewsCategories from './pages/admin/NewsCategories'
import AdminNews from './pages/admin/News'
import AdminNewsForm from './pages/admin/NewsForm'
import StaffLocations from './pages/staff/Locations'
import ManagerLocations from './pages/manager/Locations'
import ManagerLocationForm from './pages/manager/LocationForm'
import LocationDetail from './pages/LocationDetail'
import NewsList from './pages/NewsList'
import NewsDetail from './pages/NewsDetail'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/location/:id" element={<LocationDetail />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/report-categories"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminReportCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deleted"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDeletedLocations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/locations"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminLocations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/locations/new"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminLocationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/locations/:id/edit"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminLocationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menus"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminMenus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news-categories"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminNewsCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff', 'manager']}>
                <AdminNews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news/new"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff', 'manager']}>
                <AdminNewsForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news/:id/edit"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff', 'manager']}>
                <AdminNewsForm />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff/locations"
            element={
              <ProtectedRoute requiredRoles={['staff']}>
                <StaffLocations />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/manager/locations"
            element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManagerLocations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/locations/new"
            element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManagerLocationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/locations/:id/edit"
            element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManagerLocationForm />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App



