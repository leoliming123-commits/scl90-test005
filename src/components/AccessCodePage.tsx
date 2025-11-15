import { useState } from 'react';
import { Key, AlertCircle, Loader2 } from 'lucide-react';

interface AccessCodePageProps {
  onSuccess: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const VERIFY_API_URL = `${SUPABASE_URL}/functions/v1/verify-access-code`;

export default function AccessCodePage({ onSuccess }: AccessCodePageProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateAccessCode = async () => {
    if (!code.trim()) {
      setError('请输入访问码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let sessionToken = localStorage.getItem('session_token');

      if (!sessionToken) {
        sessionToken = crypto.randomUUID();
        localStorage.setItem('session_token', sessionToken);
      }

      const response = await fetch(VERIFY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          code: code.trim(),
          sessionToken,
        }),
      });

      const result = await response.json();

      if (!result.valid) {
        setError(result.message || '验证失败');
        setLoading(false);
        return;
      }

      localStorage.setItem('access_code', code.trim());
      localStorage.setItem('first_access_at', result.firstAccessAt);
      onSuccess();
    } catch (err) {
      console.error('验证访问码时出错:', err);
      setError('验证失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAccessCode();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white px-6 py-12 text-center">
            <Key className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3">SCL-90 心理测评</h1>
            <p className="text-white/90">请输入您的访问码</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">使用说明</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• 每个访问码激活后有效期为 24 小时</li>
                    <li>• 在有效期内可随时完成测评</li>
                    <li>• 您的测试数据完全在本地处理，不会上传</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-2">
                  访问码
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入访问码"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-[#7C9CB4] focus:outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white py-3 rounded-2xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    验证中...
                  </>
                ) : (
                  '验证访问码'
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-2">还没有访问码？</p>
              <a
                href="#"
                className="text-[#7C9CB4] font-medium hover:underline"
              >
                点击购买
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
