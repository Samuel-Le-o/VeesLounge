import { AlertCircle, RotateCcw, Home } from 'lucide-react'

// Add { onRetry } inside the function parameters to receive the prop
export function ErrorState({ onRetry, page }) {
  return (
    <div className="max-w-md mx-auto my-16 px-4 text-center">
      <div className="bg-white border border-red-100 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        
        {/* Visual Anchor Indicator */}
        <div className="p-4 bg-red-50 text-red-500 rounded-full mb-5 animate-bounce">
          <AlertCircle className="h-8 w-8" />
        </div>

        {/* Messaging Area */}
        <h3 className="text-base font-bold text-gray-800 mb-1">
          Connection Issue Detected
        </h3>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-6">
            Failed to load. Please check your network or try refreshing the request context parameters.
        </p>

        {/* Action Controls */}
        <div className="w-full space-y-2.5">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wide active:scale-95 transition-all cursor-pointer shadow-sm hover:opacity-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          )}

          { page !== 'home' && (
            <a
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wide active:scale-95 transition-all cursor-pointer hover:bg-gray-100"
            >
              <Home className="h-3.5 w-3.5" />
              Return Home
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
