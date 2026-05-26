'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble } from '@/components/ChatBubble';
import { NameCard } from '@/components/NameCard';
import { TypingIndicator } from '@/components/TypingIndicator';
import { Message, QuizAnswers, NameSuggestion } from '@/lib/types';

const NAME_TAG_RE = /<name-suggestion>\s*([\s\S]*?)\s*<\/name-suggestion>/g;

function parseNameSuggestions(text: string): { suggestions: NameSuggestion[]; cleaned: string } {
  const suggestions: NameSuggestion[] = [];
  const cleaned = text.replace(NAME_TAG_RE, (_, json) => {
    try {
      const s = JSON.parse(json.trim());
      if (s.name && s.why && s.origin && Array.isArray(s.tags)) {
        suggestions.push(s as NameSuggestion);
      }
    } catch {
      // ignore malformed
    }
    return '';
  }).trim();
  return { suggestions, cleaned };
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<NameSuggestion[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    try {
      const parsed = JSON.parse(atob(q)) as QuizAnswers;
      setQuizAnswers(parsed);
    } catch {
      // ignore
    }
  }, [searchParams]);

  const sendMessage = useCallback(
    async (userText?: string) => {
      if (!quizAnswers) return;
      const isOpening = !userText;
      const outgoing: Message[] = isOpening
        ? [{ role: 'user' as const, content: 'Hi! Please introduce yourself and get our conversation started.' }]
        : [...messages, { role: 'user' as const, content: userText! }];

      if (!isOpening) {
        setMessages((prev) => [...prev, { role: 'user' as const, content: userText! }]);
        setInput('');
      }

      setIsStreaming(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: outgoing, quizAnswers }),
        });

        if (!res.ok) {
          const errText = await res.text();
          let errMsg = 'Something went wrong on the server.';
          try { errMsg = JSON.parse(errText).error; } catch { /* use default */ }
          setMessages((prev) => [
            ...prev,
            { role: 'assistant' as const, content: `⚠️ ${errMsg}` },
          ]);
          return;
        }

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        setMessages((prev) => [
          ...prev,
          { role: 'assistant' as const, content: '' },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: accumulated };
            return updated;
          });

          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        // parse out name suggestions from final accumulated text
        const { suggestions, cleaned } = parseNameSuggestions(accumulated);
        if (suggestions.length > 0) {
          setNameSuggestions((prev) => [...prev, ...suggestions]);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: cleaned };
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [quizAnswers, messages]
  );

  // kick off opening message once quiz answers are loaded
  useEffect(() => {
    if (quizAnswers && !hasStarted) {
      setHasStarted(true);
      sendMessage();
    }
  }, [quizAnswers, hasStarted, sendMessage]);

  function toggleFavorite(name: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isStreaming) {
      sendMessage(input.trim());
    }
  }

  return (
    <main className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* header */}
      <header className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          HR
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Humble Reddy</p>
          <p className="text-xs text-gray-400">Your personal name guide</p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* chat column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatBubble key={i} message={msg} />
              ))}
            </AnimatePresence>

            {isStreaming && messages.length === 0 && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* input bar */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-purple-100 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 bg-white rounded-full border-2 border-purple-200 focus-within:border-purple-400 transition-colors shadow-sm px-4 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me more, or ask for names..."
                disabled={isStreaming}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={() => input.trim() && !isStreaming && sendMessage(input.trim())}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center text-white disabled:opacity-40 transition-opacity flex-shrink-0"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* name cards sidebar — only visible when names exist */}
        <AnimatePresence>
          {nameSuggestions.length > 0 && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex-shrink-0 border-l border-purple-100 bg-white/60 backdrop-blur-sm overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-playfair text-lg font-bold text-gray-900">Your Names</h2>
                  {favorites.size > 0 && (
                    <span className="text-xs text-purple-500 font-semibold">
                      {favorites.size} saved ♥
                    </span>
                  )}
                </div>
                {nameSuggestions.map((s, i) => (
                  <NameCard
                    key={`${s.name}-${i}`}
                    suggestion={s}
                    index={i}
                    isFavorited={favorites.has(s.name)}
                    onToggleFavorite={() => toggleFavorite(s.name)}
                  />
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
