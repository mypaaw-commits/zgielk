import React, { useEffect } from 'react';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import Process from './components/Process';
import Trust from './components/Trust';
import Blog from './components/Blog';
import CTA from './components/CTA';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { LanguageProvider } from './LanguageContext';

const AppContent: React.FC = () => {
  // Smooth scroll behavior fix for iOS
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-stone-50 selection:bg-stone-200 selection:text-stone-900">
      <Navigation />
      
      <main className="flex flex-col">
        <Hero />
        <Problem />
        <Solution />
        <Process />
        <Trust />
        <Blog />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;