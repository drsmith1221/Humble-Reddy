'use client';

import { motion } from 'framer-motion';

interface Option {
  value: string;
  label: string;
  emoji: string;
}

interface QuizStepProps {
  question: string;
  subtext?: string;
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
  freeText?: boolean;
  freeTextValue?: string;
  onFreeTextChange?: (value: string) => void;
}

export function QuizStep({
  question,
  subtext,
  options,
  selected,
  onSelect,
  freeText,
  freeTextValue,
  onFreeTextChange,
}: QuizStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      <h2 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-1">{question}</h2>
      {subtext && <p className="text-gray-500 text-sm mb-6">{subtext}</p>}

      {freeText ? (
        <input
          type="text"
          value={freeTextValue ?? ''}
          onChange={(e) => onFreeTextChange?.(e.target.value)}
          placeholder="Type your word..."
          className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none text-gray-800 text-lg bg-white shadow-sm transition-colors mt-2"
          autoFocus
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(opt.value)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-200 shadow-sm
                ${
                  selected === opt.value
                    ? 'border-purple-500 bg-purple-50 shadow-purple-100 shadow-md'
                    : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/40'
                }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className={`text-sm font-semibold ${selected === opt.value ? 'text-purple-700' : 'text-gray-700'}`}>
                {opt.label}
              </span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
