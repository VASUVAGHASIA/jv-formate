import React, { useState } from 'react';
import { AutoFormatOptions } from '../types/formatting';
import { DEFAULT_TEMPLATES, applyTemplateSettings } from '../utils/formatting/templateManager';

interface AutoFormatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (options: AutoFormatOptions) => void;
}

const AutoFormatModal: React.FC<AutoFormatModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [options, setOptions] = useState<AutoFormatOptions>({
        enableFonts: true,
        enableHeadings: true,
        enableSpacing: true,
        enableLists: true,
        enableTables: true,
        enableImages: true,
        enableMargins: false,
        enableAccessibility: false,
        enableGrammar: false,
        enableCitations: false,
        enablePdfRepair: false,
        mode: 'semi-auto',
        processingMode: 'local',
        templateId: 'standard'
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

    if (!isOpen) return null;

    const handleToggle = (key: keyof AutoFormatOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key as keyof AutoFormatOptions] }));
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTemplateId = e.target.value;
        const newOptions = applyTemplateSettings(options, newTemplateId);
        setOptions(newOptions);
    };

    const handleConfirm = () => {
        // Removed alert for smoother UX, assuming backup is handled or user is aware
        onConfirm(options);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>Auto-Format</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Configure formatting rules</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Template Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Formatting Template</label>
                        <select
                            value={options.templateId}
                            onChange={handleTemplateChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            {DEFAULT_TEMPLATES.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            {DEFAULT_TEMPLATES.find(t => t.id === options.templateId)?.description}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'basic'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Basic Rules
                            </button>
                            <button
                                onClick={() => setActiveTab('advanced')}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advanced'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Advanced & AI
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'basic' && (
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input type="checkbox" checked={options.enableFonts} onChange={() => handleToggle('enableFonts')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-8m4 8l-4-8m0 0v8" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Normalize Fonts</span>
                                        <span className="block text-[10px] text-gray-500">Standardize family & sizes</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input type="checkbox" checked={options.enableHeadings} onChange={() => handleToggle('enableHeadings')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Fix Headings</span>
                                        <span className="block text-[10px] text-gray-500">Detect & style levels</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input type="checkbox" checked={options.enableSpacing} onChange={() => handleToggle('enableSpacing')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Fix Spacing</span>
                                        <span className="block text-[10px] text-gray-500">Line & paragraph spacing</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input type="checkbox" checked={options.enableLists} onChange={() => handleToggle('enableLists')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Fix Lists</span>
                                        <span className="block text-[10px] text-gray-500">Bullets & numbering</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input type="checkbox" checked={options.enableTables} onChange={() => handleToggle('enableTables')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7-8v8m14-8v8M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Format Tables</span>
                                        <span className="block text-[10px] text-gray-500">Styles & borders</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input type="checkbox" checked={options.enableImages} onChange={() => handleToggle('enableImages')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Fix Images</span>
                                        <span className="block text-[10px] text-gray-500">Resize & center</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <input type="checkbox" checked={options.enableMargins} onChange={() => handleToggle('enableMargins')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Margins & Layout</span>
                                            <span className="block text-[10px] text-gray-500">Apply standard page setup</span>
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <input type="checkbox" checked={options.enablePdfRepair} onChange={() => handleToggle('enablePdfRepair')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">PDF Repair</span>
                                            <span className="block text-[10px] text-gray-500">Fix broken lines & hyphens</span>
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <input type="checkbox" checked={options.enableAccessibility} onChange={() => handleToggle('enableAccessibility')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Accessibility</span>
                                            <span className="block text-[10px] text-gray-500">Add alt text & language tags</span>
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <input type="checkbox" checked={options.enableCitations} onChange={() => handleToggle('enableCitations')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="p-1 bg-gray-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.248 6.253 2 10.502 2 15.5 2 20.498 6.248 24.747 12 24.747c5.752 0 10-4.249 10-9.247S17.752 6.253 12 6.253z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Citations</span>
                                            <span className="block text-[10px] text-gray-500">Normalize citation format</span>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Processing Mode</h4>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="processingMode"
                                            checked={options.processingMode === 'local'}
                                            onChange={() => setOptions(o => ({ ...o, processingMode: 'local' }))}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Local Only (Fast)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="processingMode"
                                            checked={options.processingMode === 'ai'}
                                            onChange={() => setOptions(o => ({ ...o, processingMode: 'ai' }))}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">AI Enhanced (Slower)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Execution Mode</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="formatMode"
                                            checked={options.mode === 'semi-auto'}
                                            onChange={() => setOptions(o => ({ ...o, mode: 'semi-auto' }))}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Semi-Automatic (Review changes before applying)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="formatMode"
                                            checked={options.mode === 'auto-fix'}
                                            onChange={() => setOptions(o => ({ ...o, mode: 'auto-fix' }))}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Auto-Fix All (Apply immediately)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="formatMode"
                                            checked={options.mode === 'suggest'}
                                            onChange={() => setOptions(o => ({ ...o, mode: 'suggest' }))}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Suggest Only (Show diffs, uncheck all by default)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}


                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Start Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoFormatModal;
