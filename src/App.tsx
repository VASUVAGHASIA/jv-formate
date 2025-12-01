import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import LoginButton from './components/LoginButton';

import FormattingPanel from './components/FormattingPanel';
import ApiKeyInput from './components/ApiKeyInput';
import { useAuth } from './contexts/AuthContext';
import { hasApiKey } from './utils/gemini';

type Tab = 'chat' | 'format';

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [hasKey, setHasKey] = useState(hasApiKey());
  const [showKeyModal, setShowKeyModal] = useState(!hasApiKey());

  const handleKeySet = () => {
    setHasKey(true);
    setShowKeyModal(false);
  };

  // For API Key mode, we don't need login - but keep the UI for future OAuth if needed
  const showLoginScreen = false; // Set to true if you want to require Google OAuth

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative">
      {showKeyModal && (
        <ApiKeyInput
          onKeySet={handleKeySet}
          onClose={() => setShowKeyModal(false)}
        />
      )}


      {/* Login Screen - Optional */}
      {showLoginScreen && !isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Assistant</h2>
              <p className="text-gray-600 mb-6">
                Sign in with Google to unlock powerful AI features for your documents
              </p>
            </div>
            <LoginButton />
            <div className="mt-6 text-xs text-gray-500">
              <p>This add-in uses Google OAuth and Gemini AI</p>
              <p>Your credentials are never stored</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 px-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 font-medium text-xs transition-colors ${activeTab === 'chat'
                  ? 'text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>Chat</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('format')}
                className={`px-3 py-2 font-medium text-xs transition-colors ${activeTab === 'format'
                  ? 'text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Format</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && <ChatWindow />}

            {activeTab === 'format' && <FormattingPanel />}
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Powered by Gemini AI</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowKeyModal(true)}
                  className={`hover:text-gray-600 ${!hasKey ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                  title={hasKey ? "Change API Key" : "Set API Key"}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
