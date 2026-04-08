import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to console for debugging
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="h-screen bg-background text-foreground flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full">
                        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
                            <h1 className="text-2xl font-bold text-destructive mb-4">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground mb-4">
                                An unexpected error occurred. You can try refreshing the app or resetting the error state.
                            </p>

                            {this.state.error && (
                                <details className="mb-4">
                                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                                        Error details
                                    </summary>
                                    <div className="bg-background rounded p-4 text-sm font-mono overflow-auto max-h-64">
                                        <pre className="text-destructive">
                                            {this.state.error.toString()}
                                        </pre>
                                        {this.state.errorInfo && (
                                            <pre className="text-muted-foreground mt-2">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
