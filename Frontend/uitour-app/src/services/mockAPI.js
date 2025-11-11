// Mock API Service - Giả lập API calls cho Frontend
// Mục tiêu:
// - Cung cấp dữ liệu động (mock) để phát triển UI không cần backend thật
// - Dễ thêm/sửa/xoá property, host, reviews theo ý muốn
// - Mô phỏng độ trễ mạng (this.delay) để test loading
class MockAPIService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api'; // Backend URL (tham khảo)
    this.delay = 500; // Độ trễ giả lập (ms). Tăng lên 1200 để thấy spinner rõ hơn
  }

  // Simulate API delay
  async delayResponse() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  // ----------------------
  // Mock User Profile
  // ----------------------
  async getUserProfile(userId = 1) {
    await this.delayResponse();
    // Lấy từ localStorage trước (nếu đã lưu)
    const stored = localStorage.getItem('uitour_profile');
    if (stored) return JSON.parse(stored);

    // Dữ liệu hồ sơ mẫu
    const mock = {
      userId,
      displayName: 'Tân',
      role: 'Khách',
      email: 'lephuocngoctan555@gmail.com',
      about: '',
      funFact: '',
      bornDecade: '',
      spendsTooMuchTimeOn: '',
      mostUselessSkill: '',
      work: '',
      pets: '',
      studiedAt: '',
      favoriteHighSchoolSong: '',
      favoriteHistoryBook: '',
      visitedTagsEnabled: false,
      visitedTags: ['Điểm đến tiếp theo','Điểm đến tiếp theo','Điểm đến tiếp theo','Điểm đến tiếp theo'],
      interests: ['Cà phê','Mua sắm','Nấu ăn','Thể thao trực tiếp','Lịch sử','Nhạc sống','Phim ảnh','Đọc'],
    };
    return mock;
  }

  async saveUserProfile(profile) {
    await this.delayResponse();
    localStorage.setItem('uitour_profile', JSON.stringify(profile));
    return profile;
  }

  // ----------------------
  // Mock Wishlist & Trips
  // ----------------------
  async getUserWishlist(userId = 1) {
    await this.delayResponse();
    // dữ liệu minh họa giống ảnh: vài collection card
    return [
      {
        id: 'recent',
        title: 'Đã xem gần đây',
        itemsCount: 6,
        cover: '/images/id1_img01.png'
      },
      {
        id: 'tlee',
        title: 'tlee',
        itemsCount: 2,
        cover: '/images/id100_img01.png'
      }
    ];
  }

  async getUserTrips(userId = 1) {
    await this.delayResponse();
    const stored = localStorage.getItem('uitour_trips');
    if (stored) return JSON.parse(stored);
    // mặc định: chưa có chuyến đi
    return [];
  }

  async addTrip(trip) {
    await this.delayResponse();
    const stored = JSON.parse(localStorage.getItem('uitour_trips') || '[]');
    stored.push({ id: Date.now(), ...trip });
    localStorage.setItem('uitour_trips', JSON.stringify(stored));
    return stored;
  }

  // Mock Properties Data
  // Cách tuỳ biến nhanh:
  // - Thêm object mới vào mảng để có thêm chỗ ở
  // - Sửa latitude/longitude để marker hiển thị đúng vị trí trên Map
  // - Sửa hostId để gắn chỗ ở với host tương ứng trong getMockHost()
  getMockProperties() {
    return [
      {
        id: 1,
        category: "property",

        // DISPLAY
        title: "Apartment in Quận Ba Đình",
        summary: "Beautiful apartment in historic Ba Dinh district",
        description: "Come and stay in this superb duplex T2...",

        // FROM HOST FLOW
        propertyType: "Apartment",
        roomType: "Entire place",

        // STATUS
        isActive: true,

        // LOCATION (standardized)
        location: {
          addressLine: "Quận Ba Đình",
          district: "Quận Ba Đình",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.8231,
          lng: 106.6297
        },

        // HIGHLIGHTS (for quick badges below title)
        highlights: [
          { id: "entire_place", label: "Entire home" },
          { id: "enhanced_clean", label: "Enhanced Clean" },
          { id: "self_checkin", label: "Self check-in" },
          { id: "free_cancellation", label: "Free cancellation" }
        ],
        selfCheckIn: true,
        enhancedClean: true,
        freeCancellation: true,

        // PRICING
        pricing: {
          basePrice: 45,
          currency: "USD",
          priceUnit: "per night",
          fees: {
            cleaning: 8,
            service: 0,
            tax: 0,
            extraGuest: 5
          },
          minNights: 1,
          maxNights: 30
        },

        // CAPACITY
        capacity: {
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          maxGuests: 2,
          squareFeet: 600
        },

        // MEDIA
        media: {
          cover: { url: "/images/id1_img01.png", alt: "Living room" },
          photos: [
            { id: "p11", url: "/images/id1_img01.png", alt: "Living room" },
            { id: "p12", url: "/images/id1_img02.png", alt: "Bedroom" },
            { id: "p13", url: "/images/id1_img03.png", alt: "Kitchen" },
            { id: "p14", url: "/images/id1_img04.png", alt: "Bathroom" },
            { id: "p15", url: "/images/id1_img05.png", alt: "Building facade" }
          ]
        },

        // BOOKING / RULES
        booking: {
          checkInFrom: "15:00",
          checkOutBefore: "11:00",
          isInstantBookable: false
        },

        houseRules: [
          { id: "checkin_after", value: "14:00", label: "Check-in after 2:00 PM" },
          { id: "self_checkin", method: "lockbox" },
          { id: "no_smoking", value: true },
          { id: "no_open_flames", value: true },
          { id: "pets_allowed", value: true },
          { id: "no_parties", value: true }
        ],

        healthAndSafety: {
          covidSafety: true,
          surfacesSanitized: true,
          smokeAlarm: false,
          carbonMonoxideAlarm: false,
          securityDepositRequired: true,
          securityDepositAmount: 100
        },

        cancellationPolicy: {
          type: "free_before_date",
          freeUntil: "2025-11-14",
          details: "Free cancellation before Nov 14"
        },

        // AVAILABILITY
        availability: {
          blockedDates: ["2025-11-10", "2025-11-11"]
        },

        // HOST & REVIEWS
        host: { id: 1, status: "Superhost" },
        reviewSummary: { rating: 5.0, count: 36 },

        // AMENITIES
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 2, name: "Air Conditioning", icon: "ac" },
          { id: 3, name: "Kitchen", icon: "kitchen" },
          { id: 4, name: "TV", icon: "tv" },
          { id: 5, name: "Free Parking", icon: "free_parking" }
        ],

        // META
        slug: "apartment-quan-ba-dinh-1",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },

      {
        id: 2,
        category: "property",

        // DISPLAY
        title: "Luxury Apartment in District 1",
        summary: "Modern 2BR apartment with city views",
        description: "Beautiful modern apartment in the heart of Ho Chi Minh City with stunning city views and premium amenities.",

        // FROM HOST FLOW
        propertyType: "Apartment",
        roomType: "Entire place",

        // STATUS
        isActive: true,

        // LOCATION (standardized)
        location: {
          addressLine: "District 1",
          district: "District 1",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.7769,
          lng: 106.7009
        },

        // HIGHLIGHTS (optional – không có thông tin thêm nên để trống)
        highlights: [],
        selfCheckIn: false,
        enhancedClean: false,
        freeCancellation: false,

        // PRICING
        pricing: {
          basePrice: 89,
          currency: "USD",
          priceUnit: "per night",
          fees: {
            cleaning: 15,
            service: 0,
            tax: 0,
            extraGuest: 10
          },
          minNights: 1,
          maxNights: 30
        },

        // CAPACITY
        capacity: {
          bedrooms: 2,
          beds: 2,
          bathrooms: 2,
          maxGuests: 4,
          squareFeet: 1200
        },

        // MEDIA
        media: {
          cover: {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            alt: "City view living room"
          },
          photos: [
            { id: "p21", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", alt: "Living room" },
            { id: "p22", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", alt: "Bedroom" },
            { id: "p23", url: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800", alt: "Kitchen" }
          ]
        },

        // BOOKING / RULES
        booking: {
          checkInFrom: "15:00",
          checkOutBefore: "11:00",
          isInstantBookable: false
        },

        houseRules: [],

        // HEALTH & SAFETY
        healthAndSafety: {
          covidSafety: false,
          surfacesSanitized: false,
          smokeAlarm: false,
          carbonMonoxideAlarm: false,
          securityDepositRequired: false,
          securityDepositAmount: 0
        },

        // CANCELLATION POLICY (không có nên để basic default)
        cancellationPolicy: {
          type: "standard",
          details: ""
        },

        // AVAILABILITY
        availability: {
          blockedDates: []
        },

        // HOST & REVIEWS
        host: {
          id: 2,
          status: "Superhost"
        },
        reviewSummary: {
          rating: 4.8,
          count: 127
        },

        // AMENITIES
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 2, name: "Air Conditioning", icon: "ac" },
          { id: 3, name: "Kitchen", icon: "kitchen" },
          { id: 4, name: "Pool", icon: "pool" },
          { id: 5, name: "Gym", icon: "gym" }
        ],

        // META
        slug: "luxury-apartment-district-1-2",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      },

      {
        id: 3,
        category: "property",

        // DISPLAY
        title: "Cozy Villa in District 2",
        summary: "Family-friendly villa with garden",
        description: "Spacious villa with private garden, perfect for families. Located in a quiet neighborhood with easy access to the city center.",

        // FROM HOST FLOW
        propertyType: "Villa",
        roomType: "Entire place",

        // STATUS
        isActive: true,

        // LOCATION (standardized)
        location: {
          addressLine: "District 2",
          district: "District 2",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.787,
          lng: 106.7487
        },

        // HIGHLIGHTS (chưa có thông tin cụ thể)
        highlights: [],
        selfCheckIn: false,
        enhancedClean: false,
        freeCancellation: false,

        // PRICING
        pricing: {
          basePrice: 156,
          currency: "USD",
          priceUnit: "per night",
          fees: {
            cleaning: 25,
            service: 0,
            tax: 0,
            extraGuest: 15
          },
          minNights: 1,
          maxNights: 30
        },

        // CAPACITY
        capacity: {
          bedrooms: 4,
          beds: 4,
          bathrooms: 3,
          maxGuests: 8,
          squareFeet: 2500
        },

        // MEDIA
        media: {
          cover: {
            url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            alt: "Villa exterior"
          },
          photos: [
            { id: "p31", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", alt: "Garden and exterior" },
            { id: "p32", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", alt: "Outdoor terrace" }
          ]
        },

        // BOOKING
        booking: {
          checkInFrom: "15:00",
          checkOutBefore: "11:00",
          isInstantBookable: false
        },

        houseRules: [],

        // HEALTH & SAFETY
        healthAndSafety: {
          covidSafety: false,
          surfacesSanitized: false,
          smokeAlarm: false,
          carbonMonoxideAlarm: false,
          securityDepositRequired: false,
          securityDepositAmount: 0
        },

        // CANCELLATION POLICY (không có → default)
        cancellationPolicy: {
          type: "standard",
          details: ""
        },

        // AVAILABILITY
        availability: {
          blockedDates: []
        },

        // HOST & REVIEWS
        host: {
          id: 2,
          status: "Host"
        },
        reviewSummary: {
          rating: 4.6,
          count: 89
        },

        // AMENITIES
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 6, name: "BBQ", icon: "bbq" },
          { id: 7, name: "Parking", icon: "free_parking" },
          { id: 8, name: "Garden", icon: "ac" } // placeholder icon như bạn ghi
        ],

        // META
        slug: "cozy-villa-district-2-3",
        createdAt: "2024-02-20T14:15:00Z",
        updatedAt: "2024-02-20T14:15:00Z"
      },

      {
        id: 4,
        category: "property",

        // DISPLAY
        title: "Beach House in Vung Tau",
        summary: "Beachfront house with ocean views",
        description: "Stunning beachfront property with direct access to the beach. Perfect for a relaxing getaway with ocean views.",

        // FROM HOST FLOW
        propertyType: "House",
        roomType: "Entire place",

        // STATUS
        isActive: true,

        // LOCATION (standardized)
        location: {
          addressLine: "Vung Tau",
          district: "Vung Tau",
          city: "Ba Ria - Vung Tau",
          country: "Vietnam",
          lat: 10.346,
          lng: 107.0843
        },

        // HIGHLIGHTS
        highlights: [],
        selfCheckIn: false,
        enhancedClean: false,
        freeCancellation: false,

        // PRICING
        pricing: {
          basePrice: 234,
          currency: "USD",
          priceUnit: "per night",
          fees: {
            cleaning: 30,
            service: 0,
            tax: 0,
            extraGuest: 20
          },
          minNights: 1,
          maxNights: 30
        },

        // CAPACITY
        capacity: {
          bedrooms: 3,
          beds: 3,
          bathrooms: 2,
          maxGuests: 6,
          squareFeet: 1800
        },

        // MEDIA
        media: {
          cover: {
            url: "https://st.gamevui.vn/images/image/2025/11/05/kham-pha-cac-ket-thuc-trong-brother-hai-s-pho-restaurant-2.jpg",
            alt: "Beachfront house exterior"
          },
          photos: [
            { id: "p41", url: "https://st.gamevui.vn/images/image/2025/11/05/kham-pha-cac-ket-thuc-trong-brother-hai-s-pho-restaurant-2.jpg", alt: "Beachfront view" },
            { id: "p42", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", alt: "Interior view" }
          ]
        },

        // BOOKING / RULES
        booking: {
          checkInFrom: "15:00",
          checkOutBefore: "11:00",
          isInstantBookable: false
        },

        houseRules: [],

        // HEALTH & SAFETY
        healthAndSafety: {
          covidSafety: false,
          surfacesSanitized: false,
          smokeAlarm: false,
          carbonMonoxideAlarm: false,
          securityDepositRequired: false,
          securityDepositAmount: 0
        },

        // CANCELLATION POLICY (default fallback)
        cancellationPolicy: {
          type: "standard",
          details: ""
        },

        // AVAILABILITY
        availability: {
          blockedDates: []
        },

        // HOST & REVIEWS
        host: {
          id: 3,
          status: "Superhost"
        },
        reviewSummary: {
          rating: 4.9,
          count: 156
        },

        // AMENITIES
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 10, name: "Hot Tub", icon: "hottub" }
        ],

        // META
        slug: "beach-house-vung-tau-4",
        createdAt: "2024-03-10T09:45:00Z",
        updatedAt: "2024-03-10T09:45:00Z"
      },


      {
        id: 5,
        category: "property",

        // DISPLAY
        title: "Mountain Lodge in Da Lat",
        summary: "Mountain lodge with forest views",
        description: "Charming lodge surrounded by pine forests. Experience the cool mountain air and peaceful atmosphere of Da Lat.",

        // FROM HOST FLOW
        propertyType: "Lodge",
        roomType: "Entire place",

        // STATUS
        isActive: true,

        // LOCATION (standardized)
        location: {
          addressLine: "Da Lat",
          district: "Da Lat",
          city: "Lam Dong",
          country: "Vietnam",
          lat: 11.9404,
          lng: 108.4583
        },

        // HIGHLIGHTS
        highlights: [],
        selfCheckIn: false,
        enhancedClean: false,
        freeCancellation: false,

        // PRICING
        pricing: {
          basePrice: 67,
          currency: "USD",
          priceUnit: "per night",
          fees: {
            cleaning: 12,
            service: 0,
            tax: 0,
            extraGuest: 8
          },
          minNights: 1,
          maxNights: 30
        },

        // CAPACITY
        capacity: {
          bedrooms: 2,
          beds: 2,
          bathrooms: 1,
          maxGuests: 4,
          squareFeet: 900
        },

        // MEDIA
        media: {
          cover: {
            url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            alt: "Mountain lodge exterior"
          },
          photos: [
            { id: "p51", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", alt: "Lodge and forest view" },
            { id: "p52", url: "https://images.unsplash.com/photo-1506905925346-14b1e3d7e6b3?w=800", alt: "Cozy interior with fireplace" }
          ]
        },

        // BOOKING / RULES
        booking: {
          checkInFrom: "15:00",
          checkOutBefore: "11:00",
          isInstantBookable: false
        },

        houseRules: [],

        // HEALTH & SAFETY
        healthAndSafety: {
          covidSafety: false,
          surfacesSanitized: false,
          smokeAlarm: false,
          carbonMonoxideAlarm: false,
          securityDepositRequired: false,
          securityDepositAmount: 0
        },

        // CANCELLATION POLICY (default fallback)
        cancellationPolicy: {
          type: "standard",
          details: ""
        },

        // AVAILABILITY
        availability: {
          blockedDates: []
        },

        // HOST & REVIEWS
        host: {
          id: 4,
          status: "Host"
        },
        reviewSummary: {
          rating: 4.7,
          count: 203
        },

        // AMENITIES
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 12, name: "Fireplace", icon: "heating" }
        ],

        // META
        slug: "mountain-lodge-da-lat-5",
        createdAt: "2024-01-25T16:20:00Z",
        updatedAt: "2024-01-25T16:20:00Z"
      },

      {
        id: 6,
        category: "property",

        // DISPLAY
        title: "Riverside Hotel in Can Tho",
        summary: "Riverside hotel with Mekong views",
        description: "Modern hotel with Mekong Delta views. Experience the local culture and enjoy the peaceful riverside setting.",

        // FROM HOST FLOW
        propertyType: "Hotel",
        roomType: "Private room",

        // STATUS
        isActive: true,

        // LOCATION (standardized)
        location: {
          addressLine: "Can Tho City",
          district: "Can Tho City",
          city: "Can Tho",
          country: "Vietnam",
          lat: 10.0452,
          lng: 105.7469
        },

        // HIGHLIGHTS
        highlights: [],
        selfCheckIn: false,
        enhancedClean: false,
        freeCancellation: false,

        // PRICING
        pricing: {
          basePrice: 45,
          currency: "USD",
          priceUnit: "per night",
          fees: {
            cleaning: 8,
            service: 0,
            tax: 0,
            extraGuest: 5
          },
          minNights: 1,
          maxNights: 30
        },

        // CAPACITY
        capacity: {
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          maxGuests: 2,
          squareFeet: 600
        },

        // MEDIA
        media: {
          cover: {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            alt: "Riverside hotel view"
          },
          photos: [
            { id: "p61", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", alt: "Hotel exterior by river" },
            { id: "p62", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", alt: "Hotel interior view" }
          ]
        },

        // BOOKING / RULES
        booking: {
          checkInFrom: "15:00",
          checkOutBefore: "11:00",
          isInstantBookable: false
        },

        houseRules: [],

        // HEALTH & SAFETY
        healthAndSafety: {
          covidSafety: false,
          surfacesSanitized: false,
          smokeAlarm: false,
          carbonMonoxideAlarm: false,
          securityDepositRequired: false,
          securityDepositAmount: 0
        },

        // CANCELLATION POLICY (default fallback)
        cancellationPolicy: {
          type: "standard",
          details: ""
        },

        // AVAILABILITY
        availability: {
          blockedDates: []
        },

        // HOST & REVIEWS
        host: {
          id: 5,
          status: "New Host"
        },
        reviewSummary: {
          rating: 4.5,
          count: 78
        },

        // AMENITIES
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 16, name: "Breakfast", icon: "breakfast" }
        ],

        // META
        slug: "riverside-hotel-can-tho-6",
        createdAt: "2024-02-05T11:30:00Z",
        updatedAt: "2024-02-05T11:30:00Z"
      }
    ];
  }


  // ✅ Experience Mock Data
  getMockExperiences() {
    return [
      {
        id: 100,
        category: "experience",
        hostId: 1,

        // DISPLAY
        title: "Best Street Food Motorbike Tour in Ho Chi Minh City",
        summary: "Top-rated motorbike street food adventure in Saigon",
        description:
          "Ranked #1 Food Tour since 2022. Hotel pickup & 10 tastings included.",

        // STATUS
        isActive: true,

        // REVIEWS
        rating: 4.9,
        reviewsCount: 120,

        // LOCATION (Standardized)
        location: {
          addressLine: "District 1",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.7769,
          lng: 106.7009,
        },

        // PRICING (Unified)
        pricing: {
          basePrice: 730000,
          currency: "VND",
          priceUnit: "perPerson",
        },

        // MEDIA
        media: {
          cover: {
            url: "/images/id100_img01.png",
            alt: "Street food motorbike tour",
          },
          photos: [
            { id: "p1", url: "/images/id100_img01.png", alt: "Tour photo 1" },
            { id: "p2", url: "/images/id100_img02.png", alt: "Tour photo 2" },
            { id: "p3", url: "/images/id100_img03.png", alt: "Tour photo 3" },
            { id: "p4", url: "/images/id100_img04.png", alt: "Tour photo 4" },
            { id: "p5", url: "/images/id100_img05.png", alt: "Tour photo 5" },
            { id: "p6", url: "/images/id100_img06.png", alt: "Tour photo 6" },
          ],
        },

        // BOOKING (Unified)
        capacity: {
          maxGuests: 10,
        },

        booking: {
          timeSlots: [
            {
              id: "slot_100_1",
              date: "2025-03-21",
              time: "13:00 - 17:00",
              spotsAvailable: 10,
            },
            {
              id: "slot_100_2",
              date: "2025-03-21",
              time: "17:00 - 21:00",
              spotsAvailable: 10,
            },
            {
              id: "slot_100_3",
              date: "2025-03-22",
              time: "18:00 - 22:00",
              spotsAvailable: 10,
            },
          ],
        },

        // SPECIAL FOR EXPERIENCE
        durationHours: 4,
        experienceDetails: [
          {
            id: "detail_1",
            image:
              "https://hoiandelicacyhotel.com/wp-content/uploads/2022/08/tranfer.jpg",
            title: "Hotel Pickup",
            description:
              "We will pick you up from your hotel and start the culinary night adventure.",
          },
          {
            id: "detail_2",
            image:
              "https://tse1.mm.bing.net/th/id/OIP.72rOIOjqxKHRT4ianMKJSgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
            title: "Papaya Salad",
            description:
              "A fresh mix of shredded papaya, beef jerky, peanuts, and crispy crackers.",
          },
          {
            id: "detail_3",
            image:
              "https://vnifood.com/wp-content/uploads/2019/11/COCONUT-AND-KUMQUAT-JUICE-03.jpg",
            title: "Coconut Kumquat Juice",
            description:
              "Refreshing coconut juice infused with tangy kumquat — perfect to cool off the heat.",
          },
          {
            id: "detail_4",
            image:
              "https://i0.wp.com/scootersaigontour.com/wp-content/uploads/2017/03/grilled-rice-pancake-in-saigon-vietnam.jpg?fit=1024%2C945&ssl=1",
            title: "Vietnamese Pizza (Bánh Tráng Nướng)",
            description:
              "Crispy rice paper grilled with egg, cheese, and sausage — a must-try street snack.",
          },
          {
            id: "detail_5",
            image:
              "https://farm4.staticflickr.com/3867/14446625218_b1e83724dd_b.jpg",
            title: "Chinatown Street Food",
            description:
              "Explore the old alleys of Cholon and discover hidden family-run food stalls.",
          },
          {
            id: "detail_6",
            image:
              "https://www.cet.edu.vn/wp-content/uploads/2018/03/bun-thit-nuong-kieu-mien-nam.jpg",
            title: "Bún Thịt Nướng",
            description:
              "Grilled pork, fresh herbs, and rice noodles topped with homemade fish sauce.",
          },
          {
            id: "detail_7",
            image:
              "https://scootersaigontour.com/wp-content/uploads/2020/11/Quang-Ba-Flower-Market-in-Hanoi.jpg",
            title: "Saigon Flower Market Stop",
            description:
              "Take photos at the lively wholesale flower market while enjoying a local beer.",
          },
          {
            id: "detail_8",
            image:
              "https://www.theseasonedwok.com/wp-content/uploads/2023/12/banh-flan-recipe-f6.jpg",
            title: "Flan or Chè Dessert",
            description:
              "Finish the night with a creamy flan or a sweet traditional Vietnamese chè.",
          },
          {
            id: "detail_9",
            image: "https://images.thespinoff.co.nz/1/2024/07/Vietnameezy.jpg?w=1290",
            title: "Bánh Mì Tasting",
            description: "A famous Saigon-style baguette filled with pâté, cold cuts, and fresh herbs."
          },
          {
            id: "detail_10",
            image: "https://hotelcastillo.in/wp-content/uploads/2022/07/valet-parking-4.jpg",
            title: "Drop-off Service",
            description: "We take you back to your hotel or a fun bar spot if you want to continue the night!"
          }

        ],

        createdAt: "2024-03-21T11:00:00Z",
      }
      ,
      {
        id: 101,
        category: "experience",
        hostId: 2,

        // DISPLAY
        title: "Traditional Vietnamese Water Puppet Show & Backstage Tour",
        summary: "Discover Vietnam’s unique wooden puppetry art form",
        description:
          "See skilled puppeteers bring folklore to life with water, music, and lights. Backstage access included.",

        // STATUS
        isActive: true,

        // REVIEWS
        rating: 4.8,
        reviewsCount: 85,

        // LOCATION
        location: {
          addressLine: "Hoan Kiem",
          city: "Hanoi",
          country: "Vietnam",
          lat: 21.0285,
          lng: 105.8542
        },

        // PRICING
        pricing: {
          basePrice: 550000,
          currency: "VND",
          priceUnit: "perPerson"
        },

        // MEDIA
        media: {
          cover: {
            url: "/images/id101_img01.png",
            alt: "Water puppet show"
          },
          photos: [
            { id: "p1", url: "/images/id101_img01.png" },
            { id: "p2", url: "/images/id101_img02.png" },
            { id: "p3", url: "/images/id101_img03.png" },
            { id: "p4", url: "/images/id101_img04.png" },
            { id: "p5", url: "/images/id101_img05.png" }
          ]
        },

        // CAPACITY
        capacity: {
          maxGuests: 20
        },

        // BOOKING
        booking: {
          timeSlots: [
            {
              id: "slot_101_1",
              date: "2025-03-20",
              time: "18:00 - 19:15",
              spotsAvailable: 20
            },
            {
              id: "slot_101_2",
              date: "2025-03-20",
              time: "19:45 - 21:00",
              spotsAvailable: 20
            }
          ]
        },

        // EXPERIENCE DETAILS
        durationHours: 1.5,
        experienceDetails: [
          {
            id: "detail_1",
            image:
              "https://th.bing.com/th/id/R.5f2fbd65edb6deeedd6d1fa240b2edc7?rik=yfm5QAZJMK3TUw",
            title: "VIP Reserved Seat",
            description: "Enjoy clear views of the gorgeous water stage show."
          },
          {
            id: "detail_2",
            image:
              "https://tse2.mm.bing.net/th/id/OIP.9w1LaxuM7tuD6p-9gYeFCAHaEl?rs=1",
            title: "Puppetry Folklore",
            description: "See legends of dragons, rice farming and festivals."
          },
          {
            id: "detail_3",
            image:
              "https://static.mothership.sg/1/2024/03/puxian-women-ensemble.jpg",
            title: "Live Traditional Music",
            description:
              "Performed by Vietnamese instruments like Đàn bầu, Trống."
          },
          {
            id: "detail_4",
            image:
              "https://i.pinimg.com/originals/56/59/8f/56598fa2237e808b00eeca89f49fdbe0.jpg",
            title: "Backstage Access",
            description: "Meet puppeteers & try controlling a puppet!"
          }
        ],

        createdAt: "2024-03-20T15:30:00Z"
      },

      {
        id: 102,
        category: "experience",
        hostId: 3,

        // DISPLAY
        title: "Morning Yoga & Vegan Breakfast on Danang Beach",
        summary: "Refresh your mind and body next to the ocean waves",
        description:
          "Professional yoga instructors guide you in a sunrise meditation followed by a healthy vegan brunch.",

        // STATUS
        isActive: true,

        // REVIEWS
        rating: 4.9,
        reviewsCount: 64,

        // LOCATION
        location: {
          addressLine: "My Khe Beach",
          city: "Da Nang",
          country: "Vietnam",
          lat: 16.0592,
          lng: 108.2455
        },

        // PRICING
        pricing: {
          basePrice: 620000,
          currency: "VND",
          priceUnit: "perPerson"
        },

        // MEDIA
        media: {
          cover: {
            url: "/images/id102_img01.png",
            alt: "Yoga on Danang beach"
          },
          photos: [
            { id: "p1", url: "/images/id102_img01.png" },
            { id: "p2", url: "/images/id102_img02.png" },
            { id: "p3", url: "/images/id102_img03.png" },
            { id: "p4", url: "/images/id102_img04.png" }
          ]
        },

        // CAPACITY
        capacity: {
          maxGuests: 12
        },

        // BOOKING
        booking: {
          timeSlots: [
            {
              id: "slot_102_1",
              date: "2025-03-28",
              time: "06:00 - 08:00",
              spotsAvailable: 12
            },
            {
              id: "slot_102_2",
              date: "2025-03-28",
              time: "08:30 - 10:30",
              spotsAvailable: 12
            }
          ]
        },

        // EXPERIENCE DETAILS
        durationHours: 2,
        experienceDetails: [
          {
            id: "detail_1",
            image:
              "https://th.bing.com/th/id/R.7688470f902deb728f75797e290ed1fb?rik=uaKo1yzwvfjRBg",
            title: "Sunrise Meditation",
            description: "Breathe peacefully while the sun rises over the sea."
          },
          {
            id: "detail_2",
            image:
              "https://kiddomag.com.au/wp-content/uploads/2022/10/Vacswim-3059-1-scaled-e1665631261799.jpg",
            title: "Experienced Guide",
            description: "Instructor with 10+ years of yoga training."
          },
          {
            id: "detail_3",
            image:
              "https://tse4.mm.bing.net/th/id/OIP._LMJDLd9JDZQVRj8JQyx9gHaJ4?rs=1",
            title: "Vegan Brunch",
            description: "Fresh smoothies, tropical fruits & tofu dishes."
          }
        ],

        createdAt: "2024-03-28T09:00:00Z"
      },

      {
        id: 103,
        category: "experience",
        hostId: 4,

        // DISPLAY
        title: "Cu Chi Tunnels War History Guided Tour",
        summary: "Walk through Vietnam War underground tunnels",
        description:
          "See real tunnels, weapon traps and learn the story of soldiers who lived underground.",

        // STATUS
        isActive: true,

        // REVIEWS
        rating: 4.8,
        reviewsCount: 210,

        // LOCATION (Standardized)
        location: {
          addressLine: "Cu Chi District",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 11.146,
          lng: 106.346
        },

        // PRICING (Unified)
        pricing: {
          basePrice: 890000,
          currency: "VND",
          priceUnit: "perPerson"
        },

        // MEDIA
        media: {
          cover: {
            url: "/images/id103_img01.png",
            alt: "Cu Chi Tunnels tour"
          },
          photos: [
            { id: "p1", url: "/images/id103_img01.png" },
            { id: "p2", url: "/images/id103_img02.png" },
            { id: "p3", url: "/images/id103_img03.png" },
            { id: "p4", url: "/images/id103_img04.png" },
            { id: "p5", url: "/images/id103_img05.png" }
          ]
        },

        // CAPACITY
        capacity: {
          maxGuests: 20
        },

        // BOOKING
        booking: {
          timeSlots: [
            {
              id: "slot_103_1",
              date: "2025-02-08",
              time: "08:00 - 14:00",
              spotsAvailable: 20
            },
            {
              id: "slot_103_2",
              date: "2025-02-08",
              time: "12:30 - 18:30",
              spotsAvailable: 20
            }
          ]
        },

        // EXPERIENCE DETAILS
        durationHours: 6,
        experienceDetails: [
          {
            id: "detail_1",
            image:
              "https://sawasdee.thaiairways.com/wp-content/uploads/2023/04/shutterstock_1865107804-1160x775.jpg",
            title: "Tunnel Experience",
            description: "Crawl inside preserved underground pathways."
          },
          {
            id: "detail_2",
            image:
              "https://c8.alamy.com/comp/2RH6AHY/cu-chi-vietnam-21st-aug-2014-the-cu-chi-tunnels-are-an-immense-network-of-underground-tunnels-used-by-viet-cong-soldiers-during-the-vietnam-war-2RH6AHY.jpg",
            title: "War Artifacts",
            description: "Original traps and handmade tools from soldiers."
          },
          {
            id: "detail_3",
            image:
              "https://img.freepik.com/premium-photo/vietnam-war-soldier-menu-peanuts-cane-sugar-today-it-is-served-tourists-cu-chi-tunnel-vietnam_479694-10438.jpg?w=996",
            title: "Soldier Snacks",
            description: "Try cassava with peanuts — meal from wartime era."
          }
        ],

        createdAt: "2024-02-08T10:00:00Z"
      },

      {
        id: 104,
        category: "experience",
        hostId: 5,

        // DISPLAY
        title: "Ha Long Bay Sunset Kayak & Cave Adventure",
        summary: "Explore emerald waters and limestone caves",
        description:
          "Kayak through peaceful lagoons & hidden caves — best time to see the golden sunset on the bay.",

        // STATUS
        isActive: true,

        // REVIEWS
        rating: 5.0,
        reviewsCount: 175,

        // LOCATION (Standardized)
        location: {
          addressLine: "Ha Long Bay",
          city: "Quang Ninh",
          country: "Vietnam",
          lat: 20.9101,
          lng: 107.1839
        },

        // PRICING (Unified)
        pricing: {
          basePrice: 1250000,
          currency: "VND",
          priceUnit: "perPerson"
        },

        // MEDIA
        media: {
          cover: {
            url: "/images/id104_img01.png",
            alt: "Ha Long Bay sunset kayak tour"
          },
          photos: [
            { id: "p1", url: "/images/id104_img01.png" },
            { id: "p2", url: "/images/id104_img02.png" },
            { id: "p3", url: "/images/id104_img03.png" },
            { id: "p4", url: "/images/id104_img04.png" }
          ]
        },

        // CAPACITY
        capacity: {
          maxGuests: 14
        },

        // BOOKING
        booking: {
          timeSlots: [
            {
              id: "slot_104_1",
              date: "2025-04-01",
              time: "14:00 - 18:00",
              spotsAvailable: 14
            }
          ]
        },

        // EXPERIENCE CONTENT
        durationHours: 4,
        experienceDetails: [
          {
            id: "detail_1",
            image:
              "https://vietnamtrips.com/files/photos/article1305/kayaking-in-halong-bay-1.jpg",
            title: "Kayak Adventure",
            description: "Paddle beside giant limestone towers."
          },
          {
            id: "detail_2",
            image:
              "https://www.paradisevietnam.com/public/backend/uploads/images/ha-long-bay-cave-10.jpg",
            title: "Hidden Caves",
            description: "Discover caves with glimmering rocks inside."
          },
          {
            id: "detail_3",
            image:
              "https://wallpaperaccess.com/full/3745010.jpg",
            title: "Sunset Viewpoint",
            description: "Golden hour photos guaranteed — perfect for couples."
          }
        ],

        createdAt: "2024-04-01T13:30:00Z"
      }

      ,
    ];
  }


  // Mock Reviews Data
  // Mỗi propertyId có một danh sách reviews riêng.
  // Bạn có thể thêm review bằng cách thêm object vào mảng tương ứng.
  getMockReviews(propertyId) {
    const reviewsData = {
      1: [
        {
          id: 1,
          userId: 101,
          userName: "Alice Nguyen",
          userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
          rating: 5,
          comment: "Rất tuyệt vời, phòng sạch sẽ và chủ nhà thân thiện! View thành phố rất đẹp. The stay was pleasant. Highly recommend! Good value for the price. The location is amazing and close to everything.Rất tuyệt vời, phòng sạch sẽ và chủ nhà thân thiện! View thành phố rất đẹp. The stay was pleasant. Highly recommend! Good value for the price. The location is amazing and close to everything.",
          createdAt: "2024-01-20T10:30:00Z",
          location: "Vietnam"
        },
        {
          id: 2,
          userId: 102,
          userName: "John Smith",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          rating: 3,
          comment: "Good value for the price. The location is amazing and close to everything.",
          createdAt: "2024-01-15T14:20:00Z",
          location: "USA"
        },
        {
          id: 3,
          userId: 103,
          userName: "Mai Tran",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
          rating: 5,
          comment: "View đẹp, mọi thứ đều như mô tả. Sẽ quay lại!",
          createdAt: "2024-01-10T16:45:00Z",
          location: "Vietnam"
        },
        {
          id: 4,
          userId: 104,
          userName: "Daniel Lee",
          userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          rating: 5,
          comment: "Comfortable bed, nice staff, and quiet area. Perfect for couples.",
          createdAt: "2024-01-05T09:15:00Z",
          location: "Korea"
        },
        {
          id: 5,
          userId: 105,
          userName: "Sophie Chen",
          userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          rating: 5,
          comment: "Loved the design of the place, very cozy and modern.",
          createdAt: "2023-12-28T11:30:00Z",
          location: "Taiwan"
        },
        {
          id: 6,
          userId: 106,
          userName: "Akira Ito",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          rating: 5,
          comment: "The stay was pleasant. Highly recommend! Good value for the price. The location is amazing and close to everything.",
          createdAt: "2023-12-20T08:45:00Z",
          location: "Japan"
        }
      ],
      2: [
        {
          id: 7,
          userId: 107,
          userName: "Maria Garcia",
          userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
          rating: 4,
          comment: "Beautiful apartment with great amenities. Perfect for business trips.",
          createdAt: "2024-02-25T09:15:00Z",
          location: "Spain"
        }
      ],
      100: [
        {
          id: 1,
          userId: 101,
          userName: "Alice Nguyen",
          userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
          rating: 5,
          comment: "Great food tour! Loved all the stops. Each dish was unique and delicious. Riding through Saigon by night was so much fun!",
          createdAt: "2024-01-20T10:30:00Z",
          location: "Vietnam"
        },
        {
          id: 2,
          userId: 102,
          userName: "John Smith",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          rating: 5,
          comment: "The best street food I had in Vietnam! Our guide explained everything so well. I would definitely recommend this tour!",
          createdAt: "2024-01-15T14:20:00Z",
          location: "USA"
        },
        {
          id: 3,
          userId: 103,
          userName: "Mai Tran",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
          rating: 5,
          comment: "Bánh tráng nướng và bún thịt nướng siêu ngon! Hướng dẫn viên vui vẻ và chụp hình đẹp. Quá tuyệt!",
          createdAt: "2024-01-10T16:45:00Z",
          location: "Vietnam"
        },
        {
          id: 4,
          userId: 104,
          userName: "Daniel Lee",
          userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          rating: 5,
          comment: "Riding on the motorbike through hidden alleys was amazing. Tried so many things I never knew existed!",
          createdAt: "2024-01-05T09:15:00Z",
          location: "South Korea"
        },
        {
          id: 5,
          userId: 105,
          userName: "Sophie Chen",
          userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          rating: 5,
          comment: "The best part was the coconut kumquat drink and dessert at the end! So refreshing and memorable!",
          createdAt: "2023-12-28T11:30:00Z",
          location: "Taiwan"
        },
        {
          id: 6,
          userId: 106,
          userName: "Akira Ito",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          rating: 5,
          comment: "Food was excellent. The guide was knowledgeable and kind. A must-do experience when visiting Ho Chi Minh City!",
          createdAt: "2023-12-20T08:45:00Z",
          location: "Japan"
        }
      ]
      ,
    };
    return reviewsData[propertyId] || [];
  }

  // Mock Host Data
  // Khi thêm host mới: thêm một entry mới vào object hosts và dùng id đó trong property.hostId
  getMockHost(hostId) {
    const hosts = {
      1: {
        id: 1,
        name: "Tèo Hoàng",
        avatar: "/images/host1_avatar.png",
        joinedDate: "2020-03-15",
        responseRate: 98,
        responseTime: "within an hour",
        isSuperhost: true,
        totalReviews: 36,
        averageRating: 5.0,
        languages: ["Vietnamese", "English"],
        description: "HieuChuNhat's best friend. Experienced host with 4+ years of hosting. I love meeting new people and sharing the beauty of Ho Chi Minh City."
      },
      2: {
        id: 2,
        name: "Nguyen Van A",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        joinedDate: "2021-07-20",
        responseRate: 95,
        responseTime: "within a few hours",
        isSuperhost: true,
        totalReviews: 127,
        averageRating: 4.8,
        languages: ["Vietnamese", "English", "French"],
        description: "Passionate about hospitality and creating memorable experiences for my guests."
      },
      3: {
        id: 3,
        name: "Tran Thi B",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        joinedDate: "2021-07-20",
        responseRate: 95,
        responseTime: "within a few hours",
        isSuperhost: true,
        totalReviews: 156,
        averageRating: 4.9,
        languages: ["Vietnamese", "English"],
        description: "Beach house specialist with years of experience in hospitality."
      },
      4: {
        id: 4,
        name: "Le Van C",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        joinedDate: "2022-01-10",
        responseRate: 90,
        responseTime: "within a few hours",
        isSuperhost: false,
        totalReviews: 203,
        averageRating: 4.7,
        languages: ["Vietnamese", "English"],
        description: "Mountain lodge host who loves nature and peaceful environments."
      },
      5: {
        id: 5,
        name: "Pham Thi D",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        joinedDate: "2023-06-01",
        responseRate: 85,
        responseTime: "within a day",
        isSuperhost: false,
        totalReviews: 78,
        averageRating: 4.5,
        languages: ["Vietnamese", "English"],
        description: "New host passionate about Mekong Delta culture and hospitality."
      }
    };
    return hosts[hostId] || hosts[1];
  }

  async getExperiences(filters = {}) {
    await this.delayResponse();
    let exps = this.getMockExperiences();

    // ✅ Preserve existing filters (location, minPrice,...)
    if (filters.location) {
      exps = exps.filter(e =>
        `${e.location.addressLine ?? e.location.address}, ${e.location.city}`
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      exps = exps.filter(e => e.pricing?.basePrice >= filters.minPrice);
    }
    if (filters.maxPrice) {
      exps = exps.filter(e => e.pricing?.basePrice <= filters.maxPrice);
    }

    // ✅ Return lightweight normalized list format
    return exps.map(e => ({
      id: e.id,
      title: e.title,
      description: e.summary || e.description,
      image: typeof e.media?.cover === "string"
        ? e.media.cover
        : e.media?.cover?.url || null,
      price: e.pricing?.basePrice ?? 0,
      rating: e.rating ?? 0,
      reviews: e.reviewsCount ?? 0,
      duration: e.durationHours
        ? `${e.durationHours} hours`
        : null,
      location: `${e.location.addressLine ?? e.location.address}, ${e.location.city}`,
      isGuestFavourite: e.isGuestFavourite ?? false,
    }));
  }



  // API Methods
  async getPropertyById(id) {
    await this.delayResponse();
    const properties = this.getMockProperties();
    const property = properties.find(p => p.id === parseInt(id));

    if (!property) {
      throw new Error(`Property with id ${id} not found`);
    }

    return {
      ...property,
      reviews: this.getMockReviews(property.id),
      host: this.getMockHost(property.hostId)
    };
  }

  async getProperties(filters = {}) {
    await this.delayResponse();
    let properties = this.getMockProperties();

    // Apply filters
    if (filters.location) {
      properties = properties.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      properties = properties.filter(p => p.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      properties = properties.filter(p => p.price <= filters.maxPrice);
    }

    if (filters.guests) {
      properties = properties.filter(p => p.accommodates >= filters.guests);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      properties = properties.filter(p =>
        filters.amenities.every(amenityId =>
          p.amenities.some(amenity => amenity.id === amenityId)
        )
      );
    }

    return properties.map(p => ({
      id: p.id,
      listingTitle: p.listingTitle,
      location: p.location,
      rating: p.rating,
      dates: p.dates,
      price: p.price,
      priceUnit: p.priceUnit,
      mainImage: p.mainImage,
      isGuestFavourite: p.isGuestFavourite
    }));
  }

  async searchProperties(query, filters = {}) {
    await this.delayResponse();
    let properties = this.getMockProperties();

    // Search by location
    if (query) {
      properties = properties.filter(p =>
        p.location.toLowerCase().includes(query.toLowerCase()) ||
        p.listingTitle.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply additional filters
    return this.getProperties({ ...filters, location: query });
  }

  async getExperienceById(id) {
    await this.delayResponse();
    const experiences = this.getMockExperiences();
    const exp = experiences.find(e => e.id === Number(id));

    if (!exp) {
      throw new Error(`Experience with id ${id} not found`);
    }

    return {
      ...exp,
      reviews: this.getMockReviews(exp.id) || [],
      host: this.getMockHost(exp.hostId) || null
    };
  }

  async searchExperiences(query, filters = {}) {
    await this.delayResponse();
    let exps = this.getMockExperiences();

    if (query) {
      exps = exps.filter(e =>
        `${e.location.address}, ${e.location.city}, ${e.location.country}`
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        e.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    return this.getExperiences({ ...filters, location: query });
  }

  async getReviewsByPropertyId(propertyId) {
    await this.delayResponse();
    return this.getMockReviews(propertyId);
  }

  async getHostById(hostId) {
    await this.delayResponse();
    return this.getMockHost(hostId);
  }
}



// Create singleton instance
const mockAPI = new MockAPIService();

export default mockAPI;
