import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Card, Button } from './ui';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// React 19 built-in types require explicit typing for class components
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center space-y-4 p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Đã xảy ra lỗi hệ thống</h1>
            <p className="text-slate-500 text-sm">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc liên hệ quản trị viên.
            </p>
            {this.state.error && (
              <div className="bg-red-50 text-red-800 text-xs p-3 rounded-md text-left overflow-auto max-h-32">
                <code>{this.state.error.message}</code>
              </div>
            )}
            <Button onClick={() => window.location.reload()} className="w-full gap-2">
              <RefreshCcw className="w-4 h-4" /> Tải lại trang
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
