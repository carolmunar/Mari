/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './shared/**/*.{js,ts}'],
  safelist: [
    'bg-blue-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-gray-500',
    'bg-purple-600',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        atlassian: {
          blue: '#1868DB',
          darkblue: '#0052CC',
          background: '#FAFBFC',
          text: '#172B4D',
          subtext: '#6B778C',
          border: '#DFE1E6',
          panel: '#FFFFFF',
          hover: '#EBECF0',
        },
      },
      borderRadius: {
        'jira-btn': '4px',
        'jira-card': '20px',
      },
      boxShadow: {
        jira: '0 1px 2px rgba(9, 30, 66, 0.25)',
        'jira-lg':
          '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
      },
    },
  },
  plugins: [],
};
