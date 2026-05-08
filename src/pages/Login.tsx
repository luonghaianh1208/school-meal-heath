import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Card, Button } from '../components/ui';
import { Utensils } from 'lucide-react';
import { seedDatabase } from '../utils/seedData';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';

  // Already logged in → redirect
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    setIsLoading(true);
    try {
      if (isRegister) {
        await signUp(email, password);
        toast('Tạo tài khoản thành công!', 'success');
      } else {
        await signIn(email, password);
        toast('Đăng nhập thành công!', 'success');
      }

      // Auto seed demo data if database is empty
      try {
        await seedDatabase();
      } catch {
        // Seed failed — not critical, ignore
      }

      navigate(from, { replace: true });
    } catch (error: any) {
      const msg = error.code === 'auth/user-not-found' ? 'Tài khoản không tồn tại'
        : error.code === 'auth/wrong-password' ? 'Sai mật khẩu'
        : error.code === 'auth/invalid-credential' ? 'Email hoặc mật khẩu không đúng'
        : error.code === 'auth/email-already-in-use' ? 'Email đã được sử dụng'
        : error.code === 'auth/invalid-email' ? 'Email không hợp lệ'
        : error.message || 'Đã xảy ra lỗi';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Utensils className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          SMHM
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          School Meal Health Manager
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? (isRegister ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...')
                  : (isRegister ? 'Tạo tài khoản' : 'Đăng nhập')
                }
              </Button>
            </div>
          </form>
          
          <div className="mt-6 border-t border-slate-200 pt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {isRegister ? '← Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký →'}
            </button>
            {isRegister && (
              <p className="text-xs text-slate-400 mt-2">
                Tài khoản đầu tiên sẽ được gán quyền <strong>Admin (BGH)</strong> tự động.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
