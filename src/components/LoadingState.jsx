import { Sparkles } from 'lucide-react'

export function LoadingState() {
  // Generates an array of 6 items to fill out the grid layout placeholder
  const placeholders = Array(6).fill(null);

  return (
    <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12 bg-white min-h-screen">
      {/* Top Header Placeholder */}
      <div className="mb-8 max-w-sm animate-pulse">
        <div className="h-7 bg-pink-500/20 rounded-lg w-3/4 mb-2 border border-pink-500/10" />
        <div className="h-4 bg-zinc-400 rounded-md w-1/2" />
      </div>

      {/* Grid Layout mimicking your product cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {placeholders.map((_, idx) => (
          <div key={idx} className="border border-pink-100 rounded-2xl p-4 bg-white space-y-4 animate-pulse">

            <div className="w-full h-48 bg-slate-100 rounded-xl" />
            
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="h-5 bg-pink-100 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
            </div>
          </div>
        ))}
      </div> */}

      {/* Global CSS Injector for the Premium Micro-Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.95); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }
        .animate-pulseGlow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* PERFECTLY CENTERED CUSTOM ANIMATED LOADER OVERLAY */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-6">
          
          {/* Neon Loader Visual Cluster */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            
            {/* Background Pulsing Ambient Glow Aura */}
            <div className="absolute w-24 h-24 rounded-full bg-pink-500 filter blur-xl animate-pulseGlow" />

            {/* Outer Rotating Segment Geometry */}
            <div className="absolute inset-0 border-2 border-transparent border-t-pink-500 border-b-pink-500 rounded-full animate-spin [animation-duration:1.5s]" />
            <div className="absolute inset-2 border border-transparent border-r-white border-l-white rounded-full animate-spin [animation-duration:3s] [animation-direction:reverse] opacity-40" />

            {/* Floating Central Core Container */}
            <div className="absolute w-16 h-16 bg-black rounded-full border border-pink-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)] animate-float">
              
              {/* Premium Animated Vector Shopping Bag */}
              <svg 
                className="w-7 h-7 text-pink-500" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Bag Handle with independent CSS pulse */}
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>

            </div>
          </div>

          {/* Luxury Text Branding Container */}
          <div className="flex flex-col items-center gap-1 bg-black/80 backdrop-blur-sm px-6 py-2 rounded-xl border border-zinc-800/80 shadow-2xl">
            <div className="flex items-center gap-1.5 text-white font-black text-sm tracking-[0.25em] uppercase">
              <span>Loading</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            </div>
            <p className="text-[9px] text-zinc-500 tracking-widest font-bold uppercase">
              Curating your catalog
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
