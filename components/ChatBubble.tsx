'use client';

import { motion } from 'framer-motion';
import { Message } from '@/lib/types';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
          HR
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-purple-50'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
