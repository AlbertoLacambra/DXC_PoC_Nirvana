'use client';

import { useState } from 'react';
import { DifyClient } from '@/lib/dify-client';

export default function TestChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      // Inicializar cliente Dify
      const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_DIFY_API_URL;

      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_DIFY_API_KEY no está configurada. Revisa tu archivo .env.local');
      }

      const client = new DifyClient({
        apiKey: apiKey,
        baseUrl: apiUrl,
      });

      // Enviar mensaje a Dify
      const response = await client.sendMessage(userMessage, conversationId);

      // Guardar conversation_id para contexto
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Agregar respuesta
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      setError(err.message || 'Error al comunicarse con Dify');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${err.message || 'No se pudo conectar con Dify'}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/dxc-logo.svg" 
                alt="DXC Technology" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/dxc-logo.png';
                  e.currentTarget.onerror = null;
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  DXC Cloud Mind - Nirvana
                </h1>
                <p className="text-sm text-gray-500">Test de Integración con Dify</p>
              </div>
            </div>
            <a 
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Volver al inicio
            </a>
          </div>
          {conversationId && (
            <p className="text-xs text-green-600 mt-2">
              ✅ Conversación activa: {conversationId.slice(0, 8)}...
            </p>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-lg">👋 ¡Hola! Envía un mensaje para probar la integración.</p>
                <p className="text-sm mt-2">Ejemplos:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• "¿Qué es Kubernetes?"</li>
                  <li>• "Dame un ejemplo de código Python"</li>
                  <li>• "Explica qué es FinOps"</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {msg.role === 'user' ? '👤 Tú' : '🤖 Asistente'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600 animate-pulse">🤖 Pensando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-2 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳' : '📤'} Enviar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Presiona Enter para enviar • Shift+Enter para nueva línea
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-2">🔧 Debug Info:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• API Key configurada: {process.env.NEXT_PUBLIC_DIFY_API_KEY ? '✅ Sí' : '❌ No'}</p>
            <p>• API URL: {process.env.NEXT_PUBLIC_DIFY_API_URL || 'No configurada'}</p>
            <p>• Conversation ID: {conversationId || 'No iniciada'}</p>
            <p>• Total mensajes: {messages.length}</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} DXC Technology. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Developed by <span className="font-semibold text-blue-600">DXC Cloud Team</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
