import React from 'react';
import { Star, Film, Tv, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';

interface MediaGridProps {
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
  selectedCategory: 'all' | 'movie' | 'series';
}

export default function MediaGrid({ items, onItemClick, selectedCategory }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div id="empty-grid" className="text-center py-20 bg-[#0d0b14]/30 rounded-3xl border border-white/5 my-12">
        <p className="text-gray-400 text-lg">لم يتم العثور على أي نتائج تطابق بحثك أو تصنيفك.</p>
      </div>
    );
  }

  // Split into Movies and Series if 'all' is selected to make beautiful styled rows,
  // or show a unified grid if a specific category is selected!
  const movies = items.filter(item => item.type === 'movie');
  const series = items.filter(item => item.type === 'series');

  const renderSection = (title: string, sectionItems: MediaItem[], icon: React.ReactNode) => {
    if (sectionItems.length === 0) return null;
    return (
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 border-r-4 border-red-600 pr-3">
          <span className="text-red-500">{icon}</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
          <span className="text-xs text-gray-500 mr-2 bg-white/5 px-2.5 py-1 rounded-full">{sectionItems.length}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {sectionItems.map((item, index) => (
            <motion.div
              id={`media-card-${item.id || index}`}
              key={item.id || `${item.type}-${item.title}-${index}`}
              onClick={() => onItemClick(item)}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group bg-[#13111c] border border-white/5 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between h-full hover:border-red-500/30 shadow-lg hover:shadow-red-600/5 hover:bg-[#191624]"
            >
              {/* Poster and Overlay */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1c1829]">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 bg-red-600 rounded-full text-white shadow-xl shadow-red-600/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play size={20} className="fill-white" />
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs font-bold text-yellow-500 border border-white/5">
                  <Star size={11} className="fill-yellow-500" />
                  <span>{item.rating}</span>
                </div>

                {/* Media Type Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs text-gray-300 border border-white/5">
                  {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-3 text-right">
                <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 mb-1" title={item.title}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={item.description}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div id="media-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {selectedCategory === 'all' && (
        <>
          {renderSection('أحدث الأفلام المضافة', movies, <Film size={20} />)}
          {renderSection('أحدث المسلسلات المضافة', series, <Tv size={20} />)}
        </>
      )}

      {selectedCategory === 'movie' && (
        renderSection('أفلام مميزة ومجانية', movies, <Film size={20} />)
      )}

      {selectedCategory === 'series' && (
        renderSection('مسلسلات حصرية ومجانية', series, <Tv size={20} />)
      )}
    </div>
  );
}
