'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizStep } from '@/components/QuizStep';
import { QuizAnswers } from '@/lib/types';

const STEPS = [
  {
    key: 'vibe',
    question: "What's your overall vibe?",
    subtext: 'Pick the one that feels most like you.',
    options: [
      { value: 'earthy', label: 'Earthy & Grounded', emoji: '🌿' },
      { value: 'bold', label: 'Bold & Creative', emoji: '🔥' },
      { value: 'classic', label: 'Classic & Timeless', emoji: '🕊️' },
      { value: 'whimsical', label: 'Whimsical & Dreamy', emoji: '🌙' },
    ],
    freeText: false,
  },
  {
    key: 'aesthetic',
    question: "What's your aesthetic?",
    subtext: 'The look and feel of your world.',
    options: [
      { value: 'cottagecore', label: 'Cottagecore', emoji: '🌸' },
      { value: 'minimalist', label: 'Minimalist', emoji: '◻️' },
      { value: 'maximalist', label: 'Maximalist', emoji: '🎨' },
      { value: 'vintage', label: 'Vintage & Nostalgic', emoji: '📷' },
    ],
    freeText: false,
  },
  {
    key: 'priority',
    question: 'What matters most in a name?',
    subtext: "If you could only have one thing, it'd be this.",
    options: [
      { value: 'meaning', label: 'Meaning & Depth', emoji: '📖' },
      { value: 'sound', label: 'Sound & Flow', emoji: '🎵' },
      { value: 'uniqueness', label: 'Uniqueness', emoji: '💎' },
      { value: 'cultural', label: 'Cultural Roots', emoji: '🌍' },
    ],
    freeText: false,
  },
  {
    key: 'gender',
    question: 'Any gender direction?',
    subtext: 'No pressure — this is just a starting point.',
    options: [
      { value: 'girl', label: "Girl's name", emoji: '🌷' },
      { value: 'boy', label: "Boy's name", emoji: '⚡' },
      { value: 'neutral', label: 'Gender-neutral', emoji: '🌈' },
      { value: 'surprise', label: 'Surprise me', emoji: '🎁' },
    ],
    freeText: false,
  },
  {
    key: 'familyWord',
    question: 'One word for your family.',
    subtext: 'How would you describe the energy in your home?',
    options: [],
    freeText: true,
  },
] as const;

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [freeformIntro, setFreeformIntro] = useState('');
  const [answers, setAnswers] = useState<QuizAnswers>({
    freeformIntro: '',
    vibe: null,
    aesthetic: null,
    priority: null,
    gender: null,
    familyWord: '',
  });

  useEffect(() => {
    const introParam = searchParams.get('intro');
    if (introParam) {
      try {
        const decoded = decodeURIComponent(atob(introParam));
        setFreeformIntro(decoded);
        setAnswers((prev) => ({ ...prev, freeformIntro: decoded }));
      } catch {
        // ignore malformed
      }
    }
  }, [searchParams]);

  const current = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  const currentValue =
    current.key === 'familyWord'
      ? answers.familyWord
      : answers[current.key as keyof Omit<QuizAnswers, 'familyWord' | 'freeformIntro'>];

  const canAdvance =
    current.freeText ? answers.familyWord.trim().length > 0 : currentValue !== null;

  function handleSelect(value: string) {
    const key = current.key as keyof QuizAnswers;
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    if (!current.freeText) {
      setTimeout(() => advance(updated), 240);
    }
  }

  function handleFreeText(value: string) {
    setAnswers((prev) => ({ ...prev, familyWord: value }));
  }

  function advance(latestAnswers: QuizAnswers) {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const finalAnswers = { ...latestAnswers, freeformIntro };
      const encoded = btoa(JSON.stringify(finalAnswers));
      router.push(`/chat?q=${encoded}`);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>A few quick questions</span>
            <span>{step + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <QuizStep
            key={step}
            question={current.question}
            subtext={current.subtext}
            options={current.freeText ? [] : [...current.options]}
            selected={current.freeText ? null : (currentValue as string | null)}
            onSelect={handleSelect}
            freeText={current.freeText}
            freeTextValue={answers.familyWord}
            onFreeTextChange={handleFreeText}
          />
        </AnimatePresence>

        {current.freeText && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: canAdvance ? 1 : 0.4, y: 0 }}
            onClick={() => canAdvance && advance(answers)}
            disabled={!canAdvance}
            className="mt-6 w-full py-3 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(to right, #a855f7, #f472b6)' }}
          >
            {step < STEPS.length - 1 ? 'Next →' : "Let's chat →"}
          </motion.button>
        )}
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <QuizPageInner />
    </Suspense>
  );
}
