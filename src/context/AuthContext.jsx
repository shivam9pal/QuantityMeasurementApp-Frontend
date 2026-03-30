import React, { createContext, useState, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  React.useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      console.log('✅ User already logged in. Restoring session...');
      console.log('   Token:', token.substring(0, 30) + '...');
      console.log('   User ID:', userId);
      setUser({ id: userId });
    } else {
      console.log('⚠️  No existing session found');
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔐 Attempting login for user:', username);
      const response = await authService.login(username, password);
      
      console.log('📨 Full response object:', response);
      console.log('📨 Response status:', response.status);
      console.log('📨 Response data:', response.data);
      console.log('📨 Response data type:', typeof response.data);
      console.log('📨 Response data keys:', Object.keys(response.data || {}));
      
      // Log exact property access
      console.log('📨 response.data.id =', response.data.id);
      console.log('📨 response.data.jwt =', response.data.jwt);
      console.log('📨 response.data.Jwt =', response.data.Jwt);
      console.log('📨 typeof response.data.jwt =', typeof response.data.jwt);
      
      // Try different extraction methods
      const id = response.data?.id;
      const jwt = response.data?.jwt || response.data?.Jwt;
      
      console.log('🔎 Method 1 - After extraction:');
      console.log('   id =', id);
      console.log('   jwt =', jwt);
      
      // Also try direct access
      const jwtDirect = response.data['jwt'] || response.data['Jwt'];
      const idDirect = response.data['id'];
      console.log('🔎 Method 2 - Bracket notation:');
      console.log('   id =', idDirect);
      console.log('   jwt =', jwtDirect);
      
      // Validate
      if (!jwt && !jwtDirect) {
        console.error('❌ JWT token is missing or empty!');
        console.error('   Response.data full object:', JSON.stringify(response.data));
        throw new Error('No JWT token received from backend!');
      }
      
      if (!id && !idDirect) {
        console.error('❌ User ID is missing!');
        throw new Error('No user ID received from backend!');
      }
      
      // Use whichever method worked
      const finalJwt = jwt || jwtDirect;
      const finalId = id || idDirect;
      
      // Save token and user ID
      localStorage.setItem('jwt', finalJwt);
      localStorage.setItem('userId', String(finalId));
      
      console.log('💾 Token saved to localStorage');
      console.log('   JWT Token:', finalJwt.substring(0, 50) + '...');
      console.log('   User ID:', finalId);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('jwt');
      const savedUserId = localStorage.getItem('userId');
      
      if (savedToken && savedUserId) {
        console.log('✅ Tokens verified in localStorage');
      } else {
        console.error('❌ Token mismatch - verification failed');
      }
      
      setUser({ id: finalId });
      console.log('✅ Login successful! User state updated.');
      
      return { success: true };
    } catch (err) {
      console.error('❌ Login error caught!');
      console.error('   Error message:', err.message);
      console.error('   Error response:', err.response?.data);
      console.error('   Error status:', err.response?.status);
      
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📝 Attempting signup for user:', username);
      const response = await authService.signup(username, password);
      console.log('✅ Signup successful:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      console.error('❌ Signup error:', message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    setUser(null);
    console.log('✅ Logout complete');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
