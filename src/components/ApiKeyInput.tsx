import React, { useState } from 'react';
import { setApiKey } from '../utils/gemini';

interface ApiKeyInputProps {
    onKeySet: () => void;
    onClose: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySet, onClose }) => {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim()) {
            setError('Please enter a valid API Key');
            return;
        }

        // Basic validation (Gemini keys usually start with AIza)
        if (!key.startsWith('AIza')) {
            setError('Invalid key format. It should start with "AIza"');
            return;
        }

        setApiKey(key.trim());
        onKeySet();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 text-center relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-1">Enter API Key</h2>
                <p className="text-xs text-gray-500 mb-4">
                    To use AI features, please provide your Gemini API Key.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value);
                                setError('');
                            }}
                            placeholder="Paste your API Key here"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                        {error && <p className="text-xs text-red-500 mt-1 text-left">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                        Start Using Add-in
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                    >
                        Get a free API Key
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyInput;
