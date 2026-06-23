import React from 'react';
import { Play, Star, Film, Tv } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';

interface HeroProps {
  item: MediaItem | null;
  onPlayClick: (item: MediaItem) => void;
}

export default function Hero({ item, onPlayClick }: HeroProps) {
  if (!item) {
    // Elegant fall-back hero banner when there are no items yet
    return (
      <div id="default-hero" className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-red-950/20 to-[#0c0a0f] border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent"></div>
        <div className="relative z-10 text-center max-w-2xl px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
              عالم الترفيه <span className="text-red-500">المجاني</span> بالكامل
            </h1>
            <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
              شاهد أحدث الأفلام والمسلسلات الحصرية بجودة عالية وسيرفرات سريعة دون أي اشتراكات أو تكاليف.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div id={`hero-banner-${item.id}`} className="relative h-[70vh] w-full flex items-end overflow-hidden border-b border-white/5 bg-[#0c0a0f]">
      {/* Background Poster Cover with elegant dark gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover object-top opacity-30 scale-105 blur-sm brightness-75 md:blur-0"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a0f] via-[#0c0a0f]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a0f] via-transparent to-[#0c0a0f]/40"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 flex flex-col items-start gap-4 text-right">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl flex flex-col gap-4"
        >
          {/* Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow-lg shadow-red-600/10">
              {item.type === 'movie' ? <Film size={12} /> : <Tv size={12} />}
              {item.type === 'movie' ? 'فيلم مميز' : 'مسلسل حصرى'}
            </span>
            <div className="flex items-center gap-1.5 text-yellow-500 bg-[#13111c]/80 border border-white/5 px-2 py-0.5 rounded-md text-xs font-bold">
              <Star size={13} className="fill-yellow-500" />
              <span>{item.rating}/10</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {item.title}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-3 mb-4 drop-shadow-sm font-light">
            {item.description}
          </p>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            <button
              id={`hero-play-btn-${item.id}`}
              onClick={() => onPlayClick(item)}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 transition-all duration-300 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 text-base"
            >
              <Play size={18} className="fill-white" />
              <span>شاهد الآن</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
