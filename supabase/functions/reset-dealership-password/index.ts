import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username, newPassword, dealershipId, dealershipName } = await req.json();

    if (!username || !newPassword || !dealershipId) {
      return new Response(
        JSON.stringify({ success: false, message: '用户名、新密码和车行ID不能为空' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, message: '密码长度至少6位' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 创建 Supabase 客户端（使用 service_role 权限）
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 验证请求者是否为超级管理员
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: '未授权' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: '身份验证失败' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // 检查是否为超级管理员
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, message: '只有平台超级管理员可以重置车行管理员密码' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // 查找车行管理员
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role, dealership_id')
      .eq('username', username)
      .eq('dealership_id', dealershipId)
      .eq('role', 'dealership_admin')
      .maybeSingle();

    if (adminError || !adminProfile) {
      return new Response(
        JSON.stringify({ success: false, message: '未找到该车行的管理员账号' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 重置密码
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminProfile.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('重置密码失败:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: '重置密码失败: ' + updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 记录操作日志（可选）
    console.log(`[密码重置] 超级管理员 ${user.id} 重置了车行 ${dealershipName}(${dealershipId}) 管理员 ${username} 的密码`);

    return new Response(
      JSON.stringify({
        success: true,
        message: '车行管理员密码重置成功',
        username: adminProfile.username,
        dealershipName: dealershipName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('处理请求失败:', error);
    return new Response(
      JSON.stringify({ success: false, message: '服务器错误: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
