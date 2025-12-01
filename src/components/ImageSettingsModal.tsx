import React, { useState } from 'react';

interface ImageSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (padding: number, alignment: 'left' | 'centered' | 'right') => void;
}

const ImageSettingsModal: React.FC<ImageSettingsModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [padding, setPadding] = useState('12');
    const [alignment, setAlignment] = useState<'left' | 'centered' | 'right'>('centered');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(parseInt(padding), alignment);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Format Images</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Configure alignment and spacing for all images in the document.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setAlignment('left')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${alignment === 'left' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Left
                            </button>
                            <button
                                onClick={() => setAlignment('centered')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${alignment === 'centered' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Center
                            </button>
                            <button
                                onClick={() => setAlignment('right')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${alignment === 'right' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Right
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Padding (Top & Bottom)</label>
                        <select
                            value={padding}
                            onChange={(e) => setPadding(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="6">Small (6pt)</option>
                            <option value="12">Medium (12pt)</option>
                            <option value="24">Large (24pt)</option>
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

export default ImageSettingsModal;
