import { multiTenantDb } from './services/multi-tenant-db';

export interface User {
  _id: string;
  tenantId: string | null; // null for super admin (tenant-independent)
  tenantSubdomain?: string; // pharmacy subdomain for API calls
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'pharmacist' | 'cashier' | 'viewer' | 'tenant_admin' | 'user';
  permissions: string[];
  isActive: boolean;
  image?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

class AuthManager {
  private currentSession: AuthSession | null = null;

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('pharmatrack_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is still valid
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = session;
        } else {
          this.clearSession();
        }
      }
    }
  }

  private saveSession(session: AuthSession) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmatrack_session', JSON.stringify(session));
    }
    this.currentSession = session;
  }

  private clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pharmatrack_session');
    }
    this.currentSession = null;
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Use API route for authentication to avoid client-side MongoDB connection
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Create session
        const session: AuthSession = {
          user: result.user,
          token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        this.saveSession(session);
        return { success: true, user: result.user };
      }

      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  logout() {
    this.clearSession();
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  updateSessionUser(userData: Partial<User>) {
    if (this.currentSession) {
      this.currentSession.user = { ...this.currentSession.user, ...userData };
      this.saveSession(this.currentSession);
    }
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  isSuperAdmin(): boolean {
    return this.currentSession?.user?.role === 'super_admin';
  }

  hasRole(role: 'super_admin' | 'admin' | 'pharmacist' | 'cashier' | 'viewer' | 'tenant_admin' | 'user'): boolean {
    return this.currentSession?.user?.role === role;
  }

  requireAuth(): User | null {
    if (!this.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    return this.getCurrentUser();
  }

  requireSuperAdmin(): User | null {
    const user = this.requireAuth();
    if (user && !this.isSuperAdmin()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return null;
    }
    return user;
  }
}

export const auth = new AuthManager();