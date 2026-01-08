import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Blog: React.FC = () => {
  const { t } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<typeof t.blog.articles[0] | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedArticle]);

  return (
    <>
      <section id="blog" className="py-32 bg-stone-100 border-t border-stone-200">
        <div className="container mx-auto px-6 md:px-12 max-w-screen-xl">
          
          {/* Section Header */}
          <div className="mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-end">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
            >
              <span className="block text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-4">
                {t.blog.label}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
                Thoughts on <br className="hidden md:block"/> clarity & craft.
              </h2>
            </motion.div>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {t.blog.articles.map((article, index) => (
              <motion.article 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Image Placeholder - Abstract Grayscale */}
                <div className="aspect-[16/9] overflow-hidden bg-stone-200 mb-8 relative">
                   <img 
                     src={`https://picsum.photos/seed/blog${index}/600/400?grayscale`} 
                     alt={article.title}
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                   />
                </div>

                {/* Meta Data */}
                <div className="flex justify-between items-center text-xs font-mono text-stone-400 mb-4 border-t border-stone-300 pt-4">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>

                {/* Title & Excerpt */}
                <h3 className="font-serif text-2xl text-stone-900 mb-3 group-hover:text-stone-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-grow">
                  {article.excerpt}
                </p>

                {/* Link */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-900 group-hover:text-stone-500 transition-colors mt-auto">
                  {t.blog.readMore}
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Full Screen Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-stone-50 overflow-y-auto"
          >
            {/* Close Button / Navbar placeholder */}
            <div className="sticky top-0 left-0 right-0 p-6 md:p-12 flex justify-between items-center bg-stone-50/90 backdrop-blur-sm z-10">
               <button 
                 onClick={() => setSelectedArticle(null)}
                 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
               >
                 <ArrowLeft className="w-4 h-4" />
                 {t.blog.label}
               </button>
               
               <button 
                 onClick={() => setSelectedArticle(null)}
                 className="p-2 rounded-full hover:bg-stone-200 transition-colors"
               >
                 <X className="w-6 h-6 text-stone-900" />
               </button>
            </div>

            {/* Article Content */}
            <div className="container mx-auto px-6 md:px-12 max-w-screen-md pb-32">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
               >
                  <div className="flex gap-4 text-xs font-mono text-stone-400 mb-6 uppercase tracking-wider">
                    <span>{selectedArticle.date}</span>
                    <span>•</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>

                  <h1 className="font-serif text-5xl md:text-7xl text-stone-900 leading-[0.9] mb-12">
                    {selectedArticle.title}
                  </h1>

                  <div className="aspect-[21/9] w-full overflow-hidden mb-16 grayscale">
                     <img 
                       src={`https://picsum.photos/seed/${selectedArticle.title.replace(/\s/g, '')}/1200/600?grayscale`}
                       alt={selectedArticle.title}
                       className="w-full h-full object-cover"
                     />
                  </div>

                  <div className="space-y-8 font-serif text-lg md:text-xl text-stone-600 leading-relaxed">
                    {selectedArticle.content.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Footer of article */}
                  <div className="mt-20 pt-12 border-t border-stone-200 text-center">
                    <p className="text-stone-400 italic mb-8">Thanks for reading.</p>
                    <button 
                       onClick={() => setSelectedArticle(null)}
                       className="text-stone-900 hover:text-stone-500 transition-colors font-sans text-sm font-bold uppercase tracking-widest"
                    >
                       Back to Journal
                    </button>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Blog;