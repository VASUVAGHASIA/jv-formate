import React, { useState, useMemo } from 'react';
import { FormatChange } from '../types/formatting';

interface FormatDiffViewerProps {
    isOpen: boolean;
    changes: FormatChange[];
    onClose: () => void;
    onApply: (selectedChanges: FormatChange[]) => void;
}

const FormatDiffViewer: React.FC<FormatDiffViewerProps> = ({
    isOpen,
    changes,
    onClose,
    onApply
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(changes.map(c => c.id)));
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const categories = useMemo(() => {
        const cats = new Set(changes.map(c => c.category));
        return ['All', ...Array.from(cats)];
    }, [changes]);

    const filteredChanges = useMemo(() => {
        if (activeCategory === 'All') return changes;
        return changes.filter(c => c.category === activeCategory);
    }, [changes, activeCategory]);

    if (!isOpen) return null;

    const toggleChange = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleCategory = (category: string, select: boolean) => {
        const newSelected = new Set(selectedIds);
        changes
            .filter(c => c.category === category)
            .forEach(c => {
                if (select) newSelected.add(c.id);
                else newSelected.delete(c.id);
            });
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        const newSelected = new Set(changes.map(c => c.id));
        setSelectedIds(newSelected);
    };

    const handleApply = () => {
        const selectedChanges = changes.filter(c => selectedIds.has(c.id));
        onApply(selectedChanges);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span>✨</span> Review
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {selectedIds.size}/{changes.length} selected
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={selectAll}
                            className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 px-2 py-1.5 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
                        >
                            Select All
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Category Tabs (Horizontal Scroll) */}
                <div className="bg-white border-b border-gray-100 px-4 py-2 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-hide">
                    <div className="flex gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeCategory === category
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{category}</span>
                                {category !== 'All' && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === category
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {changes.filter(c => c.category === category).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main List */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50/50">
                    {filteredChanges.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm">No changes found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeCategory !== 'All' && (
                                <div className="flex justify-end space-x-2 mb-1">
                                    <button
                                        onClick={() => toggleCategory(activeCategory, true)}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded hover:bg-primary-100 transition-colors"
                                    >
                                        Select All in {activeCategory}
                                    </button>
                                    <button
                                        onClick={() => toggleCategory(activeCategory, false)}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            )}

                            {filteredChanges.map(change => (
                                <div
                                    key={change.id}
                                    className={`group bg-white border rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ${selectedIds.has(change.id)
                                        ? 'border-primary-200 ring-1 ring-primary-100'
                                        : 'border-gray-100 opacity-80 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(change.id)}
                                                onChange={() => toggleChange(change.id)}
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer transition-colors"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                                                <h4 className={`text-sm sm:text-base font-semibold text-gray-900 ${selectedIds.has(change.id) ? '' : 'text-gray-600'}`}>
                                                    {change.description}
                                                </h4>
                                                <span className="self-start shrink-0 text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                                    {change.category}
                                                </span>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                                <div className="bg-red-50/50 p-2 sm:p-3 rounded-lg border border-red-100/50">
                                                    <span className="block text-[10px] uppercase tracking-wider font-bold text-red-600/70 mb-1">Original</span>
                                                    <p className="text-red-900/80 font-medium break-words">{change.before}</p>
                                                </div>
                                                <div className="bg-green-50/50 p-2 sm:p-3 rounded-lg border border-green-100/50">
                                                    <span className="block text-[10px] uppercase tracking-wider font-bold text-green-600/70 mb-1">New</span>
                                                    <p className="text-green-900/80 font-medium break-words">{change.after}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] shrink-0">
                    <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                        {selectedIds.size > 0 ? (
                            <span>Ready to apply <strong className="text-gray-900">{selectedIds.size}</strong> changes</span>
                        ) : (
                            <span>Select changes to apply</span>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={selectedIds.size === 0}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm"
                        >
                            <span>Apply</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormatDiffViewer;
