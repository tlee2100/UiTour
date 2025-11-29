// Authentication API Service
// Kết nối với backend API cho login và register

const API_BASE_URL = 'http://localhost:5069/api/user';
const PROPERTY_BASE_URL = 'http://localhost:5069/api/properties';
const TOUR_BASE_URL = 'http://localhost:5069/api/tour';
const HOST_BASE_URL = 'http://localhost:5069/api/host';
const WISHLIST_BASE_URL = 'http://localhost:5069/api/wishlist';
const BOOKING_BASE_URL = 'http://localhost:5069/api/booking';
const UPLOAD_BASE_URL = 'http://localhost:5069/api/upload';

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

  // Send OTP to email for verification
  async sendOTP(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email }),
      });

      if (!response.ok) {
        let errorMessage = await response.text();
        try {
          const errorJson = JSON.parse(errorMessage || '{}');
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(errorMessage || 'Không thể gửi mã OTP');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email, Otp: otp }),
      });

      if (!response.ok) {
        let errorMessage = await response.text();
        try {
          const errorJson = JSON.parse(errorMessage || '{}');
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(errorMessage || 'OTP verification failed');
      }

      return await response.json();
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

  // Reset password - verify OTP and set new password
async resetPassword(email, otp, newPassword) {
  try {
    // Thử gọi backend trước
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email, Otp: otp, NewPassword: newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (backendError) {
      // Backend endpoint không tồn tại hoặc lỗi → dùng mock
      console.log('Backend reset password endpoint not available, using mock service');
    }

    // Mock reset password service (cho development)
    console.log(`🔑 Reset password requested for: ${email}`);
    console.log(`OTP entered: ${otp}`);
    console.log('(This is a development mock. In production, backend would validate OTP and update password.)');

    // Giả lập delay mạng
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      message: 'Password reset successfully (mock)',
      email: email,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to reset password');
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

  // Search properties with filters
  async searchProperties(filters = {}) {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.location) params.set('location', filters.location);
      if (filters.checkIn) params.set('checkIn', filters.checkIn);
      if (filters.checkOut) params.set('checkOut', filters.checkOut);
      if (filters.guests) params.set('guests', filters.guests.toString());

      const queryString = params.toString();
      const url = queryString 
        ? `${PROPERTY_BASE_URL}/search?${queryString}`
        : PROPERTY_BASE_URL; // If no filters, return all properties

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to search properties');
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

  // Create new property
  async createProperty(propertyData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(PROPERTY_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errorMessage = errText;
        try {
          const errorJson = JSON.parse(errText);
          errorMessage = errorJson.error || errorJson.message || errText;
        } catch {
          // If parsing fails, use the raw text
        }
        throw new Error(errorMessage || 'Failed to create property');
      }

      const data = await response.json();
      return data; // Returns created property with PropertyID
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

  // ============ WISHLIST ============
  async getUserWishlist(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${WISHLIST_BASE_URL}/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch wishlist');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async addToWishlist(userId, itemId, itemType = 'property') {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${WISHLIST_BASE_URL}/${userId}/add/${itemId}?type=${itemType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to add to wishlist');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async removeFromWishlist(userId, itemId, itemType = 'property') {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${WISHLIST_BASE_URL}/${userId}/remove/${itemId}?type=${itemType}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to remove from wishlist');
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

  async updateUserEmail(userId, newEmail) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/${userId}/email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ NewEmail: newEmail }),
    });

    if (!res.ok) throw new Error((await res.text()) || 'Failed to update email');
    return await res.json();
  }

  async updateUserPhone(userId, newPhone) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/${userId}/phone`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ NewPhone: newPhone }),
    });

    if (!res.ok) throw new Error((await res.text()) || 'Failed to update phone');
    return await res.json();
  }

  async changePassword(userId, currentPassword, newPassword) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/${userId}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
      }),
    });

    if (!res.ok) throw new Error((await res.text()) || 'Failed to change password');
    return await res.json();
  }

  async getUserBookings(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BOOKING_BASE_URL}/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch trips');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async createBooking(bookingPayload) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(BOOKING_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to create booking');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  async submitBookingReview(bookingId, { rating, comments, userId }) {
    try {
      const token = localStorage.getItem('token');
      
      // Validate inputs
      if (!bookingId || !rating || !comments?.trim()) {
        throw new Error('Rating and comments are required');
      }

      const response = await fetch(`${BOOKING_BASE_URL}/${bookingId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          Rating: rating,
          Comments: comments.trim(),
          UserId: userId,
        }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        // Try to parse error message from JSON
        let errorMessage = 'Failed to submit review';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If not JSON, use the text directly
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      try {
        return JSON.parse(responseText);
      } catch {
        return { message: 'Review submitted successfully' };
      }
    } catch (error) {
      console.error('Review submission error:', error);
      throw error;
    }
  }

  async sendProfileOtp(userId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/${userId}/profile/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) throw new Error((await res.text()) || 'Failed to send OTP');
    return await res.json();
  }

  async verifyProfileOtp(userId, otp) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/${userId}/profile/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ Otp: otp }),
    });

    if (!res.ok) throw new Error((await res.text()) || 'Failed to verify OTP');
    return await res.json();
  }

  // ============ UPLOAD IMAGES ============
  async uploadImage(file) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${UPLOAD_BASE_URL}/image`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url; // Returns the URL path
    } catch (err) {
      throw err;
    }
  }

  async uploadImages(files) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files to upload');
      }

      // Filter out invalid files
      const validFiles = files.filter(file => file instanceof File);
      if (validFiles.length === 0) {
        throw new Error('No valid files to upload');
      }

      const token = localStorage.getItem('token');
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${UPLOAD_BASE_URL}/images`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          // Don't set Content-Type header - browser will set it automatically with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        let errText = '';
        try {
          errText = await response.text();
          // Try to parse as JSON for better error message
          try {
            const errJson = JSON.parse(errText);
            errText = errJson.error || errJson.message || errText;
          } catch {
            // Not JSON, use as is
          }
        } catch {
          errText = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errText || 'Failed to upload images');
      }

      const data = await response.json();
      if (!data.files || data.files.length === 0) {
        throw new Error('No files were uploaded successfully');
      }
      return data.files.map(f => f.url); // Returns array of URLs
    } catch (err) {
      console.error('Upload images error:', err);
      throw err;
    }
  }

  // Create tour
  async createTour(tourData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(TOUR_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(tourData),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to create tour');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  // Get properties by host
  async getPropertiesByHost(hostId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${PROPERTY_BASE_URL}/host/${hostId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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

  // Get properties by user ID (recommended - automatically finds host from user)
  async getPropertiesByUser(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${PROPERTY_BASE_URL}/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch properties');
      }

      return await response.json();
    } catch (err) {
      console.error('getPropertiesByUser error:', err);
      throw err;
    }
  }

  // Get tours by host
  async getToursByHost(hostId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}/host/${hostId}`, {
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

  // Get tours by user ID (recommended - automatically finds host from user)
  async getToursByUser(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${TOUR_BASE_URL}/user/${userId}`, {
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
      console.error('getToursByUser error:', err);
      throw err;
    }
  }

  // Delete property
  async deleteProperty(propertyId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${PROPERTY_BASE_URL}/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 404) {
          throw new Error('Property not found.');
        }
        throw new Error(errText || 'Failed to delete property');
      }

      return true; // Success (204 No Content)
    } catch (err) {
      console.error('deleteProperty error:', err);
      throw err;
    }
  }

  // Delete tour
  async deleteTour(tourId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${TOUR_BASE_URL}/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401) {
          throw new Error('Unauthorized: Token may be invalid or expired. Please login again.');
        }
        if (response.status === 404) {
          throw new Error('Tour not found.');
        }
        throw new Error(errText || 'Failed to delete tour');
      }

      return true; // Success (204 No Content)
    } catch (err) {
      console.error('deleteTour error:', err);
      throw err;
    }
  }

  // Get bookings for listings owned by the host (hostId or userId)
  async getBookingsByHost(hostId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${HOST_BASE_URL}/${hostId}/bookings`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch bookings');
      }

      return await response.json();
    } catch (err) {
      console.error('getBookingsByHost error:', err);
      throw err;
    }
  }

  // Get host profile by associated user ID
  async getHostByUserId(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${HOST_BASE_URL}/by-user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch host by user id');
      }

      return await response.json();
    } catch (err) {
      console.error('getHostByUserId error:', err);
      throw err;
    }
  }

  // Confirm transfer - update booking status to "Pending Approval"
  async confirmTransfer(bookingId) {
    try {
      const token = localStorage.getItem('token');
      
      // Ensure bookingId is a number
      const id = parseInt(bookingId, 10);
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid booking ID');
      }
      
      const url = `${BOOKING_BASE_URL}/${id}/confirm-transfer`;
      console.log('Calling confirm transfer endpoint:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      // Read response as text first to avoid "body stream already read" error
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Failed to confirm transfer';
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If not JSON, use the text directly or status text
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      try {
        return JSON.parse(responseText);
      } catch {
        return { message: responseText || 'Transfer confirmed successfully' };
      }
    } catch (err) {
      console.error('confirmTransfer error:', err);
      throw err;
    }
  }

}

// Create singleton instance
const authAPI = new AuthAPI();

export default authAPI;

