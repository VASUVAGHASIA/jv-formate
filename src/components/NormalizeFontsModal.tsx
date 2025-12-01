import React, { useState } from 'react';

interface NormalizeFontsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (fontName: string, fontSize: number) => void;
}

const NormalizeFontsModal: React.FC<NormalizeFontsModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [fontName, setFontName] = useState('Calibri');
    const [fontSize, setFontSize] = useState('12');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(fontName, parseInt(fontSize));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Normalize Fonts</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Select the standard font for body text. Headings and code blocks will be preserved.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                        <select
                            value={fontName}
                            onChange={(e) => setFontName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Calibri">Calibri</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Arial">Arial</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Roboto">Roboto</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (pt)</label>
                        <select
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="14">14</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NormalizeFontsModal;
