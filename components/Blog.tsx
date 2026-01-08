import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Blog: React.FC = () => {
  const { t } = useLanguage();

  const handleArticleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert(t.alerts.blogPost);
  };

  return (
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
              onClick={handleArticleClick}
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
  );
};

export default Blog;