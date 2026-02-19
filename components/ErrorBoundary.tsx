
import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshIcon } from "./icons/RefreshIcon";

interface Props {
  // children is made optional to allow wrapping components correctly
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components.
 */
// Fix: Use direct Component import to ensure that the class correctly inherits 
// methods like setState and properties like state and props from the React library.
export class ErrorBoundary extends Component<Props, State> {
  // Declare state as a class property for the TypeScript compiler
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console for debugging purposes
    console.error("Uncaught error:", error, errorInfo);
  }

  // Fix: setState is inherited from Component and now correctly recognized
  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    // Fix: state access is correctly recognized via inheritance from Component
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

    // Fix: props access is correctly recognized via inheritance from Component
    return this.props.children;
  }
}
