import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Lightbulb } from 'lucide-react';
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
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wide mb-1">
            <Award className="w-4 h-4 text-amber-400" /> Đánh Giá Kiến Thức Lập Trình &amp; AI Robot JetBot
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">Bộ Câu Hỏi Thực Hành Tương Tác (10 Câu)</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Kiểm tra mức độ thấu hiểu của bạn về động học vi sai, hồi quy bám đường, phân loại tránh va chạm,
            tiền xử lý ảnh PyTorch và kỹ thuật tăng tốc với NVIDIA TensorRT.
          </p>
        </div>

        {showResults ? (
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-slate-300 block">Kết quả của bạn:</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono my-1">
              {score} / {questions.length}
            </div>
            <span className="text-[11px] text-emerald-300 font-semibold">
              {score >= 8 ? 'Xuất sắc! Nắm vững toàn bộ 12 module.' : score >= 5 ? 'Khá tốt! Hãy ôn lại các lỗi kỹ thuật.' : 'Cần đọc lại tài liệu nguồn.'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!allAnswered}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              allAnswered
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {allAnswered ? 'Nộp Bài & Xem Giải Thích' : `Còn ${questions.length - Object.keys(selectedAnswers).length} câu chưa chọn`}
          </button>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const userAnswer = selectedAnswers[q.id];
          const isCorrect = userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 transition shadow-2xs ${
                showResults
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Question title */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Chủ đề: {q.topic}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question}
                    </h4>
                  </div>
                </div>

                {showResults && (
                  <span className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 mb-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = userAnswer === optIndex;
                  const isCorrectAnswer = optIndex === q.correctIndex;

                  let optClasses = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                  if (showResults) {
                    if (isCorrectAnswer) {
                      optClasses = 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClasses = 'border-rose-400 bg-rose-100 text-rose-900 font-medium';
                    } else {
                      optClasses = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optClasses = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-200';
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      disabled={showResults}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${optClasses}`}
                    >
                      <span>{opt}</span>
                      {showResults && isCorrectAnswer && (
                        <span className="text-[11px] font-bold text-emerald-700 ml-2">Đáp án đúng</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation when revealed */}
              {showResults && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2 text-slate-700">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Giải thích chi tiết: </strong>
                      {q.explanation}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => onSelectModule(q.relatedModuleId)}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1"
                    >
                      Xem lại Module liên quan <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom reset button */}
      {showResults && (
        <div className="text-center pt-4">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" /> Làm Lại Bài Kiểm Tra
          </button>
        </div>
      )}
    </div>
  );
};
