import { User, db } from './database-safe';

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

  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = await db.getUserByCredentials(username, password);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated' };
    }

    // Create session
    const session: AuthSession = {
      user,
      token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.saveSession(session);
    return { success: true, user };
  }

  logout() {
    this.clearSession();
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  isSuperAdmin(): boolean {
    return this.currentSession?.user?.role === 'super_admin';
  }

  hasRole(role: User['role']): boolean {
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