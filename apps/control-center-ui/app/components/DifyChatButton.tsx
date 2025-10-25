'use client';

import { useState } from 'react';

export default function DifyChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  const DIFY_URL = process.env.NEXT_PUBLIC_DIFY_URL || 'http://10.0.2.91';
  const DIFY_APP_CODE = process.env.NEXT_PUBLIC_DIFY_APP_CODE || '7C9Ppi4gev9j1h7p';
  const chatbotUrl = `${DIFY_URL}/chatbot/${DIFY_APP_CODE}`;

  const handleOpenChat = () => {
    // Abrir en nueva ventana
    window.open(chatbotUrl, 'dify-chat', 'width=400,height=600,resizable=yes');
  };

  const handleToggleIframe = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleToggleIframe}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-110"
        title="Chat con Nirvana Assistant"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor" 
          className="w-6 h-6"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" 
          />
        </svg>
      </button>

      {/* Iframe flotante */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" 
                />
              </svg>
              <span className="font-semibold">Nirvana Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Abrir en nueva ventana"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" 
                  />
                </svg>
              </button>
              <button
                onClick={handleToggleIframe}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Cerrar"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Iframe del chatbot */}
          <iframe
            src={chatbotUrl}
            className="w-full h-[calc(100%-56px)]"
            frameBorder="0"
            allow="microphone"
            title="Nirvana Tech Support Assistant"
          />
        </div>
      )}
    </>
  );
}
