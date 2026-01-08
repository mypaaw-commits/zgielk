import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const ProcessStep: React.FC<{ number: string; title: string; desc: string; index: number }> = ({ number, title, desc, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="flex gap-8 md:gap-16 py-12 md:py-20 border-b border-stone-200 last:border-0"
    >
      <div className="hidden md:block w-32 text-right pt-2">
        <span className="font-mono text-xs text-stone-400">{number}</span>
      </div>
      <div className="flex-1 max-w-xl">
        <span className="md:hidden font-mono text-xs text-stone-400 mb-2 block">{number}</span>
        <h3 className="text-3xl md:text-4xl font-serif text-stone-800 mb-4">{title}</h3>
        <p className="text-stone-500 text-base md:text-lg leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

const Process: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section id="process" className="py-32 bg-stone-100/50">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-xl">
        <div className="md:pl-48">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-widest uppercase text-stone-400 mb-12"
          >
            {t.process.label}
          </motion.h2>

          <div ref={containerRef} className="relative">
            {t.process.steps.map((step, index) => (
              <ProcessStep 
                key={index}
                index={index}
                number={`0${index + 1}`}
                title={step.title} 
                desc={step.desc} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;