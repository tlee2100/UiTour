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

  // Mock Properties Data
  // Cách tuỳ biến nhanh:
  // - Thêm object mới vào mảng để có thêm chỗ ở
  // - Sửa latitude/longitude để marker hiển thị đúng vị trí trên Map
  // - Sửa hostId để gắn chỗ ở với host tương ứng trong getMockHost()
  getMockProperties() {
    return [
      {
        id: 1,
        listingTitle: "Apartment in Quận Ba Đình",
        description: "Come and stay in this superb duplex T2, in the heart of the historic center of Ho Chi Minh City. Spacious and bright, in a real building in exposed stone, you will enjoy all the charms of the city thanks to its ideal location. Close to many shops, bars and restaurants, you can access the apartment by tram A and C and bus routes 27 and 44.",
        summary: "Beautiful apartment in historic Ba Dinh district",
        location: "Quận Ba Đình, Ho Chi Minh City",
        latitude: 10.8231,
        longitude: 106.6297,
        price: 45,
        priceUnit: "cho 2 đêm",
        currency: "USD",
        dates: "18-25 Jun",
        mainImage: "/images/id1_img01.png",
        isGuestFavourite: true,
        cleaningFee: 8,
        extraPeopleFee: 5,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        accommodates: 2,
        maxGuests: 2,
        squareFeet: 600,
        isBusinessReady: true,
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        hostId: 1,
        roomTypeId: 1,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 1,
        countryId: 1,
        neighbourhoodId: 1,
        rating: 5.0,
        reviewsCount: 36,
        hostStatus: "Superhost",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 2, name: "Air Conditioning", icon: "ac" },
          { id: 3, name: "Kitchen", icon: "kitchen" },
          { id: 4, name: "TV", icon: "tv" },
          { id: 5, name: "Free Parking", icon: "free_parking" }
        ],
        photos: [
          "/images/id1_img01.png",
          "/images/id1_img02.png",
          "/images/id1_img03.png",
          "/images/id1_img04.png",
          "/images/id1_img05.png"
        ]
      },
      {
        id: 2,
        listingTitle: "Luxury Apartment in District 1",
        description:
          "Beautiful modern apartment in the heart of Ho Chi Minh City with stunning city views and premium amenities.",
        summary: "Modern 2BR apartment with city views",
        location: "District 1, Ho Chi Minh City",
        latitude: 10.7769,
        longitude: 106.7009,
        price: 89,
        priceUnit: "cho 3 đêm",
        currency: "USD",
        dates: "20-23 Jun",
        mainImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        isGuestFavourite: true,
        cleaningFee: 15,
        extraPeopleFee: 10,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        accommodates: 4,
        maxGuests: 4,
        squareFeet: 1200,
        isBusinessReady: true,
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        hostId: 2,
        roomTypeId: 1,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 1,
        countryId: 1,
        neighbourhoodId: 1,
        rating: 4.8,
        reviewsCount: 127,
        hostStatus: "Superhost",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 2, name: "Air Conditioning", icon: "ac" },
          { id: 3, name: "Kitchen", icon: "kitchen" },
          { id: 4, name: "Pool", icon: "pool" },
          { id: 5, name: "Gym", icon: "gym" }
        ],
        photos: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800"
        ]
      },
      {
        id: 3,
        listingTitle: "Cozy Villa in District 2",
        description:
          "Spacious villa with private garden, perfect for families. Located in a quiet neighborhood with easy access to the city center.",
        summary: "Family-friendly villa with garden",
        location: "District 2, Ho Chi Minh City",
        latitude: 10.787,
        longitude: 106.7487,
        price: 156,
        priceUnit: "cho 5 đêm",
        currency: "USD",
        dates: "10-15 Jul",
        mainImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        isGuestFavourite: false,
        cleaningFee: 25,
        extraPeopleFee: 15,
        bedrooms: 4,
        beds: 4,
        bathrooms: 3,
        accommodates: 8,
        maxGuests: 8,
        squareFeet: 2500,
        isBusinessReady: false,
        active: true,
        createdAt: "2024-02-20T14:15:00Z",
        hostId: 2,
        roomTypeId: 2,
        bedTypeId: 2,
        cancellationId: 2,
        cityId: 1,
        countryId: 1,
        neighbourhoodId: 2,
        rating: 4.6,
        reviewsCount: 89,
        hostStatus: "Host",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 6, name: "BBQ", icon: "bbq" },
          { id: 7, name: "Parking", icon: "parking" },
          { id: 8, name: "Garden", icon: "garden" }
        ],
        photos: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
        ]
      },
      {
        id: 4,
        listingTitle: "Beach House in Vung Tau",
        description:
          "Stunning beachfront property with direct access to the beach. Perfect for a relaxing getaway with ocean views.",
        summary: "Beachfront house with ocean views",
        location: "Vung Tau, Ba Ria - Vung Tau",
        latitude: 10.346,
        longitude: 107.0843,
        price: 234,
        priceUnit: "cho 4 đêm",
        currency: "USD",
        dates: "5-9 May",
        mainImage: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800",
        isGuestFavourite: true,
        cleaningFee: 30,
        extraPeopleFee: 20,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        accommodates: 6,
        maxGuests: 6,
        squareFeet: 1800,
        isBusinessReady: true,
        active: true,
        createdAt: "2024-03-10T09:45:00Z",
        hostId: 3,
        roomTypeId: 3,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 2,
        countryId: 1,
        neighbourhoodId: 3,
        rating: 4.9,
        reviewsCount: 156,
        hostStatus: "Superhost",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 9, name: "Beach Access", icon: "beach" },
          { id: 10, name: "Hot Tub", icon: "hot-tub" },
          { id: 11, name: "Balcony", icon: "balcony" }
        ],
        photos: [
          "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ]
      },
      {
        id: 5,
        listingTitle: "Mountain Lodge in Da Lat",
        description:
          "Charming lodge surrounded by pine forests. Experience the cool mountain air and peaceful atmosphere of Da Lat.",
        summary: "Mountain lodge with forest views",
        location: "Da Lat, Lam Dong",
        latitude: 11.9404,
        longitude: 108.4583,
        price: 67,
        priceUnit: "cho 2 đêm",
        currency: "USD",
        dates: "1-3 Aug",
        mainImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
        isGuestFavourite: true,
        cleaningFee: 12,
        extraPeopleFee: 8,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        accommodates: 4,
        maxGuests: 4,
        squareFeet: 900,
        isBusinessReady: false,
        active: true,
        createdAt: "2024-01-25T16:20:00Z",
        hostId: 4,
        roomTypeId: 4,
        bedTypeId: 3,
        cancellationId: 3,
        cityId: 3,
        countryId: 1,
        neighbourhoodId: 4,
        rating: 4.7,
        reviewsCount: 203,
        hostStatus: "Host",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 12, name: "Fireplace", icon: "fireplace" },
          { id: 13, name: "Mountain View", icon: "mountain" }
        ],
        photos: [
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
          "https://images.unsplash.com/photo-1506905925346-14b1e3d7e6b3?w=800"
        ]
      },
      {
        id: 6,
        listingTitle: "Riverside Hotel in Can Tho",
        description:
          "Modern hotel with Mekong Delta views. Experience the local culture and enjoy the peaceful riverside setting.",
        summary: "Riverside hotel with Mekong views",
        location: "Can Tho City",
        latitude: 10.0452,
        longitude: 105.7469,
        price: 45,
        priceUnit: "cho 1 đêm",
        currency: "USD",
        dates: "12-13 Jul",
        mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        isGuestFavourite: false,
        cleaningFee: 8,
        extraPeopleFee: 5,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        accommodates: 2,
        maxGuests: 2,
        squareFeet: 600,
        isBusinessReady: true,
        active: true,
        createdAt: "2024-02-05T11:30:00Z",
        hostId: 5,
        roomTypeId: 1,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 4,
        countryId: 1,
        neighbourhoodId: 5,
        rating: 4.5,
        reviewsCount: 78,
        hostStatus: "New Host",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 15, name: "River View", icon: "river" },
          { id: 16, name: "Breakfast", icon: "breakfast" }
        ],
        photos: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ]
      }
    ];
  }

  // ✅ Experience Mock Data
  getMockExperiences() {
    return [
      {
        id: 100,
        category: "experience",

        listingTitle: "Best Street Food Motorbike Tour in Ho Chi Minh City",
        summary: "Top-rated motorbike street food adventure in Saigon",
        description: "Ranked #1 Food Tour in Vietnam since 2022. Hotel pickup & 10 tastings included.",

        rating: 4.9,
        reviewsCount: 120,
        hostStatus: "Superhost",

        location: "District 1, Ho Chi Minh City",
        latitude: 10.7769,
        longitude: 106.7009,

        price: 730000,
        priceUnit: "per guest",
        currency: "₫",

        dates: "Daily • Flexible time",
        mainImage: "/images/id1_img01.png",
        photos: [
          "/images/id100_img01.png",
          "/images/id100_img02.png",
          "/images/id100_img03.png",
          "/images/id100_img04.png",
          "/images/id100_img05.png",
          "/images/id100_img06.png",
        ],

        isGuestFavourite: true,
        active: true,
        createdAt: "2024-03-21T11:00:00Z",

        hostId: 1,

        // ✅ NEW: Experience exclusive data
        details: [
          {
            image: "https://hoiandelicacyhotel.com/wp-content/uploads/2022/08/tranfer.jpg",
            title: "Hotel Pickup",
            description: "We will pick you up from your hotel and start the culinary night adventure."
          },
          {
            image: "https://tse1.mm.bing.net/th/id/OIP.72rOIOjqxKHRT4ianMKJSgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
            title: "Papaya Salad",
            description: "A fresh mix of shredded papaya, beef jerky, peanuts, and crispy crackers."
          },
          {
            image: "https://vnifood.com/wp-content/uploads/2019/11/COCONUT-AND-KUMQUAT-JUICE-03.jpg",
            title: "Coconut Kumquat Juice",
            description: "Refreshing coconut juice infused with tangy kumquat — perfect to cool off the heat."
          },
          {
            image: "https://i0.wp.com/scootersaigontour.com/wp-content/uploads/2017/03/grilled-rice-pancake-in-saigon-vietnam.jpg?fit=1024%2C945&ssl=1",
            title: "Vietnamese Pizza (Bánh Tráng Nướng)",
            description: "Crispy rice paper grilled with egg, cheese, and sausage — a must-try street snack."
          },
          {
            image: "https://farm4.staticflickr.com/3867/14446625218_b1e83724dd_b.jpg",
            title: "Chinatown Street Food",
            description: "Explore the old alleys of Cholon and discover hidden family-run food stalls."
          },
          {
            image: "https://www.cet.edu.vn/wp-content/uploads/2018/03/bun-thit-nuong-kieu-mien-nam.jpg",
            title: "Bún Thịt Nướng",
            description: "Grilled pork, fresh herbs, and rice noodles topped with homemade fish sauce."
          },
          {
            image: "https://scootersaigontour.com/wp-content/uploads/2020/11/Quang-Ba-Flower-Market-in-Hanoi.jpg",
            title: "Saigon Flower Market Stop",
            description: "Take photos at the lively wholesale flower market while enjoying a local beer."
          },
          {
            image: "https://www.theseasonedwok.com/wp-content/uploads/2023/12/banh-flan-recipe-f6.jpg",
            title: "Flan or Chè Dessert",
            description: "Finish the night with a creamy flan or a sweet traditional Vietnamese chè."
          },
          {
            image: "https://images.thespinoff.co.nz/1/2024/07/Vietnameezy.jpg?w=1290",
            title: "Bánh Mì Tasting",
            description: "A famous Saigon-style baguette filled with pâté, cold cuts, and fresh herbs."
          },
          {
            image: "https://hotelcastillo.in/wp-content/uploads/2022/07/valet-parking-4.jpg",
            title: "Drop-off Service",
            description: "We take you back to your hotel or a fun bar spot if you want to continue the night!"
          }
        ]
        ,

        booking: {
          price: 730000,
          currency: "₫",
          timeSlots: [
            { time: "1:00 - 5:00PM", spots: 10 },
            { time: "5:00 - 9:00PM", spots: 10 },
            { time: "6:00 - 10:00PM", spots: 10 }
          ]
        }
      }
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
          rating: 5,
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

    // 🔍 Search by location
    if (filters.location) {
      exps = exps.filter(e =>
        e.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice) {
      exps = exps.filter(e => e.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      exps = exps.filter(e => e.price <= filters.maxPrice);
    }

    return exps.map(e => ({
      id: e.id,
      listingTitle: e.listingTitle,
      location: e.location,
      rating: e.rating,
      dates: e.dates,
      price: e.price,
      priceUnit: e.priceUnit,
      mainImage: e.mainImage,
      isGuestFavourite: e.isGuestFavourite
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
    const exp = experiences.find(e => e.id === parseInt(id));

    if (!exp) {
      throw new Error(`Experience with id ${id} not found`);
    }

    return {
      ...exp,
      reviews: this.getMockReviews(exp.id) || [], // reuse reviews system
      host: this.getMockHost(exp.hostId) || null
    };
  }
  async searchExperiences(query, filters = {}) {
    await this.delayResponse();
    let exps = this.getMockExperiences();

    if (query) {
      exps = exps.filter(e =>
        e.location.toLowerCase().includes(query.toLowerCase()) ||
        e.listingTitle.toLowerCase().includes(query.toLowerCase())
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
