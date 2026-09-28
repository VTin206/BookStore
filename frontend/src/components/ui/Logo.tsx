import React from 'react';

export interface LogoProps {
  /**
   * 'horizontal': Icon + "Book Store" + "Khám Phá Thế Giới" beside each other
   * 'symbol': Icon badge only
   * 'stacked': Icon on top, text below (like the original logo design)
   */
  variant?: 'horizontal' | 'symbol' | 'stacked';
  /**
   * 'light': dark text on light background (default)
   * 'dark': white/light text on dark background (admin sidebar, footer)
   */
  theme?: 'light' | 'dark';
  /**
   * Target icon/logo height in pixels or predefined sizes
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  showTagline = true,
  className = '',
  style = {},
}) => {
  const isDark = theme === 'dark';

  // Sizing definitions
  const dimensions = {
    sm: { iconSize: 32, fontSize: '1.05rem', subSize: '0.62rem', gap: '8px' },
    md: { iconSize: 42, fontSize: '1.35rem', subSize: '0.72rem', gap: '10px' },
    lg: { iconSize: 52, fontSize: '1.65rem', subSize: '0.82rem', gap: '12px' },
    xl: { iconSize: 72, fontSize: '2.1rem', subSize: '0.95rem', gap: '14px' },
  }[size];

  // Brand colors from the logo
  const bookBlue = '#4A85B6';
  const leafGreen = '#549662';
  const textDark = '#1E2D3D';
  const textLight = '#FFFFFF';

  // Render SVG Icon (Book with letter 'B' + blooming knowledge tree)
  const renderIcon = (s: number) => (
    <div
      style={{
        width: `${s}px`,
        height: `${s}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: size === 'sm' ? '8px' : '12px',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FBF8F1',
        padding: '2px',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(74, 133, 182, 0.15)',
        overflow: 'hidden',
      }}
    >
      <img
        src="/logo-icon-transparent.png"
        alt="Book Store Logo"
        style={{
          width: '90%',
          height: '90%',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback to SVG if image file fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <svg viewBox="0 0 100 100" width="85%" height="85%" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 30 C22 28 26 26 34 26 L45 28 L45 82 C37 80 26 80 22 84 Z" stroke="${bookBlue}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M32 26 L32 80" stroke="${bookBlue}" stroke-width="4"/>
                <path d="M48 28 C55 24 68 22 76 28 C84 34 82 46 72 49 C84 52 86 66 78 74 C70 80 56 82 48 82" stroke="${bookBlue}" stroke-width="5" stroke-linecap="round"/>
                <path d="M48 80 L48 42" stroke="${bookBlue}" stroke-width="4.5" stroke-linecap="round"/>
                <circle cx="48" cy="34" r="4" fill="${leafGreen}"/>
                <circle cx="40" cy="42" r="3.5" fill="${leafGreen}"/>
                <circle cx="56" cy="42" r="3.5" fill="${leafGreen}"/>
                <circle cx="38" cy="52" r="3" fill="${leafGreen}"/>
                <circle cx="58" cy="52" r="3" fill="${leafGreen}"/>
              </svg>
            `;
          }
        }}
      />
    </div>
  );

  // If only symbol is requested
  if (variant === 'symbol') {
    return (
      <div className={`bookstore-logo-symbol ${className}`} style={{ display: 'inline-flex', ...style }}>
        {renderIcon(dimensions.iconSize)}
      </div>
    );
  }

  // Stacked variant (icon top, brand text below - matching the provided logo card)
  if (variant === 'stacked') {
    return (
      <div
        className={`bookstore-logo-stacked ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: dimensions.gap,
          ...style,
        }}
      >
        {renderIcon(dimensions.iconSize * 1.35)}
        <div>
          <div
            style={{
              fontSize: dimensions.fontSize,
              fontWeight: 800,
              color: isDark ? textLight : textDark,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Book Store
          </div>
          {showTagline && (
            <div
              style={{
                fontSize: dimensions.subSize,
                color: leafGreen,
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginTop: '3px',
              }}
            >
              Khám Phá Thế Giới
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (icon on left, text on right) - perfect for header and navbar
  return (
    <div
      className={`bookstore-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dimensions.gap,
        userSelect: 'none',
        ...style,
      }}
    >
      {renderIcon(dimensions.iconSize)}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span
          style={{
            fontSize: dimensions.fontSize,
            fontWeight: 800,
            color: isDark ? textLight : textDark,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          Book Store
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: dimensions.subSize,
              color: isDark ? '#8ED09D' : leafGreen,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Khám Phá Thế Giới
          </span>
        )}
      </div>
    </div>
  );
};
