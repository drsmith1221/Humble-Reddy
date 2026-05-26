'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const PLACEHOLDER = `I love names that feel old-world but not stuffy. Something with real weight to it but still easy to say day-to-day. My partner wants something that works in both English and Spanish. We're drawn to nature but not in an obvious way — like not "River" or "Sage." Oh, and nothing that ends in -ayden...`;

export default function OnboardingPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  function handleContinue() {
    const intro = text.trim();
    const encoded = btoa(encodeURIComponent(intro));
    router.push(`/quiz?intro=${encoded}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="mb-8">
          <span className="text-3xl">💭</span>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-3 leading-tight">
            Before the questions —<br />
            <span style={{ background: 'linear-gradient(to right, #a855f7, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              just talk to us.
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            No format, no filter. What are you actually looking for in a name? What do you love, what do you hate, what matters to you? Just write — we&apos;ll figure out the rest.
          </p>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={8}
            className="w-full px-5 py-4 rounded-3xl border-2 border-purple-100 focus:border-purple-400 outline-none text-gray-800 text-base leading-relaxed bg-white shadow-sm transition-colors resize-none placeholder-gray-300"
            autoFocus
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-300 font-medium">
            {wordCount > 0 ? `${wordCount} words` : ''}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/quiz?intro=')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip this step →
          </button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            disabled={wordCount < 3}
            className="px-8 py-3 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(to right, #a855f7, #f472b6)' }}
          >
            Next: a few quick questions →
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
