import React from 'react';
import { AuditEntry } from '../types/formatting';

interface FormatSummaryProps {
    isOpen: boolean;
    auditEntry: AuditEntry | null;
    onClose: () => void;
}

const FormatSummary: React.FC<FormatSummaryProps> = ({ isOpen, auditEntry, onClose }) => {
    if (!isOpen || !auditEntry) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Formatting Complete!</h2>
                    <p className="text-gray-600 mt-2">
                        Successfully applied {auditEntry.changesApplied} changes in {Math.round(auditEntry.durationMs / 1000)} seconds.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Changes by Category</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {auditEntry.categories.map(category => (
                            <div key={category} className="flex items-center space-x-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{category}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Not happy with the result?</p>
                        <p>Use <span className="font-bold">Ctrl + Z</span> (Cmd + Z on Mac) in Word to undo changes.</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-primary-600 text-white rounded-md py-2 hover:bg-primary-700 font-medium transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default FormatSummary;
