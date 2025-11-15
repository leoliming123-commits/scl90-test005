import { useState } from 'react';
import { Lock, Shield } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: () => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true');
      onLogin();
    } else {
      setError('密码错误');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3">管理员登录</h1>
            <p className="text-white/90">激活码管理系统</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  管理员密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入管理员密码"
                    className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 rounded-2xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
              >
                登录
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
