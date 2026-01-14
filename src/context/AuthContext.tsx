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
  signUp: (username: string, password: string, phone: string, dealershipName: string) => Promise<void>;
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
    const email = `${username}@yichi.internal`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (username: string, password: string, phone: string, dealershipName: string) => {
    // 移除用户名字符限制，允许中文和其他字符
    // 用户名将用于生成邮箱地址，但不影响实际显示的用户名

    const email = `${username}@yichi.internal`;
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

    // 注册成功后，创建车行记录并更新 profiles 表
    if (data.user) {
      // 1. 创建车行记录
      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .insert({
          name: dealershipName,
          status: 'active',
        })
        .select()
        .single();

      if (dealershipError) {
        console.error('创建车行失败:', dealershipError);
        throw new Error('创建车行失败');
      }

      // 2. 更新 profiles 表，关联车行和更新手机号
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          phone,
          dealership_id: dealershipData.id,
          role: 'admin',
        })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error('更新用户信息失败:', updateError);
        throw new Error('更新用户信息失败');
      }

      // 3. 创建员工记录（管理员同时也是员工）
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          dealership_id: dealershipData.id,
          name: username,
          position: '管理员',
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
