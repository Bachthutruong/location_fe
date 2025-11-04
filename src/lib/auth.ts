export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'manager' | 'user';
}

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  // Check if token is expired (basic check)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      removeToken();
      removeUser();
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // If token is expired, remove it
    if (payload.exp && payload.exp < currentTime) {
      removeToken();
      removeUser();
      return false;
    }
    
    return true;
  } catch {
    // If token is invalid, remove it
    removeToken();
    removeUser();
    return false;
  }
};

export const hasRole = (roles: string[]): boolean => {
  const user = getUser();
  if (!user) return false;
  return roles.includes(user.role);
};
