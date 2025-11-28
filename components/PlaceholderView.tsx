import React from 'react';

interface PlaceholderViewProps {
  title: string;
  description?: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description }) => {
  return (
    <div className="max-w-7xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in">
       <div className="w-24 h-24 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6 shadow-xl transform -rotate-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
       </div>
       <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
       <p className="text-gray-400 max-w-md">
         {description || "This feature is currently under development. Check back soon for updates to the dashboard."}
       </p>
       <button className="mt-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700">
         Notify Me
       </button>
    </div>
  );
};

export default PlaceholderView;