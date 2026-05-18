import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSlogan?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true, showSlogan = false }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3">
        {/* Logo Image with SVG Fallback */}
        <div className={iconSizes[size] + " relative"}>
          <img 
            src="/vittapet_logo.png" 
            alt="VittaPet" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="w-full h-full">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Paw Toes */}
              <circle cx="25" cy="40" r="12" fill="var(--color-vittagreen)" />
              <circle cx="42" cy="22" r="13" fill="var(--color-vittagreen)" />
              <circle cx="68" cy="22" r="13" fill="var(--color-vittagreen)" />
              <circle cx="85" cy="40" r="12" fill="var(--color-vittagreen)" />
              
              {/* Heart Pad */}
              <path 
                d="M55 90C45 90 20 75 20 58C20 48 30 42 40 45C45 46.5 50 52 55 52C60 52 65 46.5 70 45C80 42 90 48 90 58C90 75 65 90 55 90Z" 
                fill="var(--color-vittagreen)" 
                transform="translate(-5, -5)"
              />
              
              {/* Medical Cross */}
              <rect x="44" y="62" width="22" height="6" rx="1" fill="white" transform="translate(-1, -2)" />
              <rect x="52" y="54" width="6" height="22" rx="1" fill="white" transform="translate(-1, -2)" />
            </svg>
          </div>
        </div>

        {showText && (
          <h1 className={`${textSizes[size]} font-extrabold tracking-tighter leading-none`}>
            <span className="text-vittagreen">Vitta</span>
            <span className="text-vittablue">Pet</span>
          </h1>
        )}
      </div>
      
      {showSlogan && (
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-tight mt-1 ml-1 leading-tight uppercase font-sans">
          Cuidado que conecta. Amor que permanece.
        </p>
      )}
    </div>
  );
}
