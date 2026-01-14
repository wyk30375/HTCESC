-- 创建一个函数来处理车行注册申请
-- 这个函数以 SECURITY DEFINER 运行，绕过 RLS 限制
CREATE OR REPLACE FUNCTION register_dealership(
    p_name TEXT,
    p_code TEXT,
    p_contact_person TEXT,
    p_contact_phone TEXT,
    p_address TEXT DEFAULT NULL,
    p_business_license TEXT DEFAULT NULL,
    p_province TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_district TEXT DEFAULT NULL
)
RETURNS dealerships
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dealership dealerships;
BEGIN
    -- 插入车行记录（状态为 pending）
    INSERT INTO dealerships (
        name,
        code,
        contact_person,
        contact_phone,
        address,
        business_license,
        province,
        city,
        district,
        status
    )
    VALUES (
        p_name,
        p_code,
        p_contact_person,
        p_contact_phone,
        p_address,
        p_business_license,
        p_province,
        p_city,
        p_district,
        'pending'
    )
    RETURNING * INTO v_dealership;
    
    RETURN v_dealership;
END;
$$;

-- 授予所有人（包括匿名用户）执行此函数的权限
GRANT EXECUTE ON FUNCTION register_dealership TO anon, authenticated;