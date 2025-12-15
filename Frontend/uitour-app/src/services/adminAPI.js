// Admin API Service
const API_BASE_URL = 'http://localhost:5069/api';

class AdminAPI {

    async getRevenueByMonth(year) {
      try {
        const token = localStorage.getItem("token");
        const y = year || new Date().getFullYear();

        const response = await fetch(`${API_BASE_URL}/admin/stats/revenue-by-month?year=${y}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Failed to fetch revenue chart");
        }

        return await response.json(); // { year, currency, monthly: [12] }
      } catch (err) {
        throw err;
      }
    }

    async getUserGrowth(year) {
      try {
        const token = localStorage.getItem("token");
        const y = year || new Date().getFullYear();

        const response = await fetch(`${API_BASE_URL}/admin/stats/user-growth?year=${y}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Failed to fetch user growth chart");
        }

        return await response.json(); // { year, monthly: [12] }
      } catch (err) {
        throw err;
      }
    }

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

  async getAllTours() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tour`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch tours');
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

  async getPendingProperties() {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('getPendingProperties - Token exists:', !!token);
      console.log('getPendingProperties - User:', user ? JSON.parse(user) : null);
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/properties/pending`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('getPendingProperties error:', response.status, errText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions.');
        }
        
        throw new Error(errText || 'Failed to fetch pending properties');
      }

      const data = await response.json();
      console.log('getPendingProperties result:', data);
      return data;
    } catch (err) {
      console.error('getPendingProperties exception:', err);
      throw err;
    }
  }

  async approveProperty(propertyId) {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('approveProperty - PropertyID:', propertyId);
      console.log('approveProperty - Token exists:', !!token);
      console.log('approveProperty - User:', user ? JSON.parse(user) : null);
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('approveProperty error:', response.status, errText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions. Please check your role in database.');
        }
        
        throw new Error(errText || 'Failed to approve property');
      }

      const data = await response.json();
      console.log('approveProperty success:', data);
      return data;
    } catch (err) {
      console.error('approveProperty exception:', err);
      throw err;
    }
  }

  async rejectProperty(propertyId, reason) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ Reason: reason })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('rejectProperty error:', response.status, errText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions.');
        }
        
        throw new Error(errText || 'Failed to reject property');
      }

      return await response.json();
    } catch (err) {
      console.error('rejectProperty exception:', err);
      throw err;
    }
  }

  async getPendingTours() {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('getPendingTours - Token exists:', !!token);
      console.log('getPendingTours - User:', user ? JSON.parse(user) : null);
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/tour/pending`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('getPendingTours error:', response.status, errText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions.');
        }
        
        throw new Error(errText || 'Failed to fetch pending tours');
      }

      const data = await response.json();
      console.log('getPendingTours result:', data);
      return data;
    } catch (err) {
      console.error('getPendingTours exception:', err);
      throw err;
    }
  }

  async approveTour(tourId) {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('approveTour - TourID:', tourId);
      console.log('approveTour - Token exists:', !!token);
      console.log('approveTour - User:', user ? JSON.parse(user) : null);
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/tour/${tourId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('approveTour error:', response.status, errText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions. Please check your role in database.');
        }
        
        throw new Error(errText || 'Failed to approve tour');
      }

      const data = await response.json();
      console.log('approveTour success:', data);
      return data;
    } catch (err) {
      console.error('approveTour exception:', err);
      throw err;
    }
  }

  async rejectTour(tourId, reason) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/tour/${tourId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ Reason: reason })
      });

      if (!response.ok) {
        let errText = await response.text();
        console.error('rejectTour error:', response.status, errText);
        
        // Try to parse JSON error
        try {
          const errorJson = JSON.parse(errText);
          errText = errorJson.error || errorJson.message || errText;
        } catch {
          // Not JSON, use as is
        }
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions.');
        }
        if (response.status === 404) {
          throw new Error('Tour not found: The tour may have been deleted or does not exist.');
        }
        if (response.status === 500) {
          // Parse error message from 500 response
          throw new Error(errText || 'Internal server error: Failed to reject tour');
        }
        
        throw new Error(errText || 'Failed to reject tour');
      }

      return await response.json();
    } catch (err) {
      console.error('rejectTour exception:', err);
      throw err;
    }
  }

  async deleteProperty(propertyId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errText = await response.text();
        console.error('deleteProperty error:', response.status, errText);
        
        // Try to parse JSON error
        try {
          const errorJson = JSON.parse(errText);
          errText = errorJson.error || errorJson.message || errText;
        } catch {
          // Not JSON, use as is
        }
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions.');
        }
        if (response.status === 404) {
          throw new Error('Property not found: The property may have been deleted or does not exist.');
        }
        
        throw new Error(errText || 'Failed to delete property');
      }

      return await response.json();
    } catch (err) {
      console.error('deleteProperty exception:', err);
      throw err;
    }
  }

  async deleteTour(tourId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/tour/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errText = await response.text();
        console.error('deleteTour error:', response.status, errText);
        
        // Try to parse JSON error
        try {
          const errorJson = JSON.parse(errText);
          errText = errorJson.error || errorJson.message || errText;
        } catch {
          // Not JSON, use as is
        }
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have admin permissions.');
        }
        if (response.status === 404) {
          throw new Error('Tour not found: The tour may have been deleted or does not exist.');
        }
        
        throw new Error(errText || 'Failed to delete tour');
      }

      return await response.json();
    } catch (err) {
      console.error('deleteTour exception:', err);
      throw err;
    }
  }

  async getAllTransactions() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transaction`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to fetch transactions');
    }

    return await response.json();
  }


}

const adminAPI = new AdminAPI();
export default adminAPI;

