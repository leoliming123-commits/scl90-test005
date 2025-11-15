import { useEffect, useRef } from 'react';
import { Brain, TrendingUp, AlertCircle, Phone } from 'lucide-react';
import { calculateResults, type TestResult } from '../utils/scl90Calculator';

interface ResultPageProps {
  answers: number[];
}

function getInterpretation(result: TestResult): string {
  const { totalScore, averageScore, positiveItems } = result;

  if (averageScore < 1.5 && positiveItems < 43) {
    return '您的整体心理健康状况良好，各项指标均在正常范围内。建议继续保持良好的生活习惯和积极的心态。';
  }

  if (averageScore >= 1.5 && averageScore < 2.0) {
    return '您的心理健康状况基本正常，但部分维度可能需要关注。建议适当调整生活节奏，保持良好的作息，必要时可以寻求心理咨询。';
  }

  if (averageScore >= 2.0 && averageScore < 3.0) {
    return `您的得分显示存在一定程度的心理不适。总分 ${totalScore} 分，有 ${positiveItems} 项阳性症状。建议关注您的心理健康状况，考虑寻求专业心理咨询师的帮助。`;
  }

  return `您的得分较高，显示可能存在较为明显的心理困扰。总分 ${totalScore} 分，有 ${positiveItems} 项阳性症状。强烈建议您尽快寻求专业心理医生或精神科医生的帮助，进行更全面的评估。`;
}

function getFactorDescription(factorName: string): string {
  const descriptions: Record<string, string> = {
    躯体化: '反映身体不适感，包括心血管、胃肠道、呼吸系统等方面的主诉。',
    强迫症状: '包括强迫思维和强迫行为，如重复检查、反复思考等。',
    人际关系敏感: '反映人际交往中的不自在感、自卑感以及对他人评价的敏感。',
    抑郁: '包括情绪低落、兴趣减退、缺乏活力、悲观失望等抑郁症状。',
    焦虑: '反映紧张不安、烦躁、惊恐发作等焦虑情绪和躯体症状。',
    敌对: '包括敌对思维、情感及行为，如愤怒、冲动、破坏性等。',
    恐怖: '反映对特定情境、物体或活动的恐惧与回避行为。',
    偏执: '包括多疑、关系妄想、被害思想、夸大等偏执性特征。',
    精神病性: '反映幻觉、妄想、思维障碍等精神病性症状。',
    其他: '包括睡眠障碍、饮食问题等其他症状。',
  };
  return descriptions[factorName] || '';
}

export default function ResultPage({ answers }: ResultPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const result = calculateResults(answers);

  useEffect(() => {
    if (canvasRef.current) {
      drawRadarChart();
    }
  }, [result]);

  const drawRadarChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    ctx.clearRect(0, 0, width, height);

    const factors = result.dimensions;
    const angleStep = (Math.PI * 2) / factors.length;

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const r = (radius / 5) * i;
      for (let j = 0; j <= factors.length; j++) {
        const angle = angleStep * j - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    for (let i = 0; i < factors.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(124, 156, 180, 0.2)';
    ctx.strokeStyle = '#7C9CB4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    factors.forEach((factor, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = Math.min(factor.average, 5);
      const r = (radius / 5) * value;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4B5563';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    factors.forEach((factor, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;

      const lines = factor.name.split('');
      if (lines.length <= 4) {
        ctx.fillText(factor.name, x, y);
      } else {
        ctx.fillText(lines.slice(0, 2).join(''), x, y - 6);
        ctx.fillText(lines.slice(2).join(''), x, y + 6);
      }
    });
  };

  const interpretation = getInterpretation(result);
  const highRiskFactors = result.dimensions.filter((f) => f.average >= 2.0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white px-4 sm:px-6 py-6 sm:py-8 text-center">
            <Brain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">测评结果</h1>
            <p className="text-sm sm:text-base text-white/90">SCL-90 症状自评量表</p>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-[#7C9CB4]/10 to-[#98B4C8]/10 rounded-2xl p-4 sm:p-5 text-center">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">总分</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#7C9CB4]">{result.totalScore}</div>
              </div>
              <div className="bg-gradient-to-br from-[#7C9CB4]/10 to-[#98B4C8]/10 rounded-2xl p-4 sm:p-5 text-center">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">总均分</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#7C9CB4]">
                  {result.averageScore.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-2 sm:gap-3">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#7C9CB4] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2 text-sm sm:text-base">结果解读</h3>
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {interpretation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-4 text-center">
            九大症状因子分析
          </h2>

          <div className="flex justify-center mb-4 sm:mb-6">
            <canvas ref={canvasRef} className="w-full max-w-md" style={{ height: '280px' }} />
          </div>

          <div className="space-y-2 sm:space-y-3">
            {result.dimensions.map((factor) => (
              <div key={factor.name} className="bg-neutral-50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h3 className="font-semibold text-neutral-800 text-sm sm:text-base">{factor.name}</h3>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-neutral-600">
                      均分:{' '}
                      <span className="font-semibold text-[#7C9CB4]">
                        {factor.average.toFixed(2)}
                      </span>
                    </span>
                    {factor.average >= 2.0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                        需关注
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] transition-all duration-500"
                    style={{ width: `${Math.min((factor.average / 5) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {getFactorDescription(factor.name)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {highRiskFactors.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">温馨提示</h3>
                <p className="text-amber-800 text-xs sm:text-sm leading-relaxed mb-3">
                  您在以下维度的得分较高，建议关注这些方面的心理健康状况：
                </p>
                <ul className="space-y-1 text-xs sm:text-sm text-amber-800">
                  {highRiskFactors.map((factor) => (
                    <li key={factor.name}>
                      • <strong>{factor.name}</strong>（均分 {factor.average.toFixed(2)}）
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#7C9CB4] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2 text-sm sm:text-base">寻求专业帮助</h3>
              <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed mb-3">
                如果您感到心理困扰，建议及时寻求专业帮助：
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                <li>• 心理咨询热线：12320（卫生热线）</li>
                <li>• 心理危机干预热线：010-82951332</li>
                <li>• 建议到正规医疗机构心理科或精神科就诊</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400 space-y-1 pb-4">
          <p>本测评结果仅供参考，不能作为临床诊断依据</p>
          <p>您的测评数据完全在本地处理，未上传至服务器</p>
        </div>
      </div>
    </div>
  );
}
