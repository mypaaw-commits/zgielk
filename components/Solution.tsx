import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const Solution: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="solution" className="py-32 md:py-48 bg-stone-50">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-xl">
        
        <div className="mb-24 md:mb-40 md:ml-32">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="block text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-4"
          >
            {t.solution.label}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight"
          >
            {t.solution.heading}
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-32 items-start">
          
          {/* Feature 1 - Asymmetrical Offset (Pushed Down) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-0 md:mt-48"
          >
            <div className="relative group cursor-pointer">
              <div className="overflow-hidden mb-6 aspect-[4/3]">
                <img 
                  src="https://picsum.photos/seed/calm1/800/600?grayscale" 
                  alt="Minimal interface" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-serif mb-2 group-hover:text-stone-600 transition-colors">{t.solution.feature1Title}</h3>
              <p className="text-stone-500 leading-relaxed text-sm max-w-xs">
                {t.solution.feature1Desc}
              </p>
            </div>
          </motion.div>

          {/* Feature 2 - Smaller Image + Offset Text */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative group cursor-pointer">
              {/* Narrower image width for asymmetry */}
              <div className="overflow-hidden mb-8 aspect-[3/4] w-full md:w-[80%]">
                <img 
                  src="https://picsum.photos/seed/calm2/600/750?grayscale" 
                  alt="Structured writing" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Text block offset horizontally */}
              <div className="md:pl-16">
                <h3 className="text-xl font-serif mb-2 group-hover:text-stone-600 transition-colors">{t.solution.feature2Title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm max-w-xs">
                  {t.solution.feature2Desc}
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Quote section */}
        <div className="mt-24 md:mt-40 flex justify-center">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="max-w-2xl text-center"
             >
                <p className="font-serif text-2xl md:text-3xl italic text-stone-800 leading-relaxed">
                  {t.solution.quote}
                </p>
             </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Solution;