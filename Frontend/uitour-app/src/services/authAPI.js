// Authentication API Service
// Kết nối với backend API cho login và register

 const API_BASE_URL = 'http://localhost:5069/api/user';
const PROPERTY_BASE_URL = 'http://localhost:5069/api/properties';
const TOUR_BASE_URL = 'http://localhost:5069/api/tour';
const HOST_BASE_URL = 'http://localhost:5069/api/host';

class AuthAPI {
   // Lấy thông tin user theo ID
   async getUserById(userId) {
     try {
       const token = localStorage.getItem('token');
       const response = await fetch(`${API_BASE_URL}/${userId}`, {
         headers: {
           'Content-Type': 'application/json',
           ...(token ? { 'Authorization': `Bearer ${token}` } : {})
         }
       });
 
       if (!response.ok) {
         const errText = await response.text();
         throw new Error(errText || 'Failed to fetch user');
       }
 
       const data = await response.json();
       return data;
     } catch (err) {
       throw err;
     }
   }
 
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

  // Generate a 6-digit OTP
  _generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to email for verification
  async sendOTP(email) {
    try {
      // Try backend first
      try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Email: email }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (backendError) {
        // Backend endpoint doesn't exist or failed, use mock
        console.log('Backend OTP endpoint not available, using mock OTP service');
      }

      // Mock OTP service (for development)
      const otp = this._generateOTP();
      const otpData = {
        otp: otp,
        email: email,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      };

      // Store OTP in localStorage
      const otpStorage = JSON.parse(localStorage.getItem('otp_storage') || '{}');
      otpStorage[email] = otpData;
      localStorage.setItem('otp_storage', JSON.stringify(otpStorage));

      // Log OTP to console for development (remove in production)
      console.log(`🔐 OTP for ${email}: ${otp} (This is a development mock. Check console for the code.)`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { message: 'OTP sent successfully', email: email };
    } catch (error) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      // Try backend first
      try {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Email: email, OTP: otp }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (backendError) {
        // Backend endpoint doesn't exist or failed, use mock
        console.log('Backend OTP verification not available, using mock verification');
      }

      // Mock OTP verification (for development)
      const otpStorage = JSON.parse(localStorage.getItem('otp_storage') || '{}');
      const storedOtpData = otpStorage[email];

      if (!storedOtpData) {
        throw new Error('OTP not found. Please request a new OTP.');
      }

      if (Date.now() > storedOtpData.expiresAt) {
        delete otpStorage[email];
        localStorage.setItem('otp_storage', JSON.stringify(otpStorage));
        throw new Error('OTP has expired. Please request a new OTP.');
      }

      if (storedOtpData.otp !== otp) {
        throw new Error('Invalid OTP. Please check and try again.');
      }

      // OTP verified successfully - remove it from storage
      delete otpStorage[email];
      localStorage.setItem('otp_storage', JSON.stringify(otpStorage));

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { message: 'OTP verified successfully', email: email };
    } catch (error) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }

  // Forgot password - send reset email
  async forgotPassword(email) {
    try {
      // Try backend first
      try {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Email: email }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (backendError) {
        // Backend endpoint doesn't exist or failed, use mock
        console.log('Backend forgot password endpoint not available, using mock service');
      }

      // Mock forgot password service (for development)
      // In production, this would send an actual email
      console.log(`📧 Password reset requested for: ${email}`);
      console.log('(This is a development mock. In production, an email would be sent.)');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { 
        message: 'Password reset email sent successfully', 
        email: email 
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send password reset email');
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
  //get property by id
  async getPropertyById(propertyId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${PROPERTY_BASE_URL}/${propertyId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch property');
      }

      const data = await response.json();
      return data; // Property object với đầy đủ thông tin
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


  // ============ TOURS / EXPERIENCES ============
  async getTours() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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

  async getTourById(tourId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}/${tourId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch tour');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async getTourPhotos(tourId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}/${tourId}/photos`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch tour photos');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async getTourReviews(tourId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}/${tourId}/reviews`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch tour reviews');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }
  async getTourExperienceDetails(tourId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}/${tourId}/experiencedetails`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch tour reviews');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }
  
  async getHostById(hostId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${HOST_BASE_URL}/${hostId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch host');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }
  // ============ USER PROFILE / TRIPS / CONNECTIONS ============
async getUserProfile(userId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/${userId}/profile`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch profile');
  return await res.json(); // { displayName, about, interests: [] }
}

async getUserTrips(userId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/${userId}/trips`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch trips');
  return await res.json(); // []
}

async getUserConnections(userId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/${userId}/connections`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch connections');
  return await res.json(); // []
}

// Chuẩn hoá dữ liệu gửi lên backend
_toProfilePayload(form) {
  // Backend mẫu bạn gửi có: fullName, email, userAbout, interests (string)
  // Ta map displayName -> fullName, about -> userAbout
  const interestsValue = Array.isArray(form?.interests)
    ? form.interests.filter(Boolean).join(', ')
    : (typeof form?.interests === 'string' ? form.interests : '');

  return {
    // chỉ gửi những field backend hỗ trợ; thêm field khác nếu BE cho phép
    fullName: form?.displayName ?? form?.fullName ?? '',
    email: form?.email ?? '',
    userAbout: form?.about ?? '',
    interests: interestsValue, // backend của bạn đang để là string
    // visitedTags nếu BE có cột/endpoint riêng thì thêm vào đây
    visitedTags: Array.isArray(form?.visitedTags) ? form.visitedTags : [],
    // có thể bổ sung age, gender, nationality nếu BE hỗ trợ
    age: form?.age ?? null,
    gender: form?.gender ?? '',
    nationality: form?.nationality ?? ''
  };
}

// Cập nhật hồ sơ (ưu tiên endpoint /{id}/profile; fallback PUT /{id})
async updateUserProfile(userId, form) {
  const token = localStorage.getItem('token');
  const payload = this._toProfilePayload(form);

  // Thử endpoint RESTful chuyên cho profile trước
  const tryProfile = await fetch(`${API_BASE_URL}/${userId}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload),
  });

  if (tryProfile.ok) return await tryProfile.json();

  // Nếu BE chưa có /profile, fallback về PUT /{id}
  if (tryProfile.status === 404) {
    const tryUser = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
    });
    if (!tryUser.ok) throw new Error(await tryUser.text() || 'Failed to update user');
    return await tryUser.json();
  }

  // Các lỗi khác
  throw new Error(await tryProfile.text() || 'Failed to update profile');
}



}

// Create singleton instance
const authAPI = new AuthAPI();

export default authAPI;

