import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, hasRole } from '../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const location = useLocation()
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Nếu có requiredRoles và user không có role
  if (requiredRoles && !hasRole(requiredRoles)) {
    // Kiểm tra xem route này có trong accessibleMenuLinks không
    // Nếu có, cho phép truy cập (user đã được gán menu này)
    try {
      const accessibleLinksStr = localStorage.getItem('accessibleMenuLinks')
      if (accessibleLinksStr) {
        const accessibleLinks: string[] = JSON.parse(accessibleLinksStr)
        const currentPath = location.pathname
        
        // Normalize path để so sánh
        const normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
        
        // Nếu route hiện tại nằm trong accessibleMenuLinks, cho phép truy cập
        if (accessibleLinks.includes(normalizedPath)) {
          return <>{children}</>
        }
      }
    } catch (error) {
      console.error('Error checking accessible menu links:', error)
    }
    
    // Nếu không có trong accessibleMenuLinks, redirect về "/"
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute



