import { useState, useEffect } from 'react';
import { Shield, RefreshCw, Plus, CheckCircle, XCircle, Clock, LogOut, Loader2 } from 'lucide-react';
import { adminApi } from '../lib/adminApi';

interface AccessCode {
  id: string;
  code: string;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const fetchAccessCodes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listAccessCodes();
      setAccessCodes(data);
    } catch (err) {
      console.error('获取激活码列表失败:', err);
      setError(`获取数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCode = async (code: string) => {
    try {
      await adminApi.resetAccessCode(code);
      setSuccess(`激活码 ${code} 已重置`);
      setTimeout(() => setSuccess(''), 3000);
      fetchAccessCodes();
    } catch (err) {
      console.error('重置激活码失败:', err);
      setError(`重置失败: ${err instanceof Error ? err.message : '未知错误'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCode.trim()) {
      setError('请输入激活码');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await adminApi.createAccessCode(newCode.trim());
      setSuccess(`激活码 ${newCode} 创建成功`);
      setTimeout(() => setSuccess(''), 3000);
      setNewCode('');
      fetchAccessCodes();
    } catch (err) {
      console.error('创建激活码失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        setError('激活码已存在');
      } else {
        setError(`创建失败: ${errorMessage}`);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (code: AccessCode) => {
    if (!code.is_active || !code.activated_at) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          可用
        </span>
      );
    }

    const activatedTime = new Date(code.activated_at).getTime();
    const now = Date.now();
    const hoursPassed = (now - activatedTime) / (1000 * 60 * 60);

    if (hoursPassed > 24) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <XCircle className="w-4 h-4" />
          已过期
        </span>
      );
    }

    const hoursLeft = 24 - hoursPassed;
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        <Clock className="w-4 h-4" />
        剩余 {Math.floor(hoursLeft)}h {Math.floor((hoursLeft % 1) * 60)}m
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">管理后台</h1>
                  <p className="text-white/80 mt-1">激活码管理系统</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                退出登录
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {(error || success) && (
              <div className={`border-l-4 rounded-lg p-4 ${error ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
                <p className={`text-sm font-medium ${error ? 'text-red-800' : 'text-green-800'}`}>
                  {error || success}
                </p>
              </div>
            )}

            <div className="bg-neutral-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                创建新激活码
              </h2>
              <form onSubmit={handleCreateCode} className="flex gap-3">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="输入新激活码（如：TEST123）"
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-slate-600 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
                >
                  创建
                </button>
              </form>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-800">激活码列表</h2>
                <button
                  onClick={fetchAccessCodes}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  刷新
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
                </div>
              ) : accessCodes.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  暂无激活码
                </div>
              ) : (
                <div className="space-y-3">
                  {accessCodes.map((code) => (
                    <div
                      key={code.id}
                      className="bg-white border-2 border-neutral-100 rounded-xl p-5 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-neutral-800 font-mono">
                              {code.code}
                            </span>
                            {getStatusBadge(code)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                            <div>
                              <span className="font-medium">创建时间：</span>
                              {formatDate(code.created_at)}
                            </div>
                            <div>
                              <span className="font-medium">激活时间：</span>
                              {formatDate(code.activated_at)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResetCode(code.code)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors font-medium"
                        >
                          <RefreshCw className="w-4 h-4" />
                          重置
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
