'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const bubbles = [
  { size: 180, x: '10%', y: '15%', color: '#e9d5ff', delay: 0 },
  { size: 120, x: '80%', y: '10%', color: '#fecdd3', delay: 1.5 },
  { size: 90, x: '70%', y: '65%', color: '#a7f3d0', delay: 0.8 },
  { size: 150, x: '5%', y: '70%', color: '#fde68a', delay: 2.2 },
  { size: 70, x: '55%', y: '85%', color: '#fbcfe8', delay: 1 },
  { size: 100, x: '40%', y: '5%', color: '#c7d2fe', delay: 3 },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-60 pointer-events-none"
          style={{ width: b.size, height: b.size, left: b.x, top: b.y, background: b.color }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5 + i * 0.7, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 max-w-2xl text-center">
        <div>
          <span className="inline-block text-4xl mb-4">✨</span>
          <h1 className="font-playfair text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
            Your baby&apos;s name<br />
            <span style={{ background: 'linear-gradient(to right, #a855f7, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              is already out there.
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-8 max-w-lg mx-auto">
            Instead of endless lists that mean nothing to you — let&apos;s have a real conversation.
            Tell me who you are, and I&apos;ll find names that actually <em>fit</em>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/quiz"
            className="inline-block px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:scale-105 transition-all duration-200"
            style={{ background: 'linear-gradient(to right, #a855f7, #f472b6)' }}
          >
            Let&apos;s find your name →
          </Link>
          <p className="text-sm text-gray-400">Takes about 2 minutes</p>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-center">
          {[
            { emoji: '💬', label: 'Real conversation' },
            { emoji: '🎯', label: 'Tailored to you' },
            { emoji: '✨', label: 'Explained clearly' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{f.emoji}</span>
              <span className="text-xs text-gray-500 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
