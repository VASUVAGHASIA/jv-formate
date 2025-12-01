import React, { useState } from 'react';

interface MarginsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (margins: { top: number; bottom: number; left: number; right: number }) => void;
}

const MarginsModal: React.FC<MarginsModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedPreset, setSelectedPreset] = useState<'normal' | 'narrow' | 'wide'>('normal');

    if (!isOpen) return null;

    const handleConfirm = () => {
        let margins = { top: 72, bottom: 72, left: 72, right: 72 }; // Normal (1 inch)

        if (selectedPreset === 'narrow') {
            margins = { top: 36, bottom: 36, left: 36, right: 36 }; // Narrow (0.5 inch)
        } else if (selectedPreset === 'wide') {
            margins = { top: 72, bottom: 72, left: 144, right: 144 }; // Wide (2 inch sides)
        }

        onConfirm(margins);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Set Margins</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Select standard margins for the entire document.
                    </p>

                    <div className="space-y-3">
                        <div
                            onClick={() => setSelectedPreset('normal')}
                            className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${selectedPreset === 'normal' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div>
                                <div className="font-medium text-gray-900">Normal</div>
                                <div className="text-xs text-gray-500">Top/Bottom: 1" • Left/Right: 1"</div>
                            </div>
                            {selectedPreset === 'normal' && <span className="text-blue-600">✓</span>}
                        </div>

                        <div
                            onClick={() => setSelectedPreset('narrow')}
                            className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${selectedPreset === 'narrow' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div>
                                <div className="font-medium text-gray-900">Narrow</div>
                                <div className="text-xs text-gray-500">Top/Bottom: 0.5" • Left/Right: 0.5"</div>
                            </div>
                            {selectedPreset === 'narrow' && <span className="text-blue-600">✓</span>}
                        </div>

                        <div
                            onClick={() => setSelectedPreset('wide')}
                            className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${selectedPreset === 'wide' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div>
                                <div className="font-medium text-gray-900">Wide</div>
                                <div className="text-xs text-gray-500">Top/Bottom: 1" • Left/Right: 2"</div>
                            </div>
                            {selectedPreset === 'wide' && <span className="text-blue-600">✓</span>}
                        </div>
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

export default MarginsModal;
