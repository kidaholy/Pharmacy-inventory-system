'use client';

interface ChartPlaceholderProps {
  title: string;
  type: 'line' | 'bar' | 'pie';
  darkMode?: boolean;
}

export default function ChartPlaceholder({ title, type, darkMode = false }: ChartPlaceholderProps) {
  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return (
          <svg className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
          </svg>
        );
      case 'bar':
        return (
          <svg className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'pie':
        return (
          <svg className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v10l8-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-64 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl flex items-center justify-center border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
      <div className="text-center">
        <div className="mb-3">
          {getChartIcon()}
        </div>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
          {title}
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
          Chart integration ready
        </p>
      </div>
    </div>
  );
}