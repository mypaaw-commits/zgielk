import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          style={{ y, opacity }}
          className="absolute right-[10%] top-[20%] w-[30vw] h-[40vh] bg-stone-200 rounded-full blur-[100px] opacity-60" 
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "20%"]), opacity }}
          className="absolute left-[5%] bottom-[10%] w-[25vw] h-[35vh] bg-stone-300 rounded-full blur-[80px] opacity-40" 
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 max-w-screen-xl">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-12">
          
          <div className="md:w-2/3">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-stone-900 tracking-tight"
            >
              {t.hero.title1} <br />
              <span className="italic font-light ml-8 md:ml-16">{t.hero.title2}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 md:ml-2 text-stone-500 max-w-sm font-sans text-sm md:text-base leading-relaxed"
            >
              {t.hero.subtitle}
            </motion.p>
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.2, delay: 0.4 }}
             className="hidden md:block w-px h-32 bg-stone-300"
          />

          <motion.a
            href="#problem"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-6 md:left-1/2 md:-translate-x-1/2 flex flex-col items-center gap-4 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest">{t.hero.scroll}</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Hero;