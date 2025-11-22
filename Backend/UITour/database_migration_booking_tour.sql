-- ============================================
-- Migration Script: Add Tour Support to Bookings
-- ============================================
-- This script adds support for tour bookings in the Bookings table
-- Run this AFTER the main database setup

USE UITour;
GO

-- Step 1: Add TourID column (nullable)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Bookings') AND name = 'TourID')
BEGIN
    ALTER TABLE Bookings ADD TourID INT NULL;
END
GO

-- Step 2: Make PropertyID nullable (if not already)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Bookings') AND name = 'PropertyID' AND is_nullable = 0)
BEGIN
    -- Drop existing FK constraints on PropertyID (if any)
    -- Note: This will drop ALL FK constraints on PropertyID, not just one
    WHILE EXISTS (
        SELECT 1 
        FROM sys.foreign_keys 
        WHERE parent_object_id = OBJECT_ID('Bookings') 
          AND referenced_object_id = OBJECT_ID('Properties')
    )
    BEGIN
        DECLARE @fkName NVARCHAR(128);
        SELECT TOP 1 @fkName = name 
        FROM sys.foreign_keys 
        WHERE parent_object_id = OBJECT_ID('Bookings') 
          AND referenced_object_id = OBJECT_ID('Properties');
        
        IF @fkName IS NOT NULL
        BEGIN
            DECLARE @sql NVARCHAR(MAX) = 'ALTER TABLE Bookings DROP CONSTRAINT ' + QUOTENAME(@fkName);
            EXEC sp_executesql @sql;
        END
    END
    
    -- Make PropertyID nullable
    ALTER TABLE Bookings ALTER COLUMN PropertyID INT NULL;
    
    -- Re-add the FK constraint (allows NULL) - only if constraint doesn't exist
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Bookings_Properties')
    BEGIN
        ALTER TABLE Bookings
        ADD CONSTRAINT FK_Bookings_Properties
        FOREIGN KEY (PropertyID) REFERENCES Properties(PropertyID);
    END
END
GO

-- Step 3: Add foreign key for TourID
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Bookings_Tours')
BEGIN
    ALTER TABLE Bookings
    ADD CONSTRAINT FK_Bookings_Tours
    FOREIGN KEY (TourID) REFERENCES Tours(TourID);
END
GO

-- Step 4: Add check constraint to ensure either PropertyID or TourID is set
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Bookings_PropertyOrTour')
BEGIN
    ALTER TABLE Bookings
    ADD CONSTRAINT CK_Bookings_PropertyOrTour
    CHECK (PropertyID IS NOT NULL OR TourID IS NOT NULL);
END
GO

-- Step 5: Add check constraint to ensure not both PropertyID and TourID are set
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Bookings_NotBoth')
BEGIN
    ALTER TABLE Bookings
    ADD CONSTRAINT CK_Bookings_NotBoth
    CHECK (NOT (PropertyID IS NOT NULL AND TourID IS NOT NULL));
END
GO

-- Verification: Check the structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Bookings'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Migration completed successfully!';
PRINT 'Bookings table now supports both properties and tours.';
GO

