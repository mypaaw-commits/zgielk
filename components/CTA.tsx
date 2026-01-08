import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const CTA: React.FC = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus('idle');
        setEmail("");
      }, 2000);
    }, 1500);
  };

  return (
    <>
      <section className="py-32 md:py-48 flex items-center justify-center bg-stone-900 text-stone-50 overflow-hidden relative">
        {/* Subtle decorative circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-stone-800 rounded-full blur-[120px] opacity-30 pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-5xl md:text-7xl mb-8 leading-tight"
          >
            {t.cta.heading}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-stone-400 text-lg md:text-xl mb-12 max-w-lg mx-auto"
          >
            {t.cta.subheading}
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center gap-4 px-12 py-5 bg-stone-100 text-stone-900 rounded-full overflow-hidden transition-transform active:scale-95"
            >
               <span className="relative z-10 font-medium tracking-wide">{t.cta.button}</span>
               <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-stone-100 rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {status === 'success' ? (
                <div className="text-center py-8">
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6"
                   >
                     <ArrowRight className="w-8 h-8 text-stone-50" />
                   </motion.div>
                   <h3 className="text-2xl font-serif text-stone-900 mb-2">{t.modal.success}</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="text-center mb-2">
                    <h3 className="text-2xl font-serif text-stone-900 mb-2">{t.modal.title}</h3>
                    <p className="text-stone-500 text-sm">{t.cta.subheading}</p>
                  </div>
                  
                  <div>
                    <input 
                      type="email" 
                      required
                      placeholder={t.modal.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-200 border-none rounded-lg px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-stone-900 text-stone-50 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? t.modal.submitting : t.modal.submit}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CTA;