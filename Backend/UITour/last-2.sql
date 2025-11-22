create database UITour
use UITour
-- ================= Reference tables =================
CREATE TABLE Countries (
    CountryID INT IDENTITY(1,1) PRIMARY KEY,
    CountryName NVARCHAR(200) NOT NULL
);

CREATE TABLE Cities (
    CityID INT IDENTITY(1,1) PRIMARY KEY,
    CityName NVARCHAR(200) NOT NULL,
    CountryID INT NOT NULL FOREIGN KEY REFERENCES Countries(CountryID)
);

CREATE TABLE Neighbourhoods (
    NeighbourhoodID INT IDENTITY(1,1) PRIMARY KEY,
    NeighbourhoodName NVARCHAR(200) NOT NULL,
    CityID INT NOT NULL FOREIGN KEY REFERENCES Cities(CityID)
);

CREATE TABLE RoomTypes (
    RoomTypeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE BedTypes (
    BedTypeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE CancellationPolicies (
    CancellationID INT IDENTITY(1,1) PRIMARY KEY,
    PolicyName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Details NVARCHAR(MAX)
);

CREATE TABLE VerificationTypes (
    VerificationTypeID INT IDENTITY(1,1) PRIMARY KEY,
    VerificationName NVARCHAR(200) NOT NULL
);

CREATE TABLE Amenities (
    AmenityID INT IDENTITY(1,1) PRIMARY KEY,
    AmenityName NVARCHAR(200) NOT NULL UNIQUE
);

-- ================= Users & Hosts =================
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FullName NVARCHAR(200),
    Phone NVARCHAR(50),
    RegisteredAt DATETIME DEFAULT GETDATE(),
	PasswordHash NVARCHAR(255),
	Avatar NVARCHAR(500)
);

CREATE TABLE Hosts (
    HostID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(UserID),
    HostSince DATE,
    HostAbout NVARCHAR(MAX),
    HostResponseRate TINYINT,
    HostResponseTime NVARCHAR(100),  -- e.g., "within an hour", "within a few hours"
    Languages NVARCHAR(500),  -- JSON array or comma-separated: ["English", "Vietnamese"]
    IsSuperHost BIT DEFAULT 0
);

-- ================= Properties / Listings =================
CREATE TABLE Properties (
    PropertyID INT IDENTITY(1,1) PRIMARY KEY,
    HostID INT NOT NULL FOREIGN KEY REFERENCES Hosts(HostID),
    ListingTitle NVARCHAR(300),
    Description NVARCHAR(MAX),
    Summary NVARCHAR(MAX),
    Location NVARCHAR(300),
    NeighbourhoodID INT FOREIGN KEY REFERENCES Neighbourhoods(NeighbourhoodID),
    CityID INT FOREIGN KEY REFERENCES Cities(CityID),
    CountryID INT FOREIGN KEY REFERENCES Countries(CountryID),
    RoomTypeID INT FOREIGN KEY REFERENCES RoomTypes(RoomTypeID),
    BedTypeID INT FOREIGN KEY REFERENCES BedTypes(BedTypeID),
    Bedrooms SMALLINT,
    Beds SMALLINT,
    Bathrooms DECIMAL(3,1),
    Accommodates SMALLINT,
    Price DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'USD',
    CleaningFee DECIMAL(10,2),
    ExtraPeopleFee DECIMAL(10,2),
    SquareFeet INT,
    IsBusinessReady BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    Active BIT DEFAULT 1,
    CancellationID INT FOREIGN KEY REFERENCES CancellationPolicies(CancellationID)
);

ALTER TABLE Properties
ADD PropertyType NVARCHAR(100)

ALTER TABLE Properties
ADD selfCheckIn BIT Default 1

ALTER TABLE Properties
ADD enhancedClean BIT Default 1

ALTER TABLE Properties
ADD freeCancellation BIT Default 1

ALTER TABLE Properties
ADD checkin_after NVARCHAR(100)

ALTER TABLE Properties
ADD self_checkin_method NVARCHAR(100)


ALTER TABLE Properties
ADD no_smoking BIT Default 1

ALTER TABLE Properties
ADD no_open_flames BIT Default 1

ALTER TABLE Properties
ADD pets_allowed BIT Default 1

ALTER TABLE Properties
ADD no_parties BIT Default 1

ALTER TABLE Properties
ADD lat NVARCHAR(200)

ALTER TABLE Properties
ADD lng NVARCHAR(200)

-- Additional fields for Properties
ALTER TABLE Properties
ADD ServiceFee DECIMAL(10,2) DEFAULT 0

ALTER TABLE Properties
ADD TaxFee DECIMAL(10,2) DEFAULT 0

ALTER TABLE Properties
ADD Discount DECIMAL(10,2) DEFAULT 0

ALTER TABLE Properties
ADD DiscountPercentage DECIMAL(5,2) DEFAULT 0

ALTER TABLE Properties
ADD checkout_before NVARCHAR(100)

ALTER TABLE Properties
ADD UpdatedAt DATETIME DEFAULT GETDATE()

ALTER TABLE Properties
ADD HouseRules NVARCHAR(MAX)

-- Health & Safety fields
ALTER TABLE Properties
ADD CovidSafety BIT DEFAULT 0

ALTER TABLE Properties
ADD SurfacesSanitized BIT DEFAULT 0

ALTER TABLE Properties
ADD CarbonMonoxideAlarm BIT DEFAULT 0

ALTER TABLE Properties
ADD SmokeAlarm BIT DEFAULT 0

ALTER TABLE Properties
ADD SecurityDepositRequired BIT DEFAULT 0

ALTER TABLE Properties
ADD SecurityDepositAmount DECIMAL(10,2) DEFAULT 0

-- Many-to-Many: Property - Amenity
CREATE TABLE PropertyAmenities (
    PropertyID INT NOT NULL FOREIGN KEY REFERENCES Properties(PropertyID) ON DELETE CASCADE,
    AmenityID INT NOT NULL FOREIGN KEY REFERENCES Amenities(AmenityID) ON DELETE CASCADE,
    Quantity SMALLINT DEFAULT 1,
    CONSTRAINT PK_PropertyAmenities PRIMARY KEY (PropertyID, AmenityID)
);

-- ================= Calendar / Availability =================
CREATE TABLE Calendars (
    CalendarID INT IDENTITY(1,1) PRIMARY KEY,
    PropertyID INT NOT NULL FOREIGN KEY REFERENCES Properties(PropertyID) ON DELETE CASCADE,
    Date DATE NOT NULL,
    Price DECIMAL(10,2),
    Available BIT DEFAULT 1,
    MinNights SMALLINT DEFAULT 1,
    MaxNights SMALLINT DEFAULT 30,
    LastModified DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_PropertyDate UNIQUE (PropertyID, Date)
);

-- ================= Bookings =================
CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    PropertyID INT NOT NULL FOREIGN KEY REFERENCES Properties(PropertyID),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    HostID INT NOT NULL FOREIGN KEY REFERENCES Hosts(HostID),
    CheckIn DATE NOT NULL,
    CheckOut DATE NOT NULL,
    Nights INT NOT NULL,
    GuestsCount SMALLINT NOT NULL,
    BasePrice DECIMAL(10,2) NOT NULL,
    CleaningFee DECIMAL(10,2) DEFAULT 0,
    ServiceFee DECIMAL(10,2) DEFAULT 0,
    TotalPrice DECIMAL(12,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'USD',
    Status NVARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ================= Transactions =================
CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    BookingID INT NOT NULL FOREIGN KEY REFERENCES Bookings(BookingID) ON DELETE CASCADE,
    Amount DECIMAL(12,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'USD',
    PaymentMethod NVARCHAR(50),
    PaymentStatus NVARCHAR(50),
    ProcessedAt DATETIME DEFAULT GETDATE()
);

-- ================= Reviews =================
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    PropertyID INT FOREIGN KEY REFERENCES Properties(PropertyID) ON DELETE CASCADE,
    BookingID INT FOREIGN KEY REFERENCES Bookings(BookingID),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Rating TINYINT CHECK (Rating BETWEEN 1 AND 5),
    Comments NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);




-- ================= Host Verifications =================
CREATE TABLE HostVerifications (
    HostVerificationID INT IDENTITY(1,1) PRIMARY KEY,
    HostID INT NOT NULL FOREIGN KEY REFERENCES Hosts(HostID) ON DELETE CASCADE,
    VerificationTypeID INT FOREIGN KEY REFERENCES VerificationTypes(VerificationTypeID),
    VerifiedAt DATETIME,
    Details NVARCHAR(MAX)
);

-- ================= Property Photos =================
CREATE TABLE PropertyPhotos (
    PhotoID INT IDENTITY(1,1) PRIMARY KEY,
    PropertyID INT NOT NULL FOREIGN KEY REFERENCES Properties(PropertyID) ON DELETE CASCADE,
    Url NVARCHAR(500) NOT NULL,
    Caption NVARCHAR(300),
    SortIndex INT DEFAULT 0
);

-- ================= Saved Listings =================
CREATE TABLE SavedListings (
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    PropertyID INT NOT NULL FOREIGN KEY REFERENCES Properties(PropertyID) ON DELETE CASCADE,
    SavedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_SavedListings PRIMARY KEY (UserID, PropertyID)
);

-- ================= Messages =================
CREATE TABLE Messages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    FromUserID INT FOREIGN KEY REFERENCES Users(UserID),
    ToUserID INT FOREIGN KEY REFERENCES Users(UserID),
    BookingID INT FOREIGN KEY REFERENCES Bookings(BookingID),
    PropertyID INT FOREIGN KEY REFERENCES Properties(PropertyID),
    Content NVARCHAR(MAX),
    SentAt DATETIME DEFAULT GETDATE(),
    IsRead BIT DEFAULT 0
);

CREATE TABLE Tours (
    TourID INT IDENTITY(1,1) PRIMARY KEY,
    HostID INT NOT NULL FOREIGN KEY REFERENCES Hosts(HostID),
    TourName NVARCHAR(300) NOT NULL,
    Description NVARCHAR(MAX),
    Location NVARCHAR(300),
    CityID INT FOREIGN KEY REFERENCES Cities(CityID),
    CountryID INT FOREIGN KEY REFERENCES Countries(CountryID),
    DurationDays INT DEFAULT 1, -- số ngày diễn ra tour
    MaxGuests INT NOT NULL DEFAULT 10,
    Price DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'USD',
    StartDate DATE NOT NULL,
    EndDate DATE,
    CreatedAt DATETIME DEFAULT GETDATE(),
    Active BIT DEFAULT 1,
    CancellationID INT FOREIGN KEY REFERENCES CancellationPolicies(CancellationID)
);

CREATE TABLE TourParticipants (
    TourID INT NOT NULL FOREIGN KEY REFERENCES Tours(TourID) ON DELETE CASCADE,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    JoinedAt DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(50) DEFAULT 'confirmed', -- pending, confirmed, cancelled
    CONSTRAINT PK_TourParticipants PRIMARY KEY (TourID, UserID)
);

CREATE TABLE TourPhotos (
    PhotoID INT IDENTITY(1,1) PRIMARY KEY,
    TourID INT NOT NULL FOREIGN KEY REFERENCES Tours(TourID) ON DELETE CASCADE,
    Url NVARCHAR(500) NOT NULL,
    Caption NVARCHAR(300),
    SortIndex INT DEFAULT 0
);

CREATE TABLE TourReviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    TourID INT NOT NULL FOREIGN KEY REFERENCES Tours(TourID) ON DELETE CASCADE,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Rating TINYINT CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
USE UITour;
GO

-- ============= Insert into Amenities =============
INSERT INTO Amenities (AmenityName) VALUES
(N'Wifi'),
(N'Washer'),
(N'Heating'),
(N'Iron'),
(N'King bed'),
(N'Air Conditioning'),
(N'TV'),
(N'Kitchen'),
(N'Gym'),
(N'Dedicated workspace'),
(N'Free parking'),
(N'Breakfast'),
(N'Smoke Alarm'),
(N'Pool'),
(N'Dryer'),
(N'Hair Dryer'),
(N'Hot tub'),
(N'EV charger'),
(N'BBQ grill');

-- ============= Countries =============
INSERT INTO Countries (CountryName) VALUES 
(N'Vietnam'),
(N'Singapore'),
(N'Thailand');

-- ============= Cities =============
-- Vietnam
INSERT INTO Cities (CityName, CountryID) VALUES
(N'Hanoi', 1),
(N'Ho Chi Minh City', 1),
(N'Da Nang', 1),
(N'Nha Trang', 1),
(N'Hoi An', 1);

-- Singapore
INSERT INTO Cities (CityName, CountryID) VALUES
(N'Singapore', 2),
(N'Marina Bay', 2),
(N'Sentosa', 2),
(N'Orchard Road', 2),
(N'Chinatown', 2);

-- Thailand
INSERT INTO Cities (CityName, CountryID) VALUES
(N'Bangkok', 3),
(N'Chiang Mai', 3),
(N'Phuket', 3),
(N'Pattaya', 3),
(N'Krabi', 3);

-- ============= Neighbourhoods =============
INSERT INTO Neighbourhoods (NeighbourhoodName, CityID) VALUES
(N'Hoan Kiem', 1), 
(N'Dong Da', 1),
(N'District 1', 2),
(N'District 3', 2),
(N'Son Tra', 3);

-- Singapore
INSERT INTO Neighbourhoods (NeighbourhoodName, CityID) VALUES
(N'Marina Bay Sands', 6),
(N'Sentosa Beach', 7),
(N'Orchard Central', 8),
(N'Chinatown Heritage', 9),
(N'Little India', 6);

-- Thailand
INSERT INTO Neighbourhoods (NeighbourhoodName, CityID) VALUES
(N'Sukhumvit', 11),
(N'Old City', 12),
(N'Patong Beach', 13),
(N'Walking Street', 14),
(N'Ao Nang', 15);

-- ============= RoomTypes =============
INSERT INTO RoomTypes (Name) VALUES
(N'Entire home/apt'),
(N'Private room'),
(N'Shared room'),
(N'Hotel room');

-- ============= BedTypes =============
INSERT INTO BedTypes (Name) VALUES
(N'King'),
(N'Queen'),
(N'Double'),
(N'Single'),
(N'Sofa bed');

-- ============= CancellationPolicies =============
INSERT INTO CancellationPolicies (PolicyName, Description, Details) VALUES
(N'Flexible', N'Full refund 1 day prior to arrival', N'Cancel up to 24 hours before check-in to get a full refund (minus service fees). Cancel within 24 hours of check-in and the first night is non-refundable. Service fees are refunded when cancellation happens before check-in and within 48 hours of booking.'),
(N'Moderate', N'Full refund 5 days prior to arrival', N'Cancel up to 5 days before check-in to get a full refund (minus service fees). Cancel within 5 days of check-in and the first night is non-refundable, but 50% of the cost for the remaining nights will be refunded. Service fees are refunded when cancellation happens before check-in and within 48 hours of booking.'),
(N'Strict', N'50% refund up to 1 week before arrival', N'Cancel up to 7 days before check-in to get a 50% refund (minus service fees). Cancel within 7 days of check-in and the reservation is non-refundable. Service fees are refunded when cancellation happens before check-in and within 48 hours of booking.');

-- ============= VerificationTypes =============
INSERT INTO VerificationTypes (VerificationName) VALUES
(N'Email'),
(N'Phone'),
(N'Government ID'),
(N'Facebook'),
(N'Work Email');

-- ============= Users =============
INSERT INTO Users (Email, FullName, Phone, Avatar) VALUES
(N'23520449@gm.uit.edu.vn', N'Tran Anh Hao', N'0967248387', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(N'23521373@gm.uit.edu.vn', N'Hoang Van Tai', N'0902758301', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(N'23521399@gm.uit.edu.vn', N'Le Phuoc Ngoc Tan', N'0392091842', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(N'23520962@gm.uit.edu.vn', N'Vo Khoi Binh Minh', N'0962702157', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150');

-- ============= Hosts =============
-- Note: HostID 1 = UserID 1 (Tran Anh Hao), HostID 2 = UserID 3 (Le Phuoc Ngoc Tan)
INSERT INTO Hosts (UserID, HostSince, HostAbout, HostResponseRate, HostResponseTime, Languages, IsSuperHost) VALUES
(1, '2019-05-01', N'I love hosting travelers in Hanoi! I have been hosting for over 5 years and enjoy sharing local tips and recommendations. My properties are always clean and well-maintained. Feel free to ask me anything about the area!', 95, N'within an hour', N'["English", "Vietnamese"]', 1),
(3, '2020-03-10', N'Offering cozy apartments in Singapore. I am passionate about providing comfortable stays for guests. My goal is to make your visit memorable and enjoyable.', 90, N'within a few hours', N'["English", "Vietnamese", "Chinese"]', 0);

-- ============= Properties =============
INSERT INTO [dbo].[Properties] (
    [HostID], [ListingTitle], [Description], [Summary], [Location],
    [NeighbourhoodID], [CityID], [CountryID], [RoomTypeID], [BedTypeID],
    [Bedrooms], [Beds], [Bathrooms], [Accommodates],
    [Price], [Currency], [CleaningFee], [ExtraPeopleFee], [SquareFeet],
    [IsBusinessReady], [CancellationID], [PropertyType],
    [selfCheckIn], [enhancedClean], [freeCancellation],
    [checkin_after], [checkout_before], [self_checkin_method],
    [no_smoking], [no_open_flames], [pets_allowed], [no_parties],
    [lat], [lng],
    [ServiceFee], [TaxFee], [Discount], [DiscountPercentage],
    [HouseRules], [CovidSafety], [SurfacesSanitized], [CarbonMonoxideAlarm],
    [SmokeAlarm], [SecurityDepositRequired], [SecurityDepositAmount]
) VALUES
(1, 'Cozy Studio in District 1', 'A fully furnished studio located in the heart of Ho Chi Minh City, near Ben Thanh Market.',
 'Perfect for solo travelers or couples.', '123 Nguyen Hue, District 1, Ho Chi Minh City',
 1, 1, 1, 1, 1, 1, 1, 1.0, 2, 39, 'USD', 5, 2, 35, 1, 1, 'Apartment',
 1, 1, 1, '14:00', '11:00', 'Lockbox', 1, 1, 0, 1, 10.7769, 106.7009,
 8, 5, 0, 0, 
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"},{"id":"pets_allowed","label":"Pets allowed"}]',
 1, 1, 1, 1, 0, 0),

(2, 'Luxury Beachfront Villa Da Nang', 'Spacious beachfront villa with private pool and ocean view near My Khe Beach.',
 'Ideal for family vacations.', '45 Vo Nguyen Giap, Son Tra, Da Nang',
 2, 2, 1, 2, 2, 4, 5, 3.0, 10, 150, 'USD', 13, 5, 220, 1, 2, 'Villa',
 1, 1, 1, '15:00', '10:00', 'Smart Lock', 0, 1, 1, 0, 16.0678, 108.2208,
 25, 15, 20, 10,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"},{"id":"no_open_flames","label":"No open flames"}]',
 1, 1, 1, 1, 1, 500),

(1, 'Traditional House in Old Quarter', 'A classic Hanoi-style home in the Old Quarter, close to Hoan Kiem Lake.',
 'Cultural charm with modern comfort.', '12 Hang Bac, Hoan Kiem, Hanoi',
 3, 3, 1, 1, 1, 2, 2, 1.0, 4, 52, 'USD', 3, 2, 50, 0, 1, 'Townhouse',
 0, 1, 0, '13:00', '11:00', 'Lockbox', 1, 1, 0, 1, 21.0333, 105.8500,
 10, 6, 0, 0,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"}]',
 0, 1, 0, 1, 0, 0),

(1, 'Landmark 81 Luxury Apartment', 'Modern high-rise apartment with river view and premium facilities.',
 'Perfect for business travelers.', '208 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh City',
 4, 1, 1, 3, 2, 2, 2, 2.0, 4, 120, 'USD', 8, 6, 95, 1, 3, 'Condo',
 1, 1, 1, '15:00', '11:00', 'Keypad', 1, 1, 0, 1, 10.7943, 106.7201,
 18, 12, 15, 10,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"},{"id":"no_open_flames","label":"No open flames"}]',
 1, 1, 1, 1, 0, 0),

(1, 'Mai Chau Countryside Homestay', 'Peaceful wooden stilt house surrounded by rice fields and mountains.',
 'Ideal for a nature retreat.', 'Ban Lac, Mai Chau, Hoa Binh',
 5, 4, 1, 2, 1, 2, 3, 1.0, 5, 30, 'USD', 2, 0, 80, 0, 2, 'Homestay',
 0, 0, 0, '12:00', '10:00', 'Host Welcome', 0, 1, 1, 0, 20.7167, 105.1000,
 5, 3, 0, 0,
 N'[{"id":"pets_allowed","label":"Pets allowed"},{"id":"no_smoking","label":"No smoking"}]',
 0, 0, 0, 0, 0, 0),

(1, 'Apartment near Tan Son Nhat Airport', 'Clean, modern apartment just 5 minutes from the airport.',
 'Perfect for short business stays.', '10 Truong Son, Tan Binh, Ho Chi Minh City',
 6, 1, 1, 1, 1, 1, 1, 1.0, 2, 40, 'USD', 3, 2, 40, 1, 1, 'Apartment',
 1, 1, 1, '14:00', '11:00', 'Lockbox', 1, 1, 0, 1, 10.8133, 106.6650,
 6, 4, 0, 0,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"}]',
 1, 1, 1, 1, 0, 0),

(1, 'Mountain View Cabin Sapa', 'Cozy wooden cabin with stunning mountain views in Sapa.',
 'Great for couples seeking peace.', 'Cat Cat Village, Sapa, Lao Cai',
 7, 5, 1, 2, 1, 1, 1, 1.0, 2, 48, 'USD', 4, 2, 60, 0, 2, 'Cabin',
 0, 0, 0, '13:00', '10:00', 'Smart Lock', 0, 1, 1, 0, 22.3350, 103.8430,
 8, 5, 0, 0,
 N'[{"id":"pets_allowed","label":"Pets allowed"},{"id":"no_smoking","label":"No smoking"},{"id":"no_open_flames","label":"No open flames"}]',
 0, 0, 0, 1, 0, 0),

(2, 'Riverside Bungalow Hoi An', 'Private bungalow near the river, close to Hoi An Ancient Town.',
 'Quiet, peaceful stay for couples.', 'Nguyen Phuc Chu, Hoi An, Quang Nam',
 8, 6, 1, 2, 2, 1, 1, 1.0, 2, 57, 'USD', 5, 2, 70, 0, 2, 'Bungalow',
 1, 1, 1, '15:00', '11:00', 'Host Welcome', 1, 1, 1, 1, 15.8801, 108.3380,
 10, 7, 0, 0,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"pets_allowed","label":"Pets allowed"},{"id":"no_parties","label":"No parties or events"}]',
 1, 1, 1, 1, 0, 0),

(2, 'City Loft Apartment Saigon', 'Industrial-style loft apartment near cafes and nightlife.',
 'Perfect for young travelers.', '20 Le Lai, District 1, Ho Chi Minh City',
 9, 1, 1, 3, 2, 1, 1, 1.0, 2, 65, 'USD', 4, 4, 55, 1, 3, 'Loft',
 1, 1, 1, '15:00', '11:00', 'Keypad', 1, 1, 0, 1, 10.7710, 106.6955,
 10, 8, 5, 5,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"},{"id":"no_open_flames","label":"No open flames"}]',
 1, 1, 1, 1, 0, 0),

(2, 'Family Garden House Da Lat', 'Spacious home with private garden and parking, close to city center.',
 'Ideal for family vacations.', 'Nguyen Trung Truc, Ward 4, Da Lat',
 10, 7, 1, 2, 2, 3, 3, 2.0, 6, 86, 'USD', 7, 4, 120, 1, 1, 'House',
 1, 1, 1, '14:00', '10:00', 'Lockbox', 1, 1, 1, 0, 11.9404, 108.4583,
 15, 10, 10, 10,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"pets_allowed","label":"Pets allowed"},{"id":"no_parties","label":"No parties or events"}]',
 1, 1, 1, 1, 0, 0),

(2, 'Eco Bamboo Hut Phong Nha', 'Eco-friendly bamboo hut surrounded by nature, near famous caves.',
 'Unique and sustainable experience.', 'Son Trach, Bo Trach, Quang Binh',
 11, 8, 1, 2, 1, 1, 1, 1.0, 2, 26, 'USD', 2, 0, 40, 0, 2, 'Hut',
 0, 0, 0, '12:00', '10:00', 'Host Welcome', 1, 1, 1, 0, 17.5843, 106.2921,
 4, 3, 0, 0,
 N'[{"id":"pets_allowed","label":"Pets allowed"},{"id":"no_smoking","label":"No smoking"},{"id":"no_open_flames","label":"No open flames"}]',
 0, 0, 0, 0, 0, 0),

(2, 'Seaside Apartment Nha Trang', 'Bright apartment with a sea view balcony, just steps from the beach.',
 'Perfect for couples or digital nomads.', 'Tran Phu Street, Nha Trang, Khanh Hoa',
 12, 9, 1, 1, 1, 1, 1, 1.0, 2, 52, 'USD', 4, 2, 45, 1, 1, 'Apartment',
 1, 1, 1, '15:00', '11:00', 'Keypad', 1, 1, 0, 1, 12.2388, 109.1967,
 8, 6, 0, 0,
 N'[{"id":"no_smoking","label":"No smoking"},{"id":"no_parties","label":"No parties or events"},{"id":"no_open_flames","label":"No open flames"}]',
 1, 1, 1, 1, 0, 0);



-- ============= PropertyAmenities =============
-- Note: PropertyID starts from 1 (first property inserted)
INSERT INTO PropertyAmenities (PropertyID, AmenityID) VALUES
-- Property 1: Cozy Studio in District 1
(1, 1),  -- Wifi
(1, 6),  -- Air Conditioning
(1, 7),  -- TV
(1, 8),  -- Kitchen
-- Property 2: Luxury Beachfront Villa Da Nang
(2, 1),  -- Wifi
(2, 6),  -- Air Conditioning
(2, 14), -- Pool
(2, 13), -- Smoke Alarm
(2, 2),  -- Washer
(2, 15), -- Dryer
-- Property 3: Traditional House in Old Quarter
(3, 1),  -- Wifi
(3, 7),  -- TV
(3, 3),  -- Heating
-- Property 4: Landmark 81 Luxury Apartment
(4, 1),  -- Wifi
(4, 6),  -- Air Conditioning
(4, 7),  -- TV
(4, 10), -- Free parking
(4, 9),  -- Gym
(4, 14), -- Pool
-- Property 5: Mai Chau Countryside Homestay
(5, 1),  -- Wifi
(5, 7),  -- TV
-- Property 6: Apartment near Tan Son Nhat Airport
(6, 1),  -- Wifi
(6, 6),  -- Air Conditioning
(6, 7),  -- TV
(6, 8),  -- Kitchen
-- Property 7: Mountain View Cabin Sapa
(7, 1),  -- Wifi
(7, 3),  -- Heating
-- Property 8: Riverside Bungalow Hoi An
(8, 1),  -- Wifi
(8, 7),  -- TV
(8, 10), -- Free parking
-- Property 9: City Loft Apartment Saigon
(9, 1),  -- Wifi
(9, 6),  -- Air Conditioning
(9, 7),  -- TV
(9, 8),  -- Kitchen
(9, 15), -- Dedicated workspace
-- Property 10: Family Garden House Da Lat
(10, 1), -- Wifi
(10, 7), -- TV
(10, 8), -- Kitchen
(10, 10), -- Free parking
(10, 2), -- Washer
-- Property 11: Eco Bamboo Hut Phong Nha
(11, 1), -- Wifi
-- Property 12: Seaside Apartment Nha Trang
(12, 1), -- Wifi
(12, 6), -- Air Conditioning
(12, 7), -- TV
(12, 8); -- Kitchen

-- ============= Calendars =============
INSERT INTO Calendars (PropertyID, Date, Price, Available) VALUES
(1, '2025-10-01', 39.00, 1),
(1, '2025-10-02', 39.00, 1),
(2, '2025-10-01', 150.00, 1),
(3, '2025-10-01', 52.00, 0),  -- Booked
(3, '2025-10-02', 52.00, 0),  -- Booked
(6, '2025-10-05', 40.00, 0),  -- Booked
(6, '2025-10-06', 40.00, 0),  -- Booked
(6, '2025-10-07', 40.00, 0);  -- Booked

-- ============= Bookings =============
INSERT INTO Bookings (PropertyID, UserID, HostID, CheckIn, CheckOut, Nights, GuestsCount, BasePrice, CleaningFee, ServiceFee, TotalPrice, Status) VALUES
(3, 2, 1, '2025-10-01', '2025-10-03', 2, 2, 104.00, 3.00, 10.00, 117.00, 'confirmed'),  -- Traditional House
(6, 4, 1, '2025-10-05', '2025-10-08', 3, 2, 120.00, 3.00, 6.00, 129.00, 'pending');  -- Apartment near Airport

-- ============= Transactions =============
INSERT INTO Transactions (BookingID, Amount, Currency, PaymentMethod, PaymentStatus) VALUES
(1, 117.00, 'USD', 'Credit Card', 'Paid'),  -- Booking 1: Traditional House
(2, 129.00, 'USD', 'PayPal', 'Pending');   -- Booking 2: Apartment near Airport

-- ============= Reviews =============
INSERT INTO Reviews (PropertyID, BookingID, UserID, Rating, Comments) VALUES
(1, 1, 2, 5, N'Great location, very clean, would stay again!'),
(3, 1, 2, 4, N'Beautiful traditional house, amazing experience!');


-- ============= HostVerifications =============
INSERT INTO HostVerifications (HostID, VerificationTypeID, VerifiedAt, Details) VALUES
(2, 1, '2019-05-02', N'Email verified'),
(2, 2, '2019-05-02', N'Phone verified'),
(1, 3, '2020-03-11', N'Government ID verified');

-- ============= PropertyPhotos =============
-- Note: PropertyID starts from 1 (first property inserted)
-- Each property has 5 photos: Overviews, Livingroom, Bedroom, Kitchen, Bathroom
INSERT INTO PropertyPhotos (PropertyID, Url, Caption, SortIndex) VALUES
-- Property 1: Cozy Studio in District 1
(1, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/638610311.jpg?k=454cd773ebf14f20b30c13aabfa128d18a514182c377751d9c36b6a38f754401&o=', N'Overviews', 1),
(1, N'https://cf.bstatic.com/xdata/images/hotel/max500/617539421.jpg?k=cac87c61bf48bab099b5a50b501d56fed74d7917697eb635ac031039d9c30ead&o=', N'Livingroom', 2),
(1, N'https://cf.bstatic.com/xdata/images/hotel/max300/676850106.jpg?k=791fd2840adc7e7216c6217671a801898bfbc0d3163b5fae079793af568731f2&o=', N'Bedroom', 3),
(1, N'https://cf.bstatic.com/xdata/images/hotel/max500/676850077.jpg?k=d42b9b1f3fd0210a4aa4d142327ca231c7f05b748ba9bc6238237be12bfa78c3&o=', N'Kitchen', 4),
(1, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/545875245.jpg?k=e71ee132d5b77a3cb8f15550826bf378533aa285324d5b8994d813fa2306416e&o=', N'Bathroom', 5),

-- Property 2: Luxury Beachfront Villa Da Nang
(2, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/176766497.jpg?k=52caf669aa17a2f9ad22b579c795d732e43db13eb99079b200b0f863b99325c0&o=', N'Overviews', 1),
(2, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/176766653.jpg?k=0e9f7bfe96aab3c10971cbf97543225db88f18fbc1c688dbb1af4dd3c8529f4f&o=', N'Livingroom', 2),
(2, N'https://cf.bstatic.com/xdata/images/hotel/max500/176766732.jpg?k=d1891a9eb361adf80028d0fb2a53f1b7e938fc64ac5f07f6f34c21ef67a0642d&o=', N'Bedroom', 3),
(2, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/176766667.jpg?k=b1829d57d4653534056e98e27e8ac7a7f95e2c6ac6c824b3ec712f7000736e08&o=', N'Kitchen', 4),
(2, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/176766550.jpg?k=19bdb5974ad207aec179ccc86194ad1d77b8a26459034c2956a2680b020a451b&o=', N'Bathroom', 5),

-- Property 3: Traditional House in Old Quarter
(3, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/686026402.jpg?k=05c50f3bb91e2e4bbd8f29c91068bc5a1b5ea1afc3b88bd40818e303c6edb6ad&o=', N'Overviews', 1),
(3, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/686026402.jpg?k=05c50f3bb91e2e4bbd8f29c91068bc5a1b5ea1afc3b88bd40818e303c6edb6ad&o=', N'Livingroom', 2),
(3, N'https://cf.bstatic.com/xdata/images/hotel/max500/686026414.jpg?k=ea5bedef124792a0e3db0a998ffb6762f9ed7310b7d8f47d187e17f5f9ef0909&o=', N'Bedroom', 3),
(3, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/686026337.jpg?k=33915dbdab695fd9202d8c3fc922aacc2f0974004496734cb3b0ea573888fb16&o=', N'Kitchen', 4),
(3, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/686026345.jpg?k=230ce26a8998891ad47309d220eab4dfcfa19f356916d6cbca664d746fc062d9&o=', N'Bathroom', 5),

-- Property 4: Landmark 81 Luxury Apartment
(4, N'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/584941835.jpg?k=1cd956ab9d3df6c4e35921e615f29b56c2e499ae3dd11f1c90966939b1e18fba&o=&s=1024x', N'Overviews', 1),
(4, N'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/584941823.jpg?k=ba01fab85c3fa50021d74f9802c9142de3d0356b5f8fad3c30753e14f6cf04e4&o=&s=1024x', N'Livingroom', 2),
(4, N'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/364920931.jpg?k=28773c17c3ff6768f46f12ab5593579d5028095f10e9e2a34725aa3c30c1dad6&o=&s=1024x', N'Bedroom', 3),
(4, N'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/364920914.jpg?k=9041eb77f6b2f0483241b8638bd7d58d4495fc5f69c4f82788a22fa10a694ef2&o=&s=1024x', N'Kitchen', 4),
(4, N'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/364920888.jpg?k=7c9298bb805f9a4af740f9aa60ef2c2b91814349157158855875b953fcf3cdab&o=&s=1024x', N'Bathroom', 5),

-- Property 5: Mai Chau Countryside Homestay
(5, N'https://cf.bstatic.com/xdata/images/hotel/max300/173543554.jpg?k=5e2799757b575e230ba79e1452adbc2ff8ab2473099b47dba69f0eae20f30e2a&o=', N'Overviews', 1),
(5, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/376761521.jpg?k=2b2116623b7e7505c210e705461ccdcaabeaf3467f30ef628f3d456339ebdb8d&o=', N'Livingroom', 2),
(5, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/376761048.jpg?k=7e069b19c5ba043f1e86ba488d2955b518740af4a3c900444f80ad1f3ed4d6bb&o=', N'Bedroom', 3),
(5, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/166701744.jpg?k=e666b953397e269addb1cc360e733d3212b6e20a992fa75530ba446ddfa57e18&o=', N'Kitchen', 4),
(5, N'https://cf.bstatic.com/xdata/images/hotel/max300/376761204.jpg?k=1ba2caa42b2508a4d1cf70a876e8a0b7328c9bd61b907de9fff9785e03ab82f6&o=', N'Bathroom', 5),

-- Property 6: Apartment near Tan Son Nhat Airport
(6, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/550261802.jpg?k=66ecd3501e322b9381d732d9d08ce343e1f202e531b29c8f041ee35833156221&o=', N'Overviews', 1),
(6, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/550261545.jpg?k=c06151df812d17b0c6f9308e4f6714e0d7cafa993c76999b11bc3738d0e3b637&o=', N'Livingroom', 2),
(6, N'https://cf.bstatic.com/xdata/images/hotel/max500/550261867.jpg?k=ede849016f1a1838a1b78c2c6b2c632a993015dcdce4ad371548da42d92ce18a&o=', N'Bedroom', 3),
(6, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/550261819.jpg?k=d88f2df8d95fd6c41dcc30bc4e274e63a7814d35365fca74af3139b88b449380&o=', N'Gym', 4),
(6, N'https://cf.bstatic.com/xdata/images/hotel/max500/550261743.jpg?k=6dff9a9e4e844a54d41c33d8207a06650e5f5084acf94f0956a26fa2b7d52b4b&o=', N'Bathroom', 5),

-- Property 7: Mountain View Cabin Sapa
(7, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/226356546.jpg?k=01c82f9d0b39c829588135208247f87f6316c9b090e5c643f00d71d054d5a77c&o=', N'Overviews', 1),
(7, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/226353964.jpg?k=a38c93a3994b51600065df7163458df0dbe55672a51ab5823ac149fcc44e6e94&o=', N'Livingroom', 2),
(7, N'https://cf.bstatic.com/xdata/images/hotel/max500/226426517.jpg?k=064afa16317659e7c4946a7cf8a64b97643219b45acec4b018441e7084a0b685&o=', N'Bedroom', 3),
(7, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/226356002.jpg?k=994c5b6fdbd615aab180668441a370b4b137cb450e5e8f3c98f422428d1fa8db&o=', N'Kitchen', 4),
(7, N'https://cf.bstatic.com/xdata/images/hotel/max500/226342767.jpg?k=b3f2f8f0aee8515a97f880b30d8db53f63ec1552e7dedbdd162125807d50b698&o=', N'Bathroom', 5),

-- Property 8: Riverside Bungalow Hoi An
(8, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/427243014.jpg?k=010f7e962702d3f39572e40c55733c6440f31cd1b8745383989e622a22e53247&o=', N'Overviews', 1),
(8, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/296146098.jpg?k=f78df3b5e7bea8aa070b241a415c282366e50e8de4facab3a0b2a5c138532075&o=', N'Swimming pool', 2),
(8, N'https://cf.bstatic.com/xdata/images/hotel/max300/295729630.jpg?k=9624736a5cf1ec8ff8a98634401e317685f581b43d946e4b15ced5f90b4d755f&o=', N'Bedroom', 3),
(8, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/295729119.jpg?k=5c64b40d70f60aeb0f9efebaf20676f0cf3706a502b264cae1dddc49dd68d4b7&o=', N'Balcony', 4),
(8, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/295729632.jpg?k=6592467b9ef7833ef3f9dfaf429cc82131dadf33eef41d6de758376ea3ffb464&o=', N'Bathroom', 5),

-- Property 9: City Loft Apartment Saigon
(9, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/431158386.jpg?k=16b4b8a3521d8fa399b2242056346d1001500cbcabbbce630882b738e2849c2c&o=', N'Overviews', 1),
(9, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/513879062.jpg?k=3538bf27248063e6d5caaf689f393a1b9bf683fe2ab71f2ea61e002d3e856bae&o=', N'Livingroom', 2),
(9, N'https://cf.bstatic.com/xdata/images/hotel/max500/431158252.jpg?k=5bd5d12c88ee981bbc0962bdbd8a7ee117097542fca9f92c2a8c1a1e3952e869&o=', N'Bedroom', 3),
(9, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542185170.jpg?k=24ad893aa48f46a2b45128067d66a0b852d43bf33656ec1a9c2a2319ac6ff803&o=', N'Kitchen', 4),
(9, N'https://cf.bstatic.com/xdata/images/hotel/max300/431158429.jpg?k=3ef9200900b2ccb46fa39d01e05b0e8b3e830270be785afd90635f0cb3df2e67&o=', N'Bathroom', 5),

-- Property 10: Family Garden House Da Lat
(10, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/358852760.jpg?k=c837b018199246a73fa39d71281f4fea300baec9bc65540bf4e3965551c977d5&o=', N'Overviews', 1),
(10, N'https://cf.bstatic.com/xdata/images/hotel/max500/564202857.jpg?k=87a35941d1ad5e9c9b94a9e05ef93367e811f331e6fb5594cf1c8f6118e49832&o=', N'Livingroom', 2),
(10, N'https://cf.bstatic.com/xdata/images/hotel/max500/564206049.jpg?k=dad019cf4425a93c5d77f73d8ccd6d80dca960bc97809b64cf9a80f143b011b2&o=', N'Bedroom', 3),
(10, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/358831635.jpg?k=df7643dde85fc84590a4fd757c2332e73496020344238992ba2fa481dce004c7&o=', N'Kitchen', 4),
(10, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/416014785.jpg?k=d188887e7e76340176bc1659ed9ad2fad1013cdd3b48d4836aac30e388e21702&o=', N'Bathroom', 5),

-- Property 11: Eco Bamboo Hut Phong Nha
(11, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542495092.jpg?k=38de732308bd22cee87e5528cd60c4748dab30c5a6f35a26a0c1e85d0637a721&o=', N'Overviews', 1),
(11, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542495100.jpg?k=d2e5cd97afab2ef7b51190e647eeeed1f5af13a54c406ef4ce1d64c2a459a6f1&o=', N'Livingroom', 2),
(11, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542494973.jpg?k=a97e692f5269caee6b0cef121173c3056d932329d0614902ca46d61b06e48bc1&o=', N'Bedroom', 3),
(11, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542494964.jpg?k=14b3d42fdabdcafa1e3ff5c27619c54668581a6f8f9a8dd56ed5d510208bb882&o=', N'View', 4),
(11, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/542495115.jpg?k=0944b633406912eb867c0c84690df912b349e837a971457ab79e4463655b356f&o=', N'Bathroom', 5),

-- Property 12: Seaside Apartment Nha Trang
(12, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/112981228.jpg?k=129e96db7375ed6676d30de691db76ba61a952f26800fd995c3c37b704b1baf9&o=', N'Overviews', 1),
(12, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/112982459.jpg?k=2ade1f712ca233c2dd5bceca0d21773529b053e0ccc18b90763532ab72e15879&o=', N'Livingroom', 2),
(12, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/112992241.jpg?k=7d144ac5752b840e2b92e69919dd50fcc019492475a07cb332d4ec9ce80389ba&o=', N'Bedroom', 3),
(12, N'https://cf.bstatic.com/xdata/images/hotel/max500/516691153.jpg?k=6688fad6b09737549427d6235378e14f472d305456a553176c684ef877c1f9dd&o=', N'Kitchen', 4),
(12, N'https://cf.bstatic.com/xdata/images/hotel/max1024x768/112981448.jpg?k=64e36e60c4075b12201345cb02a516f1043f1a39880087860ef85749aee549be&o=', N'Bathroom', 5);


-- ============= SavedListings =============
INSERT INTO SavedListings (UserID, PropertyID) VALUES
(2, 3),  -- User 2 saved Traditional House
(4, 6);  -- User 4 saved Apartment near Airport

-- ============= Messages =============
INSERT INTO Messages (FromUserID, ToUserID, BookingID, PropertyID, Content) VALUES
(2, 1, 1, 3, N'Hi, is early check-in possible?'),
(1, 2, 1, 3, N'Yes, you can check in at 12pm.');

-- Tours
INSERT INTO Tours (HostID, TourName, Description, Location, CityID, CountryID, DurationDays, MaxGuests, Price, StartDate, EndDate)
VALUES
(1, N'Explore Old Quarter of Hanoi', N'Walking tour through historical streets and local food stalls.', N'Hoan Kiem, Hanoi', 1, 1, 1, 10, 25.00, '2025-11-10', '2025-11-10'),
(2, N'Marina Bay Night Adventure', N'Enjoy Singapore at night with a guided boat and city tour.', N'Marina Bay, Singapore', 6, 2, 1, 15, 40.00, '2025-12-05', '2025-12-05');

-- Participants
INSERT INTO TourParticipants (TourID, UserID, Status) VALUES
(1, 2, 'confirmed'),
(1, 3, 'pending'),
(2, 4, 'confirmed');

-- Photos
INSERT INTO TourPhotos (TourID, Url, Caption, SortIndex) VALUES
(1, N'https://example.com/tour_hanoi.jpg', N'Hoan Kiem Lake', 1),
(2, N'https://example.com/tour_sg.jpg', N'Marina Bay skyline at night', 1);

-- Reviews
INSERT INTO TourReviews (TourID, UserID, Rating, Comment)
VALUES
(1, 2, 5, N'Excellent guide, great local experience!'),
(2, 4, 4, N'Beautiful views but quite crowded.');


USE UITour
GO

UPDATE Users
SET PasswordHash = '$2a$11$bBxOFtJcS1zh3XepYVhIqun.gZWxxmcxjx/BYFOdJ2loNPTTkT7FO'
WHERE UserID = 1


UPDATE Users
SET PasswordHash = '$2a$11$bBxOFtJcS1zh3XepYVhIqun.gZWxxmcxjx/BYFOdJ2loNPTTkT7FO'
WHERE UserID = 2


UPDATE Users
SET PasswordHash = '$2a$11$bBxOFtJcS1zh3XepYVhIqun.gZWxxmcxjx/BYFOdJ2loNPTTkT7FO'
WHERE UserID = 3


UPDATE Users
SET PasswordHash = '$2a$11$bBxOFtJcS1zh3XepYVhIqun.gZWxxmcxjx/BYFOdJ2loNPTTkT7FO'
WHERE UserID = 4

ALTER TABLE Users
ADD UserAbout NVARCHAR(MAX)

ALTER TABLE Users
ADD Role NVARCHAR(20)

ALTER TABLE Users
ADD Age int

ALTER TABLE Users
ADD Gender NVARCHAR(20)

ALTER TABLE Users
ADD Nationality NVARCHAR(100)

ALTER TABLE Users
ADD Interests NVARCHAR(MAX)

-- Cập nhật cho Người dùng 1: Trần Anh Hào
UPDATE Users
SET
    UserAbout = N'Là một người hướng ngoại, thích du lịch và khám phá những địa điểm mới lạ.',
    Role = N'Host', -- Gán Role là Host
    Age = 25,
    Gender = N'Nam',
    Nationality = N'Việt Nam',
    Interests = N'Thể thao, Du lịch, Công nghệ'
WHERE
    UserId = 1;

-- Cập nhật cho Người dùng 2: Hoàng Văn Tài
UPDATE Users
SET
    UserAbout = N'Yêu thích văn hóa Nhật Bản và thường xuyên đọc sách lịch sử.',
    Role = N'Guest', -- Gán Role là Guest
    Age = 28,
    Gender = N'Nam',
    Nationality = N'Việt Nam',
    Interests = N'Sách, Lịch sử, Ẩm thực, Phim ảnh'
WHERE
    UserId = 2;

-- Cập nhật cho Người dùng 3: Lê Phước Ngọc Tân
UPDATE Users
SET
    UserAbout = N'Thích cà phê, mua sắm và nghiên cứu lịch sử.',
    Role = N'Guest', -- Gán Role là Guest
    Age = 23,
    Gender = N'Nam',
    Nationality = N'Việt Nam',
    Interests = N'Cà phê, Mua sắm, Nấu ăn, Thể thao trực tiếp, Lịch sử, Nhạc sống, Phim ảnh, Đọc'
WHERE
    UserId = 3;

-- Cập nhật cho Người dùng 4: Vũ Khả Đình Minh
UPDATE Users
SET
    UserAbout = N'Là một người sáng tạo, đam mê thiết kế đồ họa và nhiếp ảnh.',
    Role = N'Admin', -- Gán Role là Admin
    Age = 22,
    Gender = N'Nữ',
    Nationality = N'Việt Nam',
    Interests = N'Thiết kế, Nhiếp ảnh, Âm nhạc, Thời trang'
WHERE
    UserId = 4;

UPDATE TourPhotos
SET Url = 'https://vietnam.travel/sites/default/files/inline-images/visit%20old%20quarter%20Hanoi-8.jpg'
WHERE PhotoID = 1;

UPDATE TourPhotos
SET Url = 'https://dth.travel/wp-content/uploads/2023/10/Merlion-Park-Singapore_joshua-ang-Gf_KqXHU-PY-unsplash-scaled.jpg'
WHERE PhotoID = 2;

-- Thêm 3 ảnh cho TourID = 1
INSERT INTO TourPhotos (TourID, Url, Caption, SortIndex)
VALUES 
(1, 'https://localvietnam.com/wp-content/uploads/2021/04/hoan-kiem-lake-5.jpg', 'Hoan Kiem Lake - Evening', 2),
(1, 'https://vietnam.travel/sites/default/files/inline-images/visit%20old%20quarter%20Hanoi-12.jpg', 'Old Quarter Street', 3),
(1, 'https://vietnamdiscovery.com/wp-content/uploads/2019/09/Temple-of-literature-Hanoi.jpg', 'Temple of Literature', 4);

-- Thêm 3 ảnh cho TourID = 2
INSERT INTO TourPhotos (TourID, Url, Caption, SortIndex)
VALUES 
(2, 'https://images.unsplash.com/photo-1621453728762-5a95731038d5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE3fHx8ZW58MHx8fHx8', 'Marina Bay - Daytime', 2),
(2, 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg', 'Gardens by the Bay', 3),
(2, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/8a/d6/f7/the-only-beachfront-resort.jpg?w=1200&h=-1&s=1', 'Sentosa Island', 4);


/* ========== 10 Tours ========== */
INSERT INTO Tours (HostID, TourName, Description, Location, CityID, CountryID, DurationDays, MaxGuests, Price, Currency, StartDate, EndDate, CancellationID)
VALUES
(1, N'Explore Old Quarter Street Food', N'Guided walking tour tasting Hanoi''s best street food.', N'Hoan Kiem, Hanoi', 1, 1, 1, 12, 25.00, 'USD', '2025-11-20', '2025-11-20', 1),
(1, N'Cu Chi Tunnels Half-Day', N'Historical tunnel network tour with local guide.', N'Cu Chi District, HCMC', 2, 1, 1, 20, 35.00, 'USD', '2025-11-21', '2025-11-21', 2),
(2, N'Danang Sunrise Yoga & Brunch', N'Yoga at My Khe beach followed by healthy brunch.', N'My Khe Beach, Da Nang', 3, 1, 1, 14, 28.00, 'USD', '2025-11-22', '2025-11-22', 1),
(2, N'Ha Long Bay Sunset Kayak', N'Kayak among limestone karsts at golden hour.', N'Ha Long Bay, Quang Ninh', 9, 1, 1, 10, 49.00, 'USD', '2025-11-23', '2025-11-23', 1),
(1, N'Can Tho Floating Market Dawn Trip', N'Boat ride to experience Cai Rang floating market.', N'Can Tho River', 6, 1, 1, 16, 32.00, 'USD', '2025-11-24', '2025-11-24', 1),
(1, N'Nha Trang Snorkeling Adventure', N'Coral reef snorkeling with local guide and gear.', N'Tran Phu, Nha Trang', 9, 1, 1, 12, 45.00, 'USD', '2025-11-25', '2025-11-25', 2),
(2, N'Sapa Mountain Trek & Village Visit', N'Scenic trek and meet local communities.', N'Cat Cat, Sapa', 5, 1, 2, 10, 60.00, 'USD', '2025-11-26', '2025-11-27', 3),
(2, N'Hue Imperial Citadel Walk', N'UNESCO citadel and royal history walking tour.', N'Hue Imperial City', 3, 1, 1, 20, 22.00, 'USD', '2025-11-28', '2025-11-28', 1),
(2, N'Marina Bay Night Adventure', N'Boat + city lights walk around Marina Bay.', N'Marina Bay, Singapore', 6, 2, 1, 15, 40.00, 'USD', '2025-12-05', '2025-12-05', 1),
(1, N'Bangkok Street Markets & Temples', N'Evening markets and temple photo walk.', N'Bangkok Old Town', 11, 3, 1, 18, 38.00, 'USD', '2025-12-08', '2025-12-08', 2);

INSERT INTO TourPhotos (TourID, Url, Caption, SortIndex)
VALUES
-- TourID 3: Cu Chi Tunnels Half-Day
(3, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/2a/05/1c/photo8jpg.jpg?w=700&h=400&s=1', 'Cu Chi Tunnels Entrance', 1),
(3, 'https://media-cdn.tripadvisor.com/media/photo-s/0a/78/2b/b2/inside-of-tunnel.jpg', 'Underground Tunnel System', 2),
(3, 'https://images.pond5.com/cu-chi-tunnel-historic-famous-footage-276912244_iconl.jpeg', 'Soldier Demonstration Area', 3),
(3, 'https://etrip4utravel.s3-ap-southeast-1.amazonaws.com/images/tinymce/2024/12/eb209d26-4846-4867-8b82-c5e4b7715495.jpg', 'Historical Exhibits', 4),

-- TourID 4: Danang Sunrise Yoga & Brunch
(4, 'https://daydreamingtravels.com/wp-content/uploads/2022/08/DSC00392-1.jpg', 'Sunrise at My Khe Beach', 1),
(4, 'https://mettavoyage.com/wp-content/uploads/2020/09/yoga-in-da-nang-vietnam.jpg', 'Morning Yoga Session', 2),
(4, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/13/ed/38/caption.jpg?w=900&h=500&s=1', 'Healthy Beach Brunch', 3),
(4, 'https://cms.junglebosstours.com/assets/c9915f98-4fcf-4792-b588-e69d24eec248?format=webp', 'Coastal Relaxation View', 4),

-- TourID 5: Ha Long Bay Sunset Kayak
(5, 'https://www.orientalsails.com/wp-content/uploads/2017/11/4-beautiful-sunset-on-halong-bay.jpg', 'Ha Long Bay at Sunset', 1),
(5, 'https://static.vinwonders.com/production/kayaking-in-ha-long-bay-2.jpg', 'Kayaking Between Limestone Cliffs', 2),
(5, 'https://evivatour.com/wp-content/uploads/2022/11/Ti-Top-Island.jpg', 'Panoramic Bay View', 3),
(5, 'https://statics.vinpearl.com/Halong-Bay-overnight-cruises-01_1690268584.jpg', 'Evening Cruise Experience', 4),

-- TourID 6: Can Tho Floating Market Dawn Trip
(6, 'https://scontent.iocvnpt.com/resources/portal/Images/CTO/superadminportal.cto/DiaDiem/chonoicairang/chonoicairang11_637026961011274519.jpg', 'Cai Rang Floating Market', 1),
(6, 'https://img.freepik.com/free-photo/beautiful-shot-mekong-river-with-boats-foreground-sunset-pak-beng-laos_181624-26468.jpg?semt=ais_hybrid&w=740&q=80', 'Sunrise on Mekong River', 2),
(6, 'https://d1bv4heaa2n05k.cloudfront.net/user-images/1450357501267/shutterstock-166719098_main_1450357512762.jpeg', 'Local Boat Vendors', 3),
(6, 'https://sundaygo.vn/wp-content/uploads/2024/10/enjoy-fresh-pineapple-in-cai-rang-floating-market.jpg', 'Tropical Fruits on Boats', 4),

-- TourID 7: Nha Trang Snorkeling Adventure
(7, 'https://media.istockphoto.com/id/160055441/photo/snorkeling-in-clear-blue-water-of-tropical-island-okinawa-japan.jpg?s=612x612&w=0&k=20&c=T_Sn8kPUCMZ58zc96Sx8fAUDFghbtoUl20QJhbP5vwc=', 'Snorkeling in Clear Blue Water', 1),
(7, 'https://www.nhatrangtouring.com/wp-content/uploads/2019/05/watch-colorful-coral-world.jpg', 'Colorful Coral Reef', 2),
(7, 'https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1200,h_630/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/o7kk2rjkckzhn3znkpwh/Nha%20Trang%20Island%20Hopping%20Speedboat%20Tour%20with%20Sea%20Walking.jpg', 'Island Boat Tour', 3),
(7, 'https://news.baokhanhhoa.vn/file/e7837c02857c8ca30185a8c39b582c03/dataimages/201605/original/images1142266_7.JPG', 'Relaxing on Nha Trang Beach', 4),

-- TourID 8: Sapa Mountain Trek & Village Visit
(8, 'https://image.vietgoing.com/hotel/03/04/large/vietgoing_ptc2211269309.webp', 'Sapa Mountain View', 1),
(8, 'https://daytoursapa.com/wp-content/uploads/rice-terrace-sapa-3.jpg', 'Rice Terraces in Sapa', 2),
(8, 'https://cdn.tripspoint.com/uploads/photos/15309/sapa-trekking-rice-terraces-ethnic-villages-3-day-from-hanoi_X4Hpy.jpg', 'Ethnic Village Walk', 3),
(8, 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/13/e7/a9/d0.jpg', 'Mountain Trekking Path', 4),

-- TourID 9: Hue Imperial Citadel Walk
(9, 'https://ahoyvietnam.com/wp-content/uploads/2025/09/Hue-Imperial-City-Meridian-Gate-AhoyVietnam-scaled.webp', 'Imperial City Entrance', 1),
(9, 'https://www.huesmiletravel.com/wp-content/uploads/2025/04/can-chanh-palace-2-1.png', 'Palace Courtyard', 2),
(9, 'https://images.travelandleisureasia.com/wp-content/uploads/sites/3/2025/10/29183122/Vietnam-13-1600x900.jpg', 'Ancient Temple Architecture', 3),
(9, 'https://www.asiakingtravel.com/cuploads/files/hoang%20thanh.jpg', 'Historic Citadel Walls', 4),

-- TourID 10: Marina Bay Night Adventure
(10, 'https://www.marinabaysands.com/content/dam/marinabaysands/attractions/spectra/spectra-thestoryresized-1920x1080.png', 'Marina Bay Sands Light Show', 1),
(10, 'https://freedomdestinations.co.uk/wp-content/uploads/Image-1-Helix-Bridge-Singapore.jpg', 'Night View of Marina Bay', 2),
(10, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Singapore_Singapore_Flyer_viewed_from_Marina_Bay_Sands_bei_Nacht_3.jpg/2560px-Singapore_Singapore_Flyer_viewed_from_Marina_Bay_Sands_bei_Nacht_3.jpg', 'Singapore Flyer by Night', 3),
(10, 'https://www.explorebees.com/uploads/Helix%20Bridge%20(1).jpg', 'Helix Bridge Illumination', 4),

-- TourID 11: Bangkok Street Markets & Temples
(11, 'https://sethlui.com/wp-content/uploads/2015/09/bangkok-rod-fai-market-0900.jpg', 'Bangkok Street Market', 1),
(11, 'https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/220/2023/03/24041115/Wat-Pho-2.jpeg', 'Wat Pho Temple', 2),
(11, 'https://offbeatescapades.com/wp-content/uploads/2021/03/Wat-Arun-at-Sunset-Wat-Arun-at-Night-Offbeat-Escapades-1024x682.jpg', 'Wat Arun at Sunset', 3),
(11, 'https://asianinspirations.com.au/wp-content/uploads/2022/08/Asian-Late-Night-Food-Culture_00-Feat-Img.jpg', 'Night Street Food Scene', 4),

 -- TourID 12: Phu Quoc Island Escape

(12, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/11/27/32/hotel-exterior.jpg?w=900&h=500&s=1', 'Long Beach, Phu Quoc', 1),
(12, 'https://honthom.sunworld.vn/wp-content/uploads/2018/04/Anh-bia-2.jpg', 'Hon Thom Cable Car', 2),
(12, 'https://media01.stockfood.com/largepreviews/MjIxMDgwMjA3Ng==/71316196-Sunset-on-the-beach-on-the-west-coast-of-California-with-waves-USA.jpg', 'Sunset on the West Coast', 3),
(12, 'https://statics.vinpearl.com/phu-quoc-snorkeling-01_1692678258.jpg', 'Snorkeling in Clear Waters', 4);


CREATE TABLE ExperienceDetails (
    DetailID INT IDENTITY(1,1) PRIMARY KEY, -- ID tự tăng
    TourID INT NOT NULL FOREIGN KEY REFERENCES Tours(TourID), -- liên kết với Tour
    ImageUrl NVARCHAR(MAX), -- đường dẫn ảnh
    Title NVARCHAR(300) NOT NULL, -- tiêu đề trải nghiệm
    Description NVARCHAR(MAX), -- mô tả chi tiết
    SortIndex INT DEFAULT 0 -- thứ tự hiển thị nếu cần
);

-- TourID = 1: Explore Old Quarter of Hanoi
INSERT INTO ExperienceDetails (TourID, ImageUrl, Title, Description, SortIndex)
VALUES 
(1, 'https://sawasdee.thaiairways.com/wp-content/uploads/2023/04/shutterstock_1865107804-1160x775.jpg', 'Tunnel Experience', 'Crawl inside preserved underground pathways.', 1),
(1, 'https://c8.alamy.com/comp/2RH6AHY/cu-chi-vietnam-21st-aug-2014-the-cu-chi-tunnels-are-an-immense-network-of-underground-tunnels-used-by-viet-cong-soldiers-during-the-vietnam-war-2RH6AHY.jpg', 'War Artifacts', 'Original traps and handmade tools from soldiers.', 2),
(1, 'https://img.freepik.com/premium-photo/vietnam-war-soldier-menu-peanuts-cane-sugar-today-it-is-served-tourists-cu-chi-tunnel-vietnam_479694-10438.jpg?w=996', 'Soldier Snacks', 'Try cassava with peanuts — meal from wartime era.', 3);

-- TourID = 2: Marina Bay Night Adventure
INSERT INTO ExperienceDetails (TourID, ImageUrl, Title, Description, SortIndex)
VALUES 
(2, 'https://manage.fanshuyou.com/files/places/828/marina-bay-sands-sampan-rides-828-Iye8c.jpg', 'Boat Ride', 'Cruise through Marina Bay under city lights.', 1),
(2, 'https://www.gardensbythebay.com.sg/content/dam/gbb-2021/image/things-to-do/attractions/supertree-grove/main/supertree-grove-main.jpg', 'Supertree Grove', 'Walk beneath glowing vertical gardens.', 2),
(2, 'https://cdn.getyourguide.com/img/location/5ffebd9d3f4e4.jpeg/88.jpg', 'Skyline View', 'Capture panoramic views from Marina Barrage.', 3);

-- TourID = 3: Explore Old Quarter Street Food
INSERT INTO ExperienceDetails (TourID, ImageUrl, Title, Description, SortIndex)
VALUES 
(3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCLKIhobKp9QHNneRAsgRSQvTHbVtHN7R_Aw&s', 'Pho Tasting', 'Try authentic Hanoi-style beef noodle soup.', 1),
(3, 'https://static.vinwonders.com/production/banh-mi-ha-noi-1.jpg', 'Banh Mi Stop', 'Sample crispy Vietnamese baguette with fillings.', 2),
(3, 'https://ricelifefoodie.com/wp-content/uploads/2024/02/vietnamese-egg-coffee-with-layer-of-egg-cream.jpg', 'Egg Coffee', 'Sip Hanoi’s famous creamy egg coffee.', 3);


INSERT INTO ExperienceDetails (TourID, ImageUrl, Title, Description, SortIndex)
VALUES 
(4, 'https://sawasdee.thaiairways.com/wp-content/uploads/2023/04/shutterstock_1865107804-1160x775.jpg', 'Tunnel Experience', 'Crawl inside preserved underground pathways.', 1),
(4, 'https://c8.alamy.com/comp/2RH6AHY/cu-chi-vietnam-21st-aug-2014-the-cu-chi-tunnels-are-an-immense-network-of-underground-tunnels-used-by-viet-cong-soldiers-during-the-vietnam-war-2RH6AHY.jpg', 'War Artifacts', 'Original traps and handmade tools from soldiers.', 2),
(4, 'https://img.freepik.com/premium-photo/vietnam-war-soldier-menu-peanuts-cane-sugar-today-it-is-served-tourists-cu-chi-tunnel-vietnam_479694-10438.jpg?w=996', 'Soldier Snacks', 'Try cassava with peanuts — meal from wartime era.', 3);

ALTER TABLE SavedListings
ADD ListID VARCHAR(50);

CREATE TABLE FavoriteList (
  ListID VARCHAR(50) PRIMARY KEY,     
  UserID INT,                         
  Title VARCHAR(255),                
  CoverImage VARCHAR(255),           
  ItemsCount INT                     
);

INSERT INTO FavoriteList (ListID, UserID, Title, CoverImage, ItemsCount)
VALUES 
('default', 2, 'Danh sách yêu thích', '/images/id1_img01.png', 2),
('luxury', 4, 'Căn hộ cao cấp', '/images/id1_img01.png', 1),
('travel', 3, 'Du lịch Đà Lạt', '/images/id1_img01.png', 1),
('investment', 1, 'Đầu tư dài hạn', '/images/id1_img01.png', 1),
('shortstay', 5, 'Ở ngắn hạn', '/images/id1_img01.png', 1);

INSERT INTO SavedListings (UserID, PropertyID, SavedAt, ListID)
VALUES 
(2, 5, '2025-11-16 08:00:00.000', 'default'),
(3, 2, '2025-11-16 09:30:00.000', 'travel'),
(1, 1, '2025-11-16 10:15:00.000', 'investment');

INSERT INTO FavoriteList (ListID, UserID, Title, CoverImage, ItemsCount)
VALUES ('defau2t', 2, N'Danh sách yêu thích', '/images/id1_img01.png', 2);

INSERT INTO FavoriteList (ListID, UserID, Title, CoverImage, ItemsCount)
VALUES ('delt', 6, N'Danh sách yêu thích', '/images/id1_img01.png', 2);

-- Add SavedListing for User 2, Property 5
INSERT INTO SavedListings (UserID, PropertyID, SavedAt, ListID)
VALUES (2,6, GETDATE(), 'defau2t');

INSERT INTO SavedListings (UserID, PropertyID, SavedAt, ListID)
VALUES (6,6, GETDATE(), 'delt');

DELETE FROM SavedListings;
DELETE FROM FavoriteList;

ALTER TABLE SavedListings ADD SavedListingID INT IDENTITY(1,1) NOT NULL;
ALTER TABLE SavedListings ADD ItemType NVARCHAR(20) NOT NULL DEFAULT 'property';
ALTER TABLE SavedListings ADD TourID INT NULL;

ALTER TABLE SavedListings DROP CONSTRAINT PK_SavedListings;
ALTER TABLE SavedListings ADD CONSTRAINT PK_SavedListings PRIMARY KEY (SavedListingID);

ALTER TABLE SavedListings ALTER COLUMN PropertyID INT NULL;

ALTER TABLE SavedListings
ADD CONSTRAINT FK_SavedListings_Tours
FOREIGN KEY (TourID) REFERENCES Tours(TourID);