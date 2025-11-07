'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ChatMode {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  model_config: {
    model: string;
    temperature?: number;
    max_tokens?: number;
  };
  tags: string[];
  tools: string[];
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface Session {
  id: string;
  chatmode_id: string;
  messages: Message[];
  metadata: any;
  status: 'active' | 'completed';
  started_at: string;
  duration_seconds?: number;
}

export default function ChatSessionPage() {
  const params = useParams();
  const [chatMode, setChatMode] = useState<ChatMode | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchChatMode(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatMode = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agent-hub/chatmodes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setChatMode(data);
        // Create a new session
        await createSession(id, data.system_prompt);
      }
    } catch (error) {
      console.error('Error fetching chat mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (chatmodeId: string, systemPrompt: string) => {
    try {
      const response = await fetch(`/api/agent-hub/chatmodes/${chatmodeId}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initial_message: null,
          metadata: { source: 'web-ui' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        // Show system prompt as first message
        setMessages([
          {
            role: 'system',
            content: systemPrompt,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session || !chatMode) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await fetch(
        `/api/agent-hub/chatmodes/${chatMode.id}/sessions/${session.id}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Add assistant response
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chatMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-900">Chat Mode Not Found</h2>
        <Link href="/agent-hub/chatmodes" className="mt-4 text-blue-600 hover:text-blue-700">
          Back to Chat Modes
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/agent-hub/chatmodes"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">{chatMode.name}</h1>
                </div>
                <p className="text-sm text-gray-500">{chatMode.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatMode.model_config?.model && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {chatMode.model_config.model}
                </span>
              )}
              {session && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {sending && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <CpuChipIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: '52px', maxHeight: '200px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || sending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {chatMode.tools && chatMode.tools.length > 0 && (
              <span>Tools available: {chatMode.tools.join(', ')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'system') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <SparklesIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-blue-900 mb-1">System Prompt</div>
            <div className="text-sm text-blue-800 whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      </div>
    );
  }

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="flex-1 max-w-3xl bg-blue-600 text-white rounded-lg p-4">
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          {message.timestamp && (
            <div className="text-xs text-blue-100 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-white" />
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
        <CpuChipIcon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 max-w-3xl bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</div>
        {message.timestamp && (
          <div className="text-xs text-gray-500 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
