-- ============================================
-- Migration Script: Add Tour Support to Wishlist
-- ============================================
-- This script adds support for tours in the SavedListings table
-- Run this AFTER the main database setup

USE UITour;
GO

-- Remove duplicate ALTER statements - they will be handled by the IF NOT EXISTS checks below


-- Step 1: Add new columns (if not already added)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SavedListings') AND name = 'SavedListingID')
BEGIN
    ALTER TABLE SavedListings ADD SavedListingID INT IDENTITY(1,1) NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SavedListings') AND name = 'ItemType')
BEGIN
    ALTER TABLE SavedListings ADD ItemType NVARCHAR(20) NOT NULL DEFAULT 'property';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SavedListings') AND name = 'TourID')
BEGIN
    ALTER TABLE SavedListings ADD TourID INT NULL;
END
GO

-- Step 2: Update existing data to set ItemType = 'property'
UPDATE SavedListings 
SET ItemType = 'property' 
WHERE ItemType IS NULL OR ItemType = '';
GO

-- Step 3: Drop old primary key constraint (if exists)
IF EXISTS (SELECT * FROM sys.key_constraints WHERE name = 'PK_SavedListings' AND type = 'PK')
BEGIN
    ALTER TABLE SavedListings DROP CONSTRAINT PK_SavedListings;
END
GO

-- Step 4: Make PropertyID nullable (if not already)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SavedListings') AND name = 'PropertyID' AND is_nullable = 0)
BEGIN
    -- First, drop the FK constraint if it exists
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SavedListings_Properties')
    BEGIN
        ALTER TABLE SavedListings DROP CONSTRAINT FK_SavedListings_Properties;
    END
    
    ALTER TABLE SavedListings ALTER COLUMN PropertyID INT NULL;
    
    -- Re-add the FK constraint (allows NULL)
    ALTER TABLE SavedListings
    ADD CONSTRAINT FK_SavedListings_Properties
    FOREIGN KEY (PropertyID) REFERENCES Properties(PropertyID) ON DELETE CASCADE;
END
GO

-- Step 5: Add new primary key on SavedListingID
IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE name = 'PK_SavedListings' AND type = 'PK')
BEGIN
    ALTER TABLE SavedListings ADD CONSTRAINT PK_SavedListings PRIMARY KEY (SavedListingID);
END
GO

-- Step 6: Add foreign key for TourID
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SavedListings_Tours')
BEGIN
    ALTER TABLE SavedListings
    ADD CONSTRAINT FK_SavedListings_Tours
    FOREIGN KEY (TourID) REFERENCES Tours(TourID) ON DELETE CASCADE;
END
GO

-- Step 7: Ensure FK for UserID exists (should already exist, but check)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name LIKE '%SavedListings%Users%')
BEGIN
    ALTER TABLE SavedListings
    ADD CONSTRAINT FK_SavedListings_Users
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE;
END
GO

-- Step 8: Add FK for ListID if it exists and FavoriteList table exists
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SavedListings') AND name = 'ListID')
   AND EXISTS (SELECT * FROM sys.tables WHERE name = 'FavoriteList')
   AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SavedListings_FavoriteList')
BEGIN
    ALTER TABLE SavedListings
    ADD CONSTRAINT FK_SavedListings_FavoriteList
    FOREIGN KEY (ListID) REFERENCES FavoriteList(ListID);
END
GO

-- Step 9: Add check constraint to ensure either PropertyID or TourID is set
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SavedListings_PropertyOrTour')
BEGIN
    ALTER TABLE SavedListings
    ADD CONSTRAINT CK_SavedListings_PropertyOrTour
    CHECK (PropertyID IS NOT NULL OR TourID IS NOT NULL);
END
GO

-- Step 10: Add check constraint to ensure ItemType matches the ID
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SavedListings_ItemTypeMatch')
BEGIN
    ALTER TABLE SavedListings
    ADD CONSTRAINT CK_SavedListings_ItemTypeMatch
    CHECK (
        (ItemType = 'property' AND PropertyID IS NOT NULL AND TourID IS NULL) OR
        (ItemType = 'tour' AND TourID IS NOT NULL AND PropertyID IS NULL)
    );
END
GO

-- Verification: Check the structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SavedListings'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Migration completed successfully!';
PRINT 'SavedListings table now supports both properties and tours.';
GO

