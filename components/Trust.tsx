import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const Trust: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-stone-50 text-center">
      <div className="container mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-stone-400 font-serif italic text-lg mb-12"
        >
          {t.trust.label}
        </motion.p>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Abstract text placeholders for logos to maintain "No stocky" vibe, or use simple shapes */}
           {['Archive', 'Museum', 'Botanical', 'Studio', 'Atelier'].map((item, i) => (
             <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-xl font-bold tracking-tighter text-stone-800 uppercase"
             >
                {item}
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default Trust;