import React from 'react';
import IconDownload from './icons/IconDownload';
import IconSparkles from './icons/IconSparkles';
import IconPlus from './icons/IconPlus';

interface HeaderProps {
  onExport: () => void;
  onGetAiSummary: () => void;
  onAddNewOrder: () => void;
  isAiLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onExport, onGetAiSummary, onAddNewOrder, isAiLoading }) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Jewel Market Dashboard</h1>
          <p className="text-brand-gold-light mt-1">Real-time order tracking and analytics.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={onAddNewOrder}
            className="flex items-center bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            <IconPlus className="w-5 h-5 mr-2" />
            Add Order
          </button>
          <button
            onClick={onGetAiSummary}
            disabled={isAiLoading}
            className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isAiLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <IconSparkles className="w-5 h-5 mr-2" />
            )}
            {isAiLoading ? 'Analyzing...' : 'Get AI Summary'}
          </button>
          <button
            onClick={onExport}
            className="flex items-center bg-brand-dark-light hover:bg-brand-gray text-brand-gold-light font-semibold py-2 px-4 border border-brand-gray rounded-lg shadow-sm transition-colors"
          >
            <IconDownload className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;