'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import EmailModal from '@/components/EmailModal';
import { supabase } from '@/lib/supabase';

export default function EmailCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    // 如果在登录页、注册页或OAuth回调页，直接跳过检查
    if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth/callback')) {
      setIsChecking(false);
      return;
    }

    const initialCheck = async () => {
      const emailExists = await checkEmail();
      if (!emailExists) {
        setShowModal(true);
      }
    };
    initialCheck();

    // 监听导航点击事件
    const handleEmailCheck = async (e: Event) => {
      const customEvent = e as CustomEvent<{ onComplete?: () => void }>;
      const emailExists = await checkEmail();
      
      if (emailExists) {
        // 如果已有邮箱，直接执行回调
        customEvent.detail.onComplete?.();
      } else {
        // 如果没有邮箱，显示模态框并保存回调
        setShowModal(true);
        if (customEvent.detail.onComplete) {
          setPendingCallback(() => customEvent.detail.onComplete);
        }
      }

      // 清理检查标记
      const marker = document.querySelector('[data-check-email]');
      if (marker) {
        marker.remove();
      }
    };

    document.addEventListener('checkEmail', handleEmailCheck);
    return () => {
      document.removeEventListener('checkEmail', handleEmailCheck);
    };
  }, [pathname]);

  const checkEmail = async (): Promise<boolean> => {
    try {
      // 首先检查本地存储是否有邮箱记录
      const storedEmail = localStorage.getItem('userEmail');
      
      // 如果本地有存储，直接返回 true，不需要验证数据库
      if (storedEmail) {
        setIsChecking(false);
        return true;
      }

      // 如果本地没有存储，返回 false
      setIsChecking(false);
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      setIsChecking(false);
      return !!localStorage.getItem('userEmail');
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      // 无论如何，先保存到本地存储
      localStorage.setItem('userEmail', email);

      // 尝试保存到 Supabase，但不等待结果
      try {
        const result = await supabase
          .from('emails')
          .insert([
            { 
              email,
              created_at: new Date().toISOString()
            }
          ]);
          
        if (result.error) {
          console.error('Error saving to Supabase:', result.error);
        }
      } catch (error) {
        console.error('Failed to save email to Supabase:', error);
      }

      // 立即关闭模态框并继续导航
      setShowModal(false);

      // 保存到本地存储
      localStorage.setItem('userEmail', email);
      setShowModal(false);

      // 如果有待处理的回调，执行它
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
    } catch (error) {
      console.error('Error saving email:', error);
      throw error;
    }
  };

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <EmailModal isOpen={showModal} onSubmit={handleEmailSubmit} />
    </>
  );
}