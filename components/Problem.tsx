import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const Problem: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="problem" className="min-h-[80vh] flex items-center justify-center py-24 md:py-32 bg-stone-900 text-stone-50">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-lg">
        <div className="grid md:grid-cols-12 gap-12 md:gap-24 items-center">
          
          <div className="md:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="aspect-[3/4] overflow-hidden"
            >
              <img 
                src="https://picsum.photos/600/800?grayscale" 
                alt="Abstract chaotic texture" 
                className="object-cover w-full h-full opacity-60 hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </motion.div>
            <div className="absolute -bottom-6 -right-6 text-stone-500 font-mono text-xs">
              {t.problem.fig}
            </div>
          </div>

          <div className="md:col-span-7">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-4xl md:text-6xl leading-tight mb-8"
            >
              {t.problem.headingPart1} <br/>
              <span className="text-stone-400 italic">{t.problem.headingBusy}</span> {t.problem.headingWith} <span className="text-stone-200">{t.problem.headingProductive}</span>
            </motion.h2>

            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="space-y-6 text-stone-400 text-lg leading-relaxed max-w-md"
            >
              <p>{t.problem.text1}</p>
              <p>{t.problem.text2}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;