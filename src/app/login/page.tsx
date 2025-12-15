'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    // Simulate login (replace with real authentication later)
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        alert('Login successful!');
        // Redirect to dashboard or home page
        window.location.href = '/';
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    loginBox: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '30px',
      color: '#333'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#555'
    },
    input: {
      padding: '12px',
      border: '2px solid #e1e1e1',
      borderRadius: '6px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    button: {
      padding: '14px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    error: {
      color: '#dc3545',
      fontSize: '14px',
      textAlign: 'center' as const,
      padding: '10px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px'
    },
    demo: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#e7f3ff',
      borderRadius: '6px',
      fontSize: '14px',
      textAlign: 'center' as const,
      color: '#0066cc'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Login</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.demo}>
          <strong>Demo Credentials:</strong><br />
          Username: admin<br />
          Password: password
        </div>
      </div>
    </div>
  );
}
