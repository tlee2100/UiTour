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
        category: "property",

        // tên hiển thị
        listingTitle: "Apartment in Quận Ba Đình",
        title: "Apartment in Quận Ba Đình", // fallback cho nơi dùng 'title'

        summary: "Beautiful apartment in historic Ba Dinh district",
        description:
          "Come and stay in this superb duplex T2, in the heart of the historic center of Ho Chi Minh City. Spacious and bright, in a real building in exposed stone, you will enjoy all the charms of the city thanks to its ideal location. Close to many shops, bars and restaurants, you can access the apartment by tram A and C and bus routes 27 and 44.",

        rating: 5.0,
        reviewsCount: 36,
        isActive: true,

        // ⬇ GIỮ location dạng string để KHÔNG phải sửa getProperties()
        location: "Quận Ba Đình, Ho Chi Minh City",
        // ⬇ THÊM location object để đồng bộ Experience
        locationObj: {
          address: "Quận Ba Đình",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.8231,
          lng: 106.6297
        },
        // ⬇ Giữ fallback cũ để các component chưa đổi vẫn chạy
        latitude: 10.8231,
        longitude: 106.6297,

        // ⬇ Đồng bộ pricing như Experience + giữ price cũ cho list
        pricing: {
          basePrice: 45,
          currency: "USD"
        },
        price: 45, // fallback cho list
        priceUnit: "cho 2 đêm",
        currency: "USD",

        dates: "18-25 Jun",

        // Media đồng bộ: cover + photos {id,url}
        media: {
          cover: "/images/id1_img01.png",
          photos: [
            { id: "p11", url: "/images/id1_img01.png" },
            { id: "p12", url: "/images/id1_img02.png" },
            { id: "p13", url: "/images/id1_img03.png" },
            { id: "p14", url: "/images/id1_img04.png" },
            { id: "p15", url: "/images/id1_img05.png" }
          ]
        },
        // giữ các fallback cũ đang được một số UI dùng
        mainImage: "/images/id1_img01.png",
        photos: [
          "/images/id1_img01.png",
          "/images/id1_img02.png",
          "/images/id1_img03.png",
          "/images/id1_img04.png",
          "/images/id1_img05.png"
        ],

        // phí đơn lẻ – HIBookingBox đang dùng các key này
        cleaningFee: 8,
        extraPeopleFee: 5,
        serviceFee: 0,     // thêm để tính tổng không NaN
        taxFee: 0,         // thêm để tính tổng không NaN

        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        accommodates: 2,
        maxGuests: 2,
        squareFeet: 600,
        isBusinessReady: true,
        active: true,

        // đồng bộ details
        details: [
          {
            id: "detail_1",
            image: "/images/detail_placeholder.jpg",
            title: "Modern living space",
            description: "Fully equipped and comfortable"
          }
        ],

        // đồng bộ booking (giữ timeSlots dạng Experience; property có thể để trống)
        booking: {
          maxGuests: 2,
          timeSlots: [] // property thường đặt theo ngày – để trống vẫn OK với UI hiện tại
        },

        createdAt: "2024-01-15T10:30:00Z",
        hostId: 1,
        roomTypeId: 1,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 1,
        countryId: 1,
        neighbourhoodId: 1,

        hostStatus: "Superhost",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 2, name: "Air Conditioning", icon: "ac" },
          { id: 3, name: "Kitchen", icon: "kitchen" },
          { id: 4, name: "TV", icon: "tv" },
          { id: 5, name: "Free Parking", icon: "free_parking" }
        ]

      },

      {
        id: 2,
        category: "property",
        listingTitle: "Luxury Apartment in District 1",
        title: "Luxury Apartment in District 1",
        summary: "Modern 2BR apartment with city views",
        description:
          "Beautiful modern apartment in the heart of Ho Chi Minh City with stunning city views and premium amenities.",
        rating: 4.8,
        reviewsCount: 127,
        isActive: true,

        location: "District 1, Ho Chi Minh City",
        locationObj: {
          address: "District 1",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.7769,
          lng: 106.7009
        },
        latitude: 10.7769,
        longitude: 106.7009,

        pricing: { basePrice: 89, currency: "USD" },
        price: 89,
        priceUnit: "cho 3 đêm",
        currency: "USD",
        dates: "20-23 Jun",

        media: {
          cover: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          photos: [
            { id: "p21", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800" },
            { id: "p22", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
            { id: "p23", url: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800" }
          ]
        },
        mainImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        photos: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800"
        ],

        cleaningFee: 15,
        extraPeopleFee: 10,
        serviceFee: 0,
        taxFee: 0,

        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        accommodates: 4,
        maxGuests: 4,
        squareFeet: 1200,
        isBusinessReady: true,
        active: true,

        details: [],
        booking: { maxGuests: 4, timeSlots: [] },

        createdAt: "2024-01-15T10:30:00Z",
        hostId: 2,
        roomTypeId: 1,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 1,
        countryId: 1,
        neighbourhoodId: 1,

        hostStatus: "Superhost",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 2, name: "Air Conditioning", icon: "ac" },
          { id: 3, name: "Kitchen", icon: "kitchen" },
          { id: 4, name: "Pool", icon: "pool" },
          { id: 5, name: "Gym", icon: "gym" }
        ]
      },

      {
        id: 3,
        category: "property",
        listingTitle: "Cozy Villa in District 2",
        title: "Cozy Villa in District 2",
        summary: "Family-friendly villa with garden",
        description:
          "Spacious villa with private garden, perfect for families. Located in a quiet neighborhood with easy access to the city center.",
        rating: 4.6,
        reviewsCount: 89,
        isActive: true,

        location: "District 2, Ho Chi Minh City",
        locationObj: {
          address: "District 2",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.787,
          lng: 106.7487
        },
        latitude: 10.787,
        longitude: 106.7487,

        pricing: { basePrice: 156, currency: "USD" },
        price: 156,
        priceUnit: "cho 5 đêm",
        currency: "USD",
        dates: "10-15 Jul",

        media: {
          cover: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
          photos: [
            { id: "p31", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800" },
            { id: "p32", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800" }
          ]
        },
        mainImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        photos: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
        ],

        cleaningFee: 25,
        extraPeopleFee: 15,
        serviceFee: 0,
        taxFee: 0,

        bedrooms: 4,
        beds: 4,
        bathrooms: 3,
        accommodates: 8,
        maxGuests: 8,
        squareFeet: 2500,
        isBusinessReady: false,
        active: true,

        details: [],
        booking: { maxGuests: 8, timeSlots: [] },

        createdAt: "2024-02-20T14:15:00Z",
        hostId: 2,
        roomTypeId: 2,
        bedTypeId: 2,
        cancellationId: 2,
        cityId: 1,
        countryId: 1,
        neighbourhoodId: 2,

        hostStatus: "Host",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 6, name: "BBQ", icon: "bbq" },
          { id: 7, name: "Parking", icon: "free_parking" }, // ✅ sửa
          { id: 8, name: "Garden", icon: "ac" } // ✅ tạm fallback icon AC
        ]
      },

      {
        id: 4,
        category: "property",
        listingTitle: "Beach House in Vung Tau",
        title: "Beach House in Vung Tau",
        summary: "Beachfront house with ocean views",
        description:
          "Stunning beachfront property with direct access to the beach. Perfect for a relaxing getaway with ocean views.",
        rating: 4.9,
        reviewsCount: 156,
        isActive: true,

        location: "Vung Tau, Ba Ria - Vung Tau",
        locationObj: {
          address: "Vung Tau",
          city: "Ba Ria - Vung Tau",
          country: "Vietnam",
          lat: 10.346,
          lng: 107.0843
        },
        latitude: 10.346,
        longitude: 107.0843,

        pricing: { basePrice: 234, currency: "USD" },
        price: 234,
        priceUnit: "cho 4 đêm",
        currency: "USD",
        dates: "5-9 May",

        media: {
          cover: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800",
          photos: [
            { id: "p41", url: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800" },
            { id: "p42", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" }
          ]
        },
        mainImage: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800",
        photos: [
          "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ],

        cleaningFee: 30,
        extraPeopleFee: 20,
        serviceFee: 0,
        taxFee: 0,

        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        accommodates: 6,
        maxGuests: 6,
        squareFeet: 1800,
        isBusinessReady: true,
        active: true,

        details: [],
        booking: { maxGuests: 6, timeSlots: [] },

        createdAt: "2024-03-10T09:45:00Z",
        hostId: 3,
        roomTypeId: 3,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 2,
        countryId: 1,
        neighbourhoodId: 3,

        hostStatus: "Superhost",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 10, name: "Hot Tub", icon: "hottub" }, // ✅ sửa
        ]
      },

      {
        id: 5,
        category: "property",
        listingTitle: "Mountain Lodge in Da Lat",
        title: "Mountain Lodge in Da Lat",
        summary: "Mountain lodge with forest views",
        description:
          "Charming lodge surrounded by pine forests. Experience the cool mountain air and peaceful atmosphere of Da Lat.",
        rating: 4.7,
        reviewsCount: 203,
        isActive: true,

        location: "Da Lat, Lam Dong",
        locationObj: {
          address: "Da Lat",
          city: "Lam Dong",
          country: "Vietnam",
          lat: 11.9404,
          lng: 108.4583
        },
        latitude: 11.9404,
        longitude: 108.4583,

        pricing: { basePrice: 67, currency: "USD" },
        price: 67,
        priceUnit: "cho 2 đêm",
        currency: "USD",
        dates: "1-3 Aug",

        media: {
          cover: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
          photos: [
            { id: "p51", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800" },
            { id: "p52", url: "https://images.unsplash.com/photo-1506905925346-14b1e3d7e6b3?w=800" }
          ]
        },
        mainImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
        photos: [
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
          "https://images.unsplash.com/photo-1506905925346-14b1e3d7e6b3?w=800"
        ],

        cleaningFee: 12,
        extraPeopleFee: 8,
        serviceFee: 0,
        taxFee: 0,

        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        accommodates: 4,
        maxGuests: 4,
        squareFeet: 900,
        isBusinessReady: false,
        active: true,

        details: [],
        booking: { maxGuests: 4, timeSlots: [] },

        createdAt: "2024-01-25T16:20:00Z",
        hostId: 4,
        roomTypeId: 4,
        bedTypeId: 3,
        cancellationId: 3,
        cityId: 3,
        countryId: 1,
        neighbourhoodId: 4,

        hostStatus: "Host",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 12, name: "Fireplace", icon: "heating" }, // ✅ dùng icon sưởi
        ]
      },

      {
        id: 6,
        category: "property",
        listingTitle: "Riverside Hotel in Can Tho",
        title: "Riverside Hotel in Can Tho",
        summary: "Riverside hotel with Mekong views",
        description:
          "Modern hotel with Mekong Delta views. Experience the local culture and enjoy the peaceful riverside setting.",
        rating: 4.5,
        reviewsCount: 78,
        isActive: true,

        location: "Can Tho City",
        locationObj: {
          address: "Can Tho City",
          city: "Can Tho",
          country: "Vietnam",
          lat: 10.0452,
          lng: 105.7469
        },
        latitude: 10.0452,
        longitude: 105.7469,

        pricing: { basePrice: 45, currency: "USD" },
        price: 45,
        priceUnit: "cho 1 đêm",
        currency: "USD",
        dates: "12-13 Jul",

        media: {
          cover: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          photos: [
            { id: "p61", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
            { id: "p62", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" }
          ]
        },
        mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        photos: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ],

        cleaningFee: 8,
        extraPeopleFee: 5,
        serviceFee: 0,
        taxFee: 0,

        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        accommodates: 2,
        maxGuests: 2,
        squareFeet: 600,
        isBusinessReady: true,
        active: true,

        details: [],
        booking: { maxGuests: 2, timeSlots: [] },

        createdAt: "2024-02-05T11:30:00Z",
        hostId: 5,
        roomTypeId: 1,
        bedTypeId: 1,
        cancellationId: 1,
        cityId: 4,
        countryId: 1,
        neighbourhoodId: 5,

        hostStatus: "New Host",
        amenities: [
          { id: 1, name: "WiFi", icon: "wifi" },
          { id: 16, name: "Breakfast", icon: "breakfast" }
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
        title: "Best Street Food Motorbike Tour in Ho Chi Minh City",
        summary: "Top-rated motorbike street food adventure in Saigon",
        description:
          "Ranked #1 Food Tour since 2022. Hotel pickup & 10 tastings included.",
        rating: 4.9,
        reviewsCount: 120,
        hostId: 1,
        isActive: true,

        durationHours: 4,

        location: {
          address: "District 1",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 10.7769,
          lng: 106.7009
        },

        pricing: {
          basePrice: 730000,
          currency: "VND",
          unit: "perPerson"
        },

        media: {
          cover: "/images/id100_img01.png",
          photos: [
            { id: "p1", url: "/images/id100_img01.png" },
            { id: "p2", url: "/images/id100_img02.png" },
            { id: "p3", url: "/images/id100_img03.png" },
            { id: "p4", url: "/images/id100_img04.png" },
            { id: "p5", url: "/images/id100_img05.png" },
            { id: "p6", url: "/images/id100_img06.png" }
          ]
        },

        details: [
          {
            id: "detail_1",
            image:
              "https://hoiandelicacyhotel.com/wp-content/uploads/2022/08/tranfer.jpg",
            title: "Hotel Pickup",
            description:
              "We will pick you up from your hotel and start the culinary night adventure."
          },
          {
            id: "detail_2",
            image:
              "https://tse1.mm.bing.net/th/id/OIP.72rOIOjqxKHRT4ianMKJSgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
            title: "Papaya Salad",
            description:
              "A fresh mix of shredded papaya, beef jerky, peanuts, and crispy crackers."
          },
          {
            id: "detail_3",
            image:
              "https://vnifood.com/wp-content/uploads/2019/11/COCONUT-AND-KUMQUAT-JUICE-03.jpg",
            title: "Coconut Kumquat Juice",
            description:
              "Refreshing coconut juice infused with tangy kumquat — perfect to cool off the heat."
          },
          {
            id: "detail_4",
            image:
              "https://i0.wp.com/scootersaigontour.com/wp-content/uploads/2017/03/grilled-rice-pancake-in-saigon-vietnam.jpg?fit=1024%2C945&ssl=1",
            title: "Vietnamese Pizza (Bánh Tráng Nướng)",
            description:
              "Crispy rice paper grilled with egg, cheese, and sausage — a must-try street snack."
          },
          {
            id: "detail_5",
            image:
              "https://farm4.staticflickr.com/3867/14446625218_b1e83724dd_b.jpg",
            title: "Chinatown Street Food",
            description:
              "Explore the old alleys of Cholon and discover hidden family-run food stalls."
          },
          {
            id: "detail_6",
            image:
              "https://www.cet.edu.vn/wp-content/uploads/2018/03/bun-thit-nuong-kieu-mien-nam.jpg",
            title: "Bún Thịt Nướng",
            description:
              "Grilled pork, fresh herbs, and rice noodles topped with homemade fish sauce."
          },
          {
            id: "detail_7",
            image:
              "https://scootersaigontour.com/wp-content/uploads/2020/11/Quang-Ba-Flower-Market-in-Hanoi.jpg",
            title: "Saigon Flower Market Stop",
            description:
              "Take photos at the lively wholesale flower market while enjoying a local beer."
          },
          {
            id: "detail_8",
            image:
              "https://www.theseasonedwok.com/wp-content/uploads/2023/12/banh-flan-recipe-f6.jpg",
            title: "Flan or Chè Dessert",
            description:
              "Finish the night with a creamy flan or a sweet traditional Vietnamese chè."
          },
          {
            id: "detail_9",
            image:
              "https://images.thespinoff.co.nz/1/2024/07/Vietnameezy.jpg?w=1290",
            title: "Bánh Mì Tasting",
            description:
              "A famous Saigon-style baguette filled with pâté, cold cuts, and fresh herbs."
          },
          {
            id: "detail_10",
            image:
              "https://hotelcastillo.in/wp-content/uploads/2022/07/valet-parking-4.jpg",
            title: "Drop-off Service",
            description:
              "We take you back to your hotel or a fun bar spot if you want to continue the night!"
          }
        ],

        booking: {
          maxGuests: 10,
          timeSlots: [
            {
              id: "slot_100_1",
              date: "2025-03-21",
              time: "13:00 - 17:00",
              spotsAvailable: 10
            },
            {
              id: "slot_100_2",
              date: "2025-03-21",
              time: "17:00 - 21:00",
              spotsAvailable: 10
            },
            {
              id: "slot_100_3",
              date: "2025-03-22",
              time: "18:00 - 22:00",
              spotsAvailable: 10
            }
          ]
        },

        createdAt: "2024-03-21T11:00:00Z"
      }
      ,
      {
        id: 101,
        category: "experience",

        title: "Traditional Vietnamese Water Puppet Show & Backstage Tour",
        summary: "Discover Vietnam’s unique wooden puppetry art form",
        description:
          "See skilled puppeteers bring folklore to life with water, music, and lights. Backstage access included.",
        rating: 4.8,
        reviewsCount: 85,
        hostId: 2,
        isActive: true,

        durationHours: 1.5,

        location: {
          address: "Hoan Kiem",
          city: "Hanoi",
          country: "Vietnam",
          lat: 21.0285,
          lng: 105.8542
        },

        pricing: {
          basePrice: 550000,
          currency: "VND",
          unit: "perPerson"
        },

        media: {
          cover: "/images/id101_img01.png",
          photos: [
            { id: "p1", url: "/images/id101_img01.png" },
            { id: "p2", url: "/images/id101_img02.png" },
            { id: "p3", url: "/images/id101_img03.png" },
            { id: "p4", url: "/images/id101_img04.png" },
            { id: "p5", url: "/images/id101_img05.png" }
          ]
        },

        details: [
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

        booking: {
          maxGuests: 20,
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

        createdAt: "2024-03-20T15:30:00Z"
      }
      ,
      {
        id: 102,
        category: "experience",

        title: "Morning Yoga & Vegan Breakfast on Danang Beach",
        summary: "Refresh your mind and body next to the ocean waves",
        description:
          "Professional yoga instructors guide you in a sunrise meditation followed by a healthy vegan brunch.",
        rating: 4.9,
        reviewsCount: 64,
        hostId: 3,
        isActive: true,

        durationHours: 2,

        location: {
          address: "My Khe Beach",
          city: "Da Nang",
          country: "Vietnam",
          lat: 16.0592,
          lng: 108.2455
        },

        pricing: {
          basePrice: 620000,
          currency: "VND",
          unit: "perPerson"
        },

        media: {
          cover: "/images/id102_img01.png",
          photos: [
            { id: "p1", url: "/images/id102_img01.png" },
            { id: "p2", url: "/images/id102_img02.png" },
            { id: "p3", url: "/images/id102_img03.png" },
            { id: "p4", url: "/images/id102_img04.png" }
          ]
        },

        details: [
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

        booking: {
          maxGuests: 12,
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

        createdAt: "2024-03-28T09:00:00Z"
      }
      ,
      {
        id: 103,
        category: "experience",

        title: "Cu Chi Tunnels War History Guided Tour",
        summary: "Walk through Vietnam War underground tunnels",
        description:
          "See real tunnels, weapon traps and learn the story of soldiers who lived underground.",
        rating: 4.8,
        reviewsCount: 210,
        hostId: 4,
        isActive: true,

        durationHours: 6,

        location: {
          address: "Cu Chi District",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          lat: 11.146,
          lng: 106.346
        },

        pricing: {
          basePrice: 890000,
          currency: "VND",
          unit: "perPerson"
        },

        media: {
          cover: "/images/id103_img01.png",
          photos: [
            { id: "p1", url: "/images/id103_img01.png" },
            { id: "p2", url: "/images/id103_img02.png" },
            { id: "p3", url: "/images/id103_img03.png" },
            { id: "p4", url: "/images/id103_img04.png" },
            { id: "p5", url: "/images/id103_img05.png" }
          ]
        },

        details: [
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
            description:
              "Try cassava with peanuts — meal from wartime era."
          }
        ],

        booking: {
          maxGuests: 20,
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

        createdAt: "2024-02-08T10:00:00Z"
      }
      ,
      {
        id: 104,
        category: "experience",

        title: "Ha Long Bay Sunset Kayak & Cave Adventure",
        summary: "Explore emerald waters and limestone caves",
        description:
          "Kayak through peaceful lagoons & hidden caves — best time to see the golden sunset on the bay.",
        rating: 5.0,
        reviewsCount: 175,
        hostId: 5,
        isActive: true,

        durationHours: 4,

        location: {
          address: "Ha Long Bay",
          city: "Quang Ninh",
          country: "Vietnam",
          lat: 20.9101,
          lng: 107.1839
        },

        pricing: {
          basePrice: 1250000,
          currency: "VND",
          unit: "perPerson"
        },

        media: {
          cover: "/images/id104_img01.png",
          photos: [
            { id: "p1", url: "/images/id104_img01.png" },
            { id: "p2", url: "/images/id104_img02.png" },
            { id: "p3", url: "/images/id104_img03.png" },
            { id: "p4", url: "/images/id104_img04.png" }
          ]
        },

        details: [
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
            description:
              "Discover caves with glimmering rocks inside."
          },
          {
            id: "detail_3",
            image: "https://wallpaperaccess.com/full/3745010.jpg",
            title: "Sunset Viewpoint",
            description:
              "Golden hour photos guaranteed — perfect for couples."
          }
        ],

        booking: {
          maxGuests: 14,
          timeSlots: [
            {
              id: "slot_104_1",
              date: "2025-04-01",
              time: "14:00 - 18:00",
              spotsAvailable: 14
            }
          ]
        },

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

    // 🔍 Filter by location text
    if (filters.location) {
      exps = exps.filter(e =>
        `${e.location.address}, ${e.location.city}, ${e.location.country}`
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // 🔍 Filter by price
    if (filters.minPrice) {
      exps = exps.filter(e => e.pricing.basePrice >= filters.minPrice);
    }
    if (filters.maxPrice) {
      exps = exps.filter(e => e.pricing.basePrice <= filters.maxPrice);
    }

    // ✅ Return new compact list format
    return exps.map(e => ({
      id: e.id,
      title: e.title,
      description: e.summary || e.description,
      price: e.pricing.basePrice,
      rating: e.rating,
      reviews: e.reviewsCount,
      image: e.media.cover,
      category: e.category,
      duration: `${e.durationHours} hours`,
      location: `${e.location.address}, ${e.location.city}`,
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
