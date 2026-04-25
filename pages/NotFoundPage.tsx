
import React from 'react';
import TvAntenna from '../components/TvAntenna';

const NotFoundPage = () => {
  const handleGoHome = () => {
    // Navigate directly to the home route. 
    // The main App component listener will detect this change and render the dashboard/landing page.
    window.location.hash = '#/home';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300 relative">
      <style>{`
        .text_4041, .text_4042, .text_4043 {
          transform: scaleY(24.5) scaleX(9);
        }
        @media only screen and (max-width: 395px) {
          .text_4041, .text_4042, .text_4043 { transform: scaleY(25) scaleX(8); }
        }
      `}</style>
      
      <TvAntenna message="NOT FOUND">
        <div className="text_4041">4</div>
        <div className="text_4042">0</div>
        <div className="text_4043">4</div>
      </TvAntenna>
      
      <div className="mt-12 z-10">
        <button 
            onClick={handleGoHome}
            className="px-6 py-3 text-white bg-slate-900 dark:bg-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
        >
            Go Home
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
