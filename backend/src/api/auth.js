import api from './client';

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  refreshToken: () => 
    api.post('/auth/refresh'),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
};
