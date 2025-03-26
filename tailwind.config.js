tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#0071e3',
        'primary-hover': '#0077ED',
        'text-primary': '#1d1d1f',
        'text-secondary': '#86868b',
        'bg-apple': '#f5f5f7',
      },
      boxShadow: {
        'apple': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'apple-hover': '0 8px 16px rgba(0, 113, 227, 0.24)',
        'apple-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'premium': '0 20px 70px -10px rgba(0, 0, 0, 0.1), 0 10px 30px -10px rgba(0, 113, 227, 0.2)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-btn': '980px',
      },
      fontFamily: {
        'apple': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      backdropBlur: {
        'apple': '30px',
      },
      animation: {
        'soft-bounce': 'softBounce 1.5s infinite',
      },
      keyframes: {
        softBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
} 