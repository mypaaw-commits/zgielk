import React from 'react';
import { useLanguage } from '../LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const handleLinkClick = (e: React.MouseEvent, message: string) => {
    e.preventDefault();
    alert(message);
  };

  return (
    <footer className="bg-stone-50 py-12 border-t border-stone-200">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
        <div>
          <span className="font-serif text-xl italic block mb-2">Essential.</span>
          <p className="text-stone-400 text-xs max-w-xs">
            © {new Date().getFullYear()} Essential Co. {t.footer.desc}
          </p>
        </div>
        
        <div className="flex gap-8 text-sm text-stone-500">
          <a 
            href="#" 
            onClick={(e) => handleLinkClick(e, t.alerts.manifesto)}
            className="hover:text-stone-900 transition-colors"
          >
            {t.footer.links.manifesto}
          </a>
          <a 
            href="#" 
            onClick={(e) => handleLinkClick(e, t.alerts.pricing)}
            className="hover:text-stone-900 transition-colors"
          >
            {t.footer.links.pricing}
          </a>
          <a 
            href="#" 
            onClick={(e) => handleLinkClick(e, t.alerts.login)}
            className="hover:text-stone-900 transition-colors"
          >
            {t.footer.links.login}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;