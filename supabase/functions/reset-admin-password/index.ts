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
    const { username, oldPassword, newPassword } = await req.json();

    if (!username || !oldPassword || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, message: '用户名、旧密码和新密码不能为空' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return new Response(
        JSON.stringify({ success: false, message: '新密码不能与旧密码相同' }),
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

    // 查找用户
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, username')
      .eq('username', username)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, message: '用户不存在' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 检查是否为管理员
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, message: '只有管理员可以使用此功能' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // 验证旧密码（通过尝试登录）
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: profile.email,
      password: oldPassword,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ success: false, message: '旧密码错误，请重新输入' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // 重置密码
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('重置密码失败:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: '重置密码失败: ' + updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 更新 profiles 表，标记为使用新密码
    await supabaseAdmin
      .from('profiles')
      .update({ default_password: newPassword })
      .eq('id', profile.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: '管理员密码重置成功',
        username: profile.username,
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
