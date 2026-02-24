import * as React from "react";
import { RefreshIcon } from "./icons/RefreshIcon";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components.
 */
export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console for debugging purposes
    console.error("Uncaught error:", error, errorInfo);
  }

  // Use setState to reset the error state when user triggers a reload
  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-8 bg-light-bg dark:bg-dark-bg text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">Ops! Algo correu mal.</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                Lamentamos, mas ocorreu um erro inesperado. Tente recarregar a aplicação.
            </p>
            <button 
                onClick={this.handleReload}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
                <RefreshIcon className="w-5 h-5" />
                Recarregar Aplicação
            </button>
        </div>
      );
    }

    // Access children through props
    return this.props.children;
  }
}