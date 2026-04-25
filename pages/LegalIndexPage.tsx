
import React from 'react';
import CopyrightPage from './CopyrightPage';
import Footer from '../components/Footer';

interface LegalIndexPageProps {
    onNavigateHome: () => void;
    isDarkMode?: boolean;
}

const LegalIndexPage: React.FC<LegalIndexPageProps> = ({ onNavigateHome, isDarkMode = true }) => {
    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-slate-900'} font-sans flex flex-col`}>
             <main className="flex-grow">
                <CopyrightPage onClose={onNavigateHome} />
             </main>
             <Footer />
        </div>
    );
};

export default LegalIndexPage;
