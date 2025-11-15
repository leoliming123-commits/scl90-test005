import { Clock, Shield, FileText, AlertTriangle } from 'lucide-react';

interface IntroPageProps {
  onStart: () => void;
}

export default function IntroPage({ onStart }: IntroPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white px-6 py-12 text-center">
            <h1 className="text-3xl font-bold mb-3">SCL-90 症状自评量表</h1>
            <p className="text-white/90 text-lg">心理健康状况评估工具</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">重要声明</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    本量表仅用于心理健康状况的初步筛查和自我了解，<strong>不能作为临床诊断依据</strong>。如有心理困扰，请及时咨询专业心理咨询师或精神科医生。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C9CB4]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#7C9CB4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">量表说明</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    SCL-90 共包含 90 道题目，涵盖躯体化、强迫症状、人际关系敏感、抑郁、焦虑、敌对、恐怖、偏执和精神病性九个症状维度。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C9CB4]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#7C9CB4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">完成时间</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    预计需要 10-15 分钟。请在安静的环境下独立完成，根据<strong>最近一周</strong>的实际感受如实作答。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C9CB4]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#7C9CB4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">隐私保护</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    您的答题内容和测评结果<strong>完全在本地处理，不会上传至服务器</strong>。我们仅验证访问码有效性，确保每个访问码在24小时内有效。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-neutral-800 mb-3">评分标准</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">1 - 没有</span>
                  <span className="text-neutral-400">完全没有该症状</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">2 - 很轻</span>
                  <span className="text-neutral-400">有该症状，但程度很轻</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">3 - 中等</span>
                  <span className="text-neutral-400">有该症状，程度中等</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">4 - 偏重</span>
                  <span className="text-neutral-400">有该症状，程度较重</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">5 - 严重</span>
                  <span className="text-neutral-400">有该症状，程度严重</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white py-4 rounded-2xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
            >
              开始测评
            </button>

            <p className="text-center text-xs text-neutral-400 mt-4">
              点击"开始测评"即表示您已阅读并理解以上说明
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
