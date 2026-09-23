'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AiService, ChatMessage } from '@/services/ai.service';

interface ChatBotProps {
  projectId: number;
}

export default function ChatBot({ projectId }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load lịch sử chat khi mở panel
  useEffect(() => {
    if (isOpen && !isHistoryLoaded) {
      AiService.getChatHistory(projectId)
        .then((history) => {
          setMessages(history);
          setIsHistoryLoaded(true);
        })
        .catch(() => {
          // Nếu lỗi thì bỏ qua, bắt đầu chat mới
          setIsHistoryLoaded(true);
        });
    }
  }, [isOpen, isHistoryLoaded, projectId]);

  // Focus input khi mở
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Thêm tin nhắn user
    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);

    // Tạo placeholder cho AI response
    const aiMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, aiMsg]);

    // Gửi câu hỏi qua SSE
    abortRef.current = AiService.sendMessage(
      projectId,
      question,
      // onChunk: nhận từng đoạn text
      (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + chunk,
            };
          }
          return updated;
        });
      },
      // onDone: hoàn thành
      (referencedDocs) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              referencedDocs: JSON.stringify(referencedDocs),
            };
          }
          return updated;
        });
        setIsLoading(false);
      },
      // onError
      (error) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: `❌ ${error}`,
            };
          }
          return updated;
        });
        setIsLoading(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) return;
    try {
      await AiService.clearHistory(projectId);
      setMessages([]);
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsOpen(false);
  };

  // Parse referenced docs từ JSON string
  const parseReferencedDocs = (json?: string): string[] => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  // Render simple markdown (bold, italic, code, lists)
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) return <h4 key={i} className="font-bold text-sm mt-2 mb-1">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-base mt-2 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-2 mb-1">{line.slice(2)}</h2>;
        
        // Bullet lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>;
        }
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s/);
        if (numberedMatch) {
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.slice(numberedMatch[0].length))}</li>;
        }
        // Code blocks
        if (line.startsWith('```')) return null;
        // Empty lines
        if (line.trim() === '') return <br key={i} />;
        // Regular text
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>;
      });
  };

  // Format inline markdown (bold, italic, code)
  const formatInline = (text: string): React.ReactNode => {
    const parts: (string | React.ReactElement)[] = [];
    let remaining = text;
    let keyCounter = 0;

    while (remaining.length > 0) {
      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Bold
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      let firstMatch: { match: RegExpMatchArray; type: string } | null = null;
      
      if (codeMatch && codeMatch.index !== undefined) {
        firstMatch = { match: codeMatch, type: 'code' };
      }
      if (boldMatch && boldMatch.index !== undefined) {
        if (!firstMatch || boldMatch.index < firstMatch.match.index!) {
          firstMatch = { match: boldMatch, type: 'bold' };
        }
      }

      if (firstMatch && firstMatch.match.index !== undefined) {
        // Add text before match
        if (firstMatch.match.index > 0) {
          parts.push(remaining.slice(0, firstMatch.match.index));
        }
        // Add formatted element
        if (firstMatch.type === 'code') {
          parts.push(
            <code key={keyCounter++} className="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs font-mono text-red-600 dark:text-red-300">
              {firstMatch.match[1]}
            </code>
          );
        } else if (firstMatch.type === 'bold') {
          parts.push(<strong key={keyCounter++}>{firstMatch.match[1]}</strong>);
        }
        remaining = remaining.slice(firstMatch.match.index + firstMatch.match[0].length);
      } else {
        parts.push(remaining);
        break;
      }
    }

    return <>{parts}</>;
  };

  return (
    <>
      {/* ===== FLOATING CHAT BUTTON ===== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Chat with AI"
          id="ai-chat-toggle"
        >
          {/* Sparkle icon */}
          <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {/* Pulse animation */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* ===== CHAT PANEL ===== */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[100dvh] sm:h-[600px] sm:max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in">
          
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">KBase AI Assistant</h3>
                <p className="text-xs text-red-100">Hỏi đáp dựa trên tài liệu dự án</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  title="Xóa lịch sử"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Đóng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ---- Messages ---- */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Xin chào! 👋
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Tôi là AI Assistant của KBase. Hãy hỏi tôi về nội dung tài liệu trong dự án này!
                </p>
                <div className="space-y-2 w-full">
                  {[
                    'Tóm tắt nội dung các tài liệu',
                    'Tìm thông tin về...',
                    'So sánh giữa...',
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const referencedDocs = parseReferencedDocs(msg.referencedDocs);
              
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
                    {/* Avatar + Message */}
                    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                      }`}>
                        {isUser ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`px-3.5 py-2.5 rounded-2xl ${
                        isUser
                          ? 'bg-red-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-sm'
                      }`}>
                        {isUser ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {msg.content ? renderMarkdown(msg.content) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <div className="flex gap-1">
                                  <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs">Đang suy nghĩ...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Referenced Documents */}
                    {!isUser && referencedDocs.length > 0 && (
                      <div className="mt-2 ml-9">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Nguồn:</span>
                          {referencedDocs.map((doc, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-[11px] font-medium border border-blue-100 dark:border-blue-800"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input Area ---- */}
          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none px-3.5 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 max-h-24 overflow-y-auto"
                style={{
                  minHeight: '40px',
                  height: 'auto',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '40px';
                  target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed hover:shadow-md active:scale-95 shrink-0"
                title="Gửi"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Powered by Gemini AI • Enter để gửi, Shift+Enter xuống dòng
            </p>
          </div>
        </div>
      )}

      {/* ===== ANIMATIONS (CSS-in-JS) ===== */}
      <style jsx global>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
