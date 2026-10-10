import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reset any problematic local state or reload
    try {
      window.location.reload();
    } catch {
      // ignore
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070D1B] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#0C152B] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  {this.props.fallbackTitle || 'Đã Xảy Ra Sự Cố Hiển Thị'}
                </h2>
                <p className="text-xs text-slate-400">
                  Hệ thống đã tự động bảo vệ và chặn lỗi giao diện để không làm mất dữ liệu của bạn.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-red-300 mb-5 overflow-auto max-h-36">
              {this.state.error?.message || 'Lỗi không xác định trong cây thành phần'}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Tải Lại & Khôi Phục Giao Diện
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition border border-slate-700"
              >
                <Home className="w-4 h-4" />
                Thử Tiếp Tục
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
