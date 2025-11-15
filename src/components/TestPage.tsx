import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { questions } from '../data/scl90Questions';

interface TestPageProps {
  onComplete: (answers: number[]) => void;
}

const ratingOptions = [
  { value: 1, label: '没有' },
  { value: 2, label: '很轻' },
  { value: 3, label: '中等' },
  { value: 4, label: '偏重' },
  { value: 5, label: '严重' }
];

export default function TestPage({ onComplete }: TestPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(90).fill(0));

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isAnswered = answers[currentQuestionIndex] !== 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleRatingClick = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setTimeout(() => {
        onComplete(newAnswers);
      }, 100);
    }
  };

  const handleNext = () => {
    if (!isAnswered) return;

    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex flex-col">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">
              第 {currentQuestionIndex + 1} / {questions.length} 题
            </span>
            <span className="text-sm font-medium text-[#7C9CB4]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
            <div className="mb-8">
              <div className="inline-block px-4 py-1.5 bg-[#7C9CB4]/10 text-[#7C9CB4] rounded-full text-sm font-medium mb-4">
                {currentQuestion.factor}
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800 leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRatingClick(option.value)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                    answers[currentQuestionIndex] === option.value
                      ? 'border-[#7C9CB4] bg-[#7C9CB4]/5 shadow-md'
                      : 'border-neutral-200 hover:border-[#7C9CB4]/40 hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-lg font-medium text-neutral-800">
                    {option.label}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      answers[currentQuestionIndex] === option.value
                        ? 'border-[#7C9CB4] bg-[#7C9CB4]'
                        : 'border-neutral-300'
                    }`}
                  >
                    {answers[currentQuestionIndex] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex-shrink-0 px-6 py-3 border-2 border-neutral-200 text-neutral-600 rounded-2xl font-medium hover:border-neutral-300 hover:bg-neutral-50 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">上一题</span>
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`flex-1 py-3 rounded-2xl font-semibold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  isAnswered
                    ? 'bg-gradient-to-r from-[#7C9CB4] to-[#98B4C8] text-white shadow-md hover:shadow-lg'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <span>{isLastQuestion ? '完成测评' : '下一题'}</span>
                {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              请根据最近一周的实际感受如实作答
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
