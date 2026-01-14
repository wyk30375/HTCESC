-- 删除旧函数
DROP FUNCTION IF EXISTS register_dealership;

-- 重新创建函数，返回 JSONB 类型
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
RETURNS JSONB
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
    
    -- 返回 JSON 格式
    RETURN jsonb_build_object(
        'id', v_dealership.id,
        'name', v_dealership.name,
        'code', v_dealership.code,
        'contact_person', v_dealership.contact_person,
        'contact_phone', v_dealership.contact_phone,
        'address', v_dealership.address,
        'status', v_dealership.status,
        'created_at', v_dealership.created_at,
        'updated_at', v_dealership.updated_at,
        'business_license', v_dealership.business_license,
        'province', v_dealership.province,
        'city', v_dealership.city,
        'district', v_dealership.district,
        'rejected_reason', v_dealership.rejected_reason,
        'reviewed_at', v_dealership.reviewed_at,
        'reviewed_by', v_dealership.reviewed_by
    );
END;
$$;

-- 授予权限
GRANT EXECUTE ON FUNCTION register_dealership TO anon, authenticated;