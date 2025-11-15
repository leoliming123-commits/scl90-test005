import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 flex items-center justify-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">应用加载失败</h2>
                <p className="text-neutral-600">
                  抱歉，应用遇到了问题。这可能是配置错误导致的。
                </p>
                <div className="bg-neutral-50 rounded-lg p-4 w-full text-left">
                  <p className="text-sm text-neutral-600 mb-2">错误信息：</p>
                  <code className="text-xs text-red-600 break-all">
                    {this.state.error?.message || '未知错误'}
                  </code>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  重新加载
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
