import React from 'react';

interface FormatProgressModalProps {
    isOpen: boolean;
    progress: number;
    currentStep: string;
    onCancel: () => void;
}

const FormatProgressModal: React.FC<FormatProgressModalProps> = ({
    isOpen,
    progress,
    currentStep,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Document</h3>

                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{currentStep}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormatProgressModal;
