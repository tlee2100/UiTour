// Authentication API Service
// Kết nối với backend API cho login và register

const API_BASE_URL = 'http://localhost:5069/api/user';
const PROPERTY_BASE_URL = 'http://localhost:5069/api/properties';

class AuthAPI {
  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Login failed');
      }

      const data = await response.json();
      return data; // Returns { user, token }
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(fullName, email, phone, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullName: fullName,
          Email: email,
          Phone: phone || '', // Phone is optional in backend
          Password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Registration failed');
      }

      const data = await response.json();
      return data; // Returns the registered user
    } catch (error) {
      throw error;
    }
  }
  //get properties
  async getProperties() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(PROPERTY_BASE_URL, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to fetch properties');
    }

    const data = await response.json();
    return data; // [{ propertyID, listingTitle, location, price, ... }]
  } catch (err) {
    throw err;
  }
  }
  //get property photos
  async getPropertyPhotos(propertyId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${PROPERTY_BASE_URL}/${propertyId}/photo`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch property photos');
      }

      const data = await response.json();
      return data; // [{ photoID, propertyID, url, caption, sortIndex }, ...]
    } catch (err) {
      throw err;
    }
  }
}

// Create singleton instance
const authAPI = new AuthAPI();

export default authAPI;

