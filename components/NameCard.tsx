'use client';

import { motion } from 'framer-motion';
import { NameSuggestion } from '@/lib/types';
import { useState } from 'react';

interface NameCardProps {
  suggestion: NameSuggestion;
  index: number;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function NameCard({ suggestion, index, isFavorited, onToggleFavorite }: NameCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
      className="bg-white rounded-3xl p-5 shadow-md border border-purple-50 relative overflow-hidden"
    >
      {/* shimmer stripe */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-transparent to-peach-50/40 pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-playfair text-2xl font-bold text-gray-900 tracking-tight">
            {suggestion.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{suggestion.origin}</p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestion.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onToggleFavorite}
          aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
          className={`text-xl transition-transform active:scale-75 ${isFavorited ? 'scale-110' : 'opacity-40 hover:opacity-80'}`}
        >
          {isFavorited ? '♥' : '♡'}
        </button>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors"
      >
        {expanded ? 'Less ▲' : 'Why this name for you ▼'}
      </button>

      {expanded && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 text-sm text-gray-600 leading-relaxed"
        >
          {suggestion.why}
        </motion.p>
      )}
    </motion.div>
  );
}
