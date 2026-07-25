-- ============================================
-- Fix Permissions for NIXT Platform
-- ============================================

-- 1. التحقق من الأدوار والصلاحيات الموجودة
SELECT 'Checking existing roles and permissions...' AS Status;

-- عرض جميع المستخدمين وأدوارهم
SELECT 
    id,
    email,
    role,
    is_admin,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 2. إضافة الصلاحيات الأساسية إذا لم تكن موجودة
SELECT 'Adding basic permissions if not exist...' AS Status;

INSERT IGNORE INTO permissions (name, description, category) VALUES
-- صلاحيات المشاريع
('view_projects', 'View all projects', 'projects'),
('create_projects', 'Create new projects', 'projects'),
('edit_projects', 'Edit existing projects', 'projects'),
('delete_projects', 'Delete projects', 'projects'),
('view_project_stats', 'View project statistics', 'projects'),

-- صلاحيات المستخدمين
('view_users', 'View all users', 'users'),
('create_users', 'Create new users', 'users'),
('edit_users', 'Edit user information', 'users'),
('delete_users', 'Delete users', 'users'),

-- صلاحيات الرسائل
('view_all_messages', 'View all conversations', 'messages'),
('send_messages', 'Send messages', 'messages'),
('delete_messages', 'Delete messages', 'messages'),

-- صلاحيات العقود
('view_contracts', 'View all contracts', 'contracts'),
('create_contracts', 'Create new contracts', 'contracts'),
('sign_contracts', 'Sign contracts', 'contracts'),
('delete_contracts', 'Delete contracts', 'contracts'),

-- صلاحيات لوحة التحكم
('view_dashboard', 'Access dashboard', 'dashboard'),
('view_analytics', 'View analytics and reports', 'dashboard'),
('manage_settings', 'Manage system settings', 'dashboard');

-- 3. ربط الصلاحيات بدور ADMIN
SELECT 'Assigning permissions to ADMIN role...' AS Status;

INSERT IGNORE INTO role_permissions (role_name, permission_name)
SELECT 'ADMIN', name FROM permissions;

-- 4. ربط الصلاحيات بدور CONTROLLER (Controller Dashboard)
SELECT 'Assigning permissions to CONTROLLER role...' AS Status;

INSERT IGNORE INTO role_permissions (role_name, permission_name) VALUES
('CONTROLLER', 'view_projects'),
('CONTROLLER', 'edit_projects'),
('CONTROLLER', 'view_project_stats'),
('CONTROLLER', 'view_users'),
('CONTROLLER', 'view_all_messages'),
('CONTROLLER', 'send_messages'),
('CONTROLLER', 'view_contracts'),
('CONTROLLER', 'view_dashboard'),
('CONTROLLER', 'view_analytics');

-- 5. ربط الصلاحيات بدور CLIENT (العميل العادي)
SELECT 'Assigning permissions to CLIENT role...' AS Status;

INSERT IGNORE INTO role_permissions (role_name, permission_name) VALUES
('CLIENT', 'view_projects'), -- عرض مشاريعه الخاصة فقط
('CLIENT', 'send_messages'), -- إرسال رسائل
('CLIENT', 'view_contracts'), -- عرض عقوده
('CLIENT', 'sign_contracts'), -- توقيع العقود
('CLIENT', 'view_dashboard'); -- الوصول للوحة التحكم الخاصة

-- 6. تحديث جميع المستخدمين الذين is_admin = true ليكون دورهم ADMIN
SELECT 'Updating admin users...' AS Status;

UPDATE users 
SET role = 'ADMIN' 
WHERE is_admin = true AND (role IS NULL OR role = '');

-- 7. عرض ملخص الصلاحيات لكل دور
SELECT 'Summary of permissions by role...' AS Status;

SELECT 
    rp.role_name,
    COUNT(rp.permission_name) AS total_permissions,
    GROUP_CONCAT(rp.permission_name ORDER BY rp.permission_name SEPARATOR ', ') AS permissions
FROM role_permissions rp
GROUP BY rp.role_name
ORDER BY rp.role_name;

-- 8. التحقق من المستخدمين وصلاحياتهم
SELECT 'Checking user permissions...' AS Status;

SELECT 
    u.id,
    u.email,
    u.role,
    u.is_admin,
    COUNT(rp.permission_name) AS total_permissions
FROM users u
LEFT JOIN role_permissions rp ON u.role = rp.role_name
GROUP BY u.id, u.email, u.role, u.is_admin
ORDER BY u.created_at DESC
LIMIT 10;

-- 9. إنشاء Stored Procedure للتحقق من الصلاحيات
DELIMITER //

DROP PROCEDURE IF EXISTS check_user_permissions//

CREATE PROCEDURE check_user_permissions(IN user_email VARCHAR(255))
BEGIN
    SELECT 
        u.id,
        u.email,
        u.role,
        u.is_admin,
        rp.permission_name
    FROM users u
    LEFT JOIN role_permissions rp ON u.role = rp.role_name
    WHERE u.email = user_email
    ORDER BY rp.permission_name;
END//

DELIMITER ;

-- 10. استخدام الـ Procedure للتحقق من صلاحيات مستخدم محدد
-- CALL check_user_permissions('your-email@example.com');

SELECT '✅ Permissions setup completed!' AS Status;
SELECT 'Run: CALL check_user_permissions(''your-email@example.com''); to check your permissions' AS NextStep;
