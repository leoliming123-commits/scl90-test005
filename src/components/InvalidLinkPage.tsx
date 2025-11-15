import { AlertCircle, Clock, Mail } from 'lucide-react';

interface InvalidLinkPageProps {
  message: string;
}

export default function InvalidLinkPage({ message }: InvalidLinkPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3">访问受限</h1>
            <p className="text-white/90">您的访问链接无效或已过期</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">提示信息</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C9CB4]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#7C9CB4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">有效期说明</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    每个测评链接自首次访问起24小时内有效。超过有效期后，链接将自动失效。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C9CB4]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#7C9CB4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">获取新链接</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    如需进行测评，请联系服务提供方获取新的专属访问链接。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-800 mb-2">常见问题</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div>
                  <strong>Q: 为什么我的链接失效了？</strong>
                  <p className="mt-1">A: 测评链接从首次访问起24小时后会自动失效，这是为了保护测评的有效性。</p>
                </div>
                <div className="mt-3">
                  <strong>Q: 我可以重复使用同一个链接吗？</strong>
                  <p className="mt-1">A: 在24小时有效期内，您可以随时返回继续测评。超过有效期后需要获取新链接。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
