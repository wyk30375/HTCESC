
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Onverwachte fout:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Er is iets misgegaan
              </h2>
              <p className="text-gray-600 mb-6">
                Onze excuses voor het ongemak. Er is een onverwachte fout opgetreden.
              </p>
              <div className="space-y-3 w-full">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-dealership-primary hover:bg-blue-900"
                >
                  Ga naar homepage
                </Button>
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Probeer opnieuw
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
