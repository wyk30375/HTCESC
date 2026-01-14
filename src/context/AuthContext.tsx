import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, Dealership } from '@/types/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  dealership: Dealership | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, phone: string, dealershipId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, dealership:dealerships!profiles_dealership_id_fkey(*)')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        // 设置车行信息
        if (data.dealership) {
          setDealership(data.dealership as Dealership);
        }
      }
    } catch (error) {
      console.error('获取用户资料失败:', error);
      setProfile(null);
      setDealership(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setDealership(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    // 使用数据库函数根据用户名获取邮箱地址
    const { data: email, error: queryError } = await supabase.rpc('get_email_by_username', {
      p_username: username,
    });
    
    if (queryError) throw queryError;
    if (!email) throw new Error('用户不存在');
    
    // 使用邮箱地址登录
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // 登录成功后，检查用户的车行状态
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('dealership_id, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('获取用户资料失败:', profileError);
        throw new Error('登录失败，请稍后重试');
      }

      // 检查车行状态（超级管理员不受限制）
      if (profileData?.role !== 'super_admin' && profileData?.dealership_id) {
        // 单独查询车行状态，明确指定使用 profiles_dealership_id_fkey 关系
        const { data: dealershipData, error: dealershipError } = await supabase
          .from('dealerships')
          .select('status')
          .eq('id', profileData.dealership_id)
          .maybeSingle();

        if (dealershipError) {
          console.error('获取车行信息失败:', dealershipError);
          throw new Error('登录失败，请稍后重试');
        }

        const dealershipStatus = dealershipData?.status;
        
        if (!dealershipStatus) {
          // 登出用户
          await supabase.auth.signOut();
          throw new Error('您的账号未关联车行，请联系管理员');
        }

        if (dealershipStatus === 'pending') {
          // 登出用户
          await supabase.auth.signOut();
          throw new Error('您的车行正在审核中，请等待管理员审核通过后再登录');
        }

        if (dealershipStatus === 'rejected') {
          // 登出用户
          await supabase.auth.signOut();
          throw new Error('您的车行注册申请已被拒绝，请联系管理员了解详情');
        }

        if (dealershipStatus === 'inactive') {
          // 登出用户
          await supabase.auth.signOut();
          throw new Error('您的车行已被停用，请联系管理员');
        }
      }
    }
  };

  const signUp = async (username: string, password: string, phone: string, dealershipId: string) => {
    // 使用时间戳和随机数生成唯一的邮箱地址（避免中文用户名导致邮箱格式错误）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const email = `user_${timestamp}_${randomStr}@yichi.internal`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
        },
      },
    });
    if (error) throw error;

    // 注册成功后，更新 profiles 表并创建员工记录
    if (data.user) {
      // 1. 更新 profiles 表，关联车行和更新手机号（保存邮箱地址以便后续登录）
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          phone,
          dealership_id: dealershipId,
          role: 'user', // 普通员工角色
          email: email,
        })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error('更新用户信息失败:', updateError);
        throw new Error('更新用户信息失败');
      }

      // 2. 创建员工记录
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          dealership_id: dealershipId,
          name: username,
          position: '员工',
          phone,
          hire_date: new Date().toISOString().split('T')[0],
        });

      if (employeeError) {
        console.error('创建员工记录失败:', employeeError);
        // 员工记录创建失败不影响注册流程
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        dealership,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}
