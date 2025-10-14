import { AlertCircle, RefreshCw } from "lucide-react";

interface TimeoutErrorCardProps {
  onRetry: () => void;
  isRetrying?: boolean;
  hasRetried?: boolean;
}

export function TimeoutErrorCard({ onRetry, isRetrying = false, hasRetried = false }: TimeoutErrorCardProps) {
  const isUnreachable = hasRetried;
  
  return (
    <div className={`mb-4 p-4 rounded-lg border-l-3 ${
      isUnreachable 
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    }`} style={{ borderLeftColor: '#ffb74d' }}>
      <div className="flex items-start">
        <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
          isUnreachable 
            ? 'text-amber-600 dark:text-amber-400' 
            : 'text-amber-600 dark:text-amber-400'
        }`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${
              isUnreachable 
                ? 'text-amber-800 dark:text-amber-200' 
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {isUnreachable ? '⚠️ RPC endpoint unreachable' : '⚠️ Endpoint not responding'}
            </span>
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isUnreachable
                  ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-800/30 dark:hover:bg-amber-800/50'
                  : 'text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-800/30 dark:hover:bg-amber-800/50'
              } disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {isRetrying ? 'Retrying...' : 'Retry / Probe endpoint'}
            </button>
          </div>
          <p className={`mt-1 text-sm ${
            isUnreachable 
              ? 'text-amber-700 dark:text-amber-300' 
              : 'text-amber-700 dark:text-amber-300'
          }`}>
            {isUnreachable 
              ? 'The RPC endpoint appears to be completely unreachable. Please check the URL or try a different provider.'
              : 'This RPC may be offline or overloaded. Try switching to another provider or checking its status page.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
