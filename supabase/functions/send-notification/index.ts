// 发送通知的 Edge Function
// 支持企业微信群机器人和短信通知

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, content, notificationType = 'wechat' } = await req.json();

    console.log('📢 [通知服务] 收到通知请求:', { title, notificationType });

    let result: any = { success: false };

    // 根据通知类型发送不同的通知
    if (notificationType === 'wechat' || notificationType === 'both') {
      result.wechat = await sendWeChatNotification(title, content);
    }

    if (notificationType === 'sms' || notificationType === 'both') {
      result.sms = await sendSMSNotification(title, content);
    }

    console.log('📢 [通知服务] 通知发送结果:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('📢 [通知服务] ❌ 发送失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// 发送企业微信群机器人通知
async function sendWeChatNotification(title: string, content: string) {
  const webhookUrl = Deno.env.get('WECHAT_WEBHOOK_URL');

  if (!webhookUrl) {
    console.warn('📢 [企业微信] ⚠️ 未配置 WECHAT_WEBHOOK_URL，跳过企业微信通知');
    return { success: false, message: '未配置企业微信 Webhook URL' };
  }

  try {
    console.log('📢 [企业微信] 发送通知到群机器人...');

    // 格式化内容为 Markdown
    const markdownContent = `## ${title}\n\n${content}\n\n> 发送时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          content: markdownContent,
        },
      }),
    });

    const result = await response.json();

    if (result.errcode === 0) {
      console.log('📢 [企业微信] ✅ 发送成功');
      return { success: true, result };
    } else {
      console.error('📢 [企业微信] ❌ 发送失败:', result);
      return { success: false, result };
    }
  } catch (error: any) {
    console.error('📢 [企业微信] ❌ 发送异常:', error);
    return { success: false, error: error.message };
  }
}

// 发送短信通知（阿里云短信服务示例）
async function sendSMSNotification(title: string, content: string) {
  const accessKeyId = Deno.env.get('SMS_ACCESS_KEY_ID');
  const accessKeySecret = Deno.env.get('SMS_ACCESS_KEY_SECRET');
  const signName = Deno.env.get('SMS_SIGN_NAME');
  const templateCode = Deno.env.get('SMS_TEMPLATE_CODE');
  const adminPhone = Deno.env.get('ADMIN_PHONE');

  if (!accessKeyId || !accessKeySecret || !signName || !templateCode || !adminPhone) {
    console.warn('📢 [短信] ⚠️ 未配置短信服务参数，跳过短信通知');
    return { success: false, message: '未配置短信服务参数' };
  }

  try {
    console.log('📢 [短信] 发送短信通知到:', adminPhone);

    // 这里是阿里云短信服务的示例代码
    // 实际使用时需要根据具体的短信服务商 API 进行调整
    
    // 注意：阿里云短信 API 需要签名计算，这里提供简化示例
    // 生产环境建议使用阿里云官方 SDK
    
    const params = {
      PhoneNumbers: adminPhone,
      SignName: signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({
        title: title,
        content: content.substring(0, 50), // 短信内容限制长度
      }),
    };

    console.log('📢 [短信] ⚠️ 短信发送功能需要配置具体的短信服务商 API');
    console.log('📢 [短信] 参数:', params);

    // TODO: 实际调用短信服务商 API
    // const response = await fetch('短信服务商API地址', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(params),
    // });
    // const result = await response.json();

    return {
      success: false,
      message: '短信功能需要配置具体的短信服务商 API',
      params,
    };
  } catch (error: any) {
    console.error('📢 [短信] ❌ 发送异常:', error);
    return { success: false, error: error.message };
  }
}
