import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const Navigation: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 mix-blend-difference text-stone-900 md:text-stone-50"
    >
      <div className="text-xl font-serif italic tracking-wide">Essential.</div>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-8 text-sm font-sans tracking-widest uppercase opacity-80">
          <a href="#problem" className="hover:opacity-100 transition-opacity">{t.nav.insight}</a>
          <a href="#solution" className="hover:opacity-100 transition-opacity">{t.nav.method}</a>
          <a href="#process" className="hover:opacity-100 transition-opacity">{t.nav.journey}</a>
          <a href="#blog" className="hover:opacity-100 transition-opacity">{t.nav.journal}</a>
        </div>
        
        <button 
          onClick={toggleLanguage}
          className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full hover:bg-stone-900 hover:text-stone-50 md:hover:bg-stone-50 md:hover:text-stone-900 transition-colors"
        >
          {language === 'en' ? 'PL' : 'EN'}
        </button>
      </div>
    </motion.nav>
  );
};

export default Navigation;