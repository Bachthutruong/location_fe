import { Navigate } from 'react-router-dom'
import { isAuthenticated, hasRole } from '../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute



