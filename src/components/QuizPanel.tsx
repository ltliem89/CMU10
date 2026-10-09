import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { QuizQuestion } from '../types/jetbot';

interface QuizPanelProps {
  questions: QuizQuestion[];
  onSelectModule: (moduleId: string) => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ questions, onSelectModule }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (showResults) return; // Locked when submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      {/* Vibrant STEM Banner */}
      <div className="bg-gradient-to-r from-green-600 via-teal-700 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-yellow-300 text-xs font-black uppercase tracking-wide mb-2">
            <Award className="w-4 h-4 text-yellow-300" /> ĐÁNH GIÁ NĂNG LỰC STEM &amp; ROBOTICS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Bộ Câu Hỏi Thực Hành Tương Tác (10 Câu)</h2>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            Kiểm tra mức độ thấu hiểu của bạn về động học vi sai, hồi quy bám đường, phân loại tránh va chạm,
            tiền xử lý ảnh PyTorch và kỹ thuật tăng tốc với NVIDIA TensorRT.
          </p>
        </div>

        {showResults ? (
          <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center shrink-0 relative z-10 w-full sm:w-auto">
            <span className="text-xs text-white/80 block font-bold">Điểm số của bạn:</span>
            <div className="text-4xl font-black text-yellow-300 font-mono my-1">
              {score} / {questions.length}
            </div>
            <span className="text-xs text-emerald-300 font-bold block mb-3">
              {score >= 8 ? 'Xuất sắc! Nắm vững 12 module.' : score >= 5 ? 'Khá tốt! Ôn lại các lưu ý kỹ thuật.' : 'Cần đọc lại tài liệu nguồn.'}
            </span>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Làm lại bài
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!allAnswered}
            className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition shadow-md relative z-10 w-full sm:w-auto ${
              allAnswered
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 cursor-pointer'
                : 'bg-white/20 text-white/60 cursor-not-allowed border border-white/10'
            }`}
          >
            {allAnswered ? 'Nộp Bài & Xem Lời Giải Chi Tiết' : `Còn ${questions.length - Object.keys(selectedAnswers).length} câu chưa chọn`}
          </button>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-white dark:bg-[#131E36] rounded-3xl border-2 p-5 sm:p-6 transition shadow-xs ${
                showResults
                  ? isCorrect
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20'
                    : 'border-rose-400 dark:border-rose-600 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Câu hỏi {qIndex + 1}: {q.topic}
                </span>
                {showResults && (
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isCorrect 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                {q.question}
              </h3>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {q.options.map((option, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let optionStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#182442] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200';
                  if (isSelected && !showResults) {
                    optionStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-bold';
                  } else if (showResults) {
                    if (isThisCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-bold ring-2 ring-emerald-300';
                    } else if (isSelected && !isThisCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={showResults}
                      className={`w-full text-left p-3.5 rounded-2xl border transition text-xs sm:text-sm flex items-start gap-3 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed mt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when submitted) */}
              {showResults && (
                <div className="p-4 bg-slate-100 dark:bg-[#182442] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-1.5">
                  <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Giải thích sư phạm:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {q.explanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onSelectModule(q.relatedModuleId)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                    >
                      Xem Module liên quan ({q.relatedModuleId}) <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
