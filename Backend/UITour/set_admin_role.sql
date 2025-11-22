-- Script để set role Admin cho user
-- Thay [YourEmail] bằng email của user bạn muốn set làm admin

-- Cách 1: Set role Admin cho user theo Email
UPDATE [User] 
SET Role = 'Admin' 
WHERE Email = 'your-email@example.com';

-- Cách 2: Set role Admin cho user theo UserID
-- UPDATE [User] 
-- SET Role = 'Admin' 
-- WHERE UserID = 1;

-- Kiểm tra kết quả
SELECT UserID, Email, FullName, Role 
FROM [User] 
WHERE Role = 'Admin';

