// Admin API Service
const API_BASE_URL = 'http://localhost:5069/api';

class AdminAPI {
  async getAllUsers() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/all`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch users');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async getAllProperties() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch properties');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async getAllBookings() {
    try {
      const token = localStorage.getItem('token');
      // Note: Backend may need GetAllBookings endpoint
      // For now, we'll use a workaround or return empty
      const response = await fetch(`${API_BASE_URL}/booking`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        // If endpoint doesn't exist, return empty array
        if (response.status === 404) {
          return [];
        }
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch bookings');
      }

      return await response.json();
    } catch (err) {
      // Return empty array if endpoint doesn't exist
      return [];
    }
  }

  async getAllTransactions() {
    try {
      const token = localStorage.getItem('token');
      // Note: Backend may need Transactions endpoint
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch transactions');
      }

      return await response.json();
    } catch (err) {
      return [];
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ Role: newRole })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to update user role');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async updatePropertyStatus(propertyId, active) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ Active: active })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to update property status');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ Status: status })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to update booking status');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }
}

const adminAPI = new AdminAPI();
export default adminAPI;

