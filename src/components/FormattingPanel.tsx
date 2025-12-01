import React, { useState } from 'react';
import {
  setDocumentMargins,
  fixAllHeadings,
  normalizeDocumentFonts,
  updateAllFooters,
  updateAllHeaders,
  centerAllImages,
} from '../utils/wordUtils';
import AutoFormatModal from './AutoFormatModal';
import NormalizeFontsModal from './NormalizeFontsModal';
import MarginsModal from './MarginsModal';
import FormatProgressModal from './FormatProgressModal';
import FormatDiffViewer from './FormatDiffViewer';
import FormatSummary from './FormatSummary';
import { AutoFormatOptions, FormatChange, AuditEntry } from '../types/formatting';
import { buildDocumentModel } from '../utils/formatting/documentAnalyzer';
import { detectFontInconsistencies, detectHeadingProblems, detectSpacingIssues, detectImageProblems } from '../utils/formatting/problemDetector';
import { generateDiff } from '../utils/formatting/diffGenerator';
import { logFormatOperation } from '../utils/formatting/auditLogger';

/* global Word */

const FormattingPanel: React.FC = () => {
  const [headerLeftText, setHeaderLeftText] = useState('');
  const [headerRightText, setHeaderRightText] = useState('');
  const [footerLeftText, setFooterLeftText] = useState('');
  const [footerCenterText, setFooterCenterText] = useState('');
  const [footerRightText, setFooterRightText] = useState('');
  const [addPageNumbers, setAddPageNumbers] = useState(false);



  // Auto-Format State
  const [showAutoFormatModal, setShowAutoFormatModal] = useState(false);
  const [showNormalizeModal, setShowNormalizeModal] = useState(false);
  const [showMarginsModal, setShowMarginsModal] = useState(false);
  const [addFigureNumbers, setAddFigureNumbers] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [proposedChanges, setProposedChanges] = useState<FormatChange[]>([]);
  const [auditEntry, setAuditEntry] = useState<AuditEntry | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormatAction = async (action: () => Promise<void>, actionName: string) => {
    setIsProcessing(true);
    try {
      await action();
    } catch (error) {
      console.error(`${actionName} failed:`, error);
      // alert(`Error: ${error instanceof Error ? error.message : `Failed to ${actionName}`}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const startAutoFormat = () => {
    setShowAutoFormatModal(true);
  };

  const handleAutoFormatConfirm = async (options: AutoFormatOptions) => {
    setShowAutoFormatModal(false);
    setShowProgressModal(true);
    setProgress(0);
    setProgressStep('Initializing...');

    try {
      let changesToApply: FormatChange[] = [];

      const result = await Word.run(async (context) => {
        // 1. Analyze Document
        setProgressStep('Analyzing document structure...');
        setProgress(10);
        const model = await buildDocumentModel(context);
        setProgress(30);

        // 2. Detect Problems
        setProgressStep('Detecting formatting issues...');
        const problems = [
          ...detectFontInconsistencies(model),
          ...detectHeadingProblems(model),
          ...detectSpacingIssues(model),
          ...detectImageProblems(model)
        ];
        setProgress(60);

        // 3. Generate Diff
        setProgressStep('Generating proposed changes...');
        let changes = generateDiff(model, problems, options);

        // Handle "Suggest Only" mode - disable all by default
        if (options.mode === 'suggest') {
          changes = changes.map(c => ({ ...c, enabled: false }));
        }

        setProposedChanges(changes);
        setProgress(100);

        // Handle "Auto-Fix All" mode - apply immediately
        if (options.mode === 'auto-fix') {
          return changes;
        }
        return null;
      });

      changesToApply = result || [];

      // Short delay to show 100%
      setTimeout(async () => {
        if (options.mode === 'auto-fix' && changesToApply.length > 0) {
          setShowProgressModal(false);
          await handleApplyChanges(changesToApply.filter(c => c.enabled));
        } else {
          setShowProgressModal(false);
          setShowDiffViewer(true);
        }
      }, 500);

    } catch (error) {
      console.error('Auto-format analysis failed:', error);
      setShowProgressModal(false);
      alert('Analysis failed. Please try again.');
    }
  };

  const handleNormalizeConfirm = async (fontName: string, fontSize: number) => {
    setShowNormalizeModal(false);
    await handleFormatAction(
      () => normalizeDocumentFonts(fontName, fontSize),
      'Normalize fonts'
    );
  };

  const handleMarginsConfirm = async (margins: { top: number; bottom: number; left: number; right: number }) => {
    setShowMarginsModal(false);
    await handleFormatAction(
      () => setDocumentMargins(margins),
      'Set margins'
    );
  };

  const handleImageClick = async () => {
    await handleFormatAction(
      () => centerAllImages(12, addFigureNumbers, 'centered'),
      'Format images'
    );
  };

  const handleApplyChanges = async (selectedChanges: FormatChange[]) => {
    setShowDiffViewer(false);
    setShowProgressModal(true);
    setProgress(0);
    setProgressStep('Applying changes...');

    const startTime = Date.now();
    let appliedCount = 0;

    try {
      const total = selectedChanges.length;

      for (let i = 0; i < total; i++) {
        const change = selectedChanges[i];
        setProgressStep(`Applying: ${change.description}`);
        await change.applyFn();
        appliedCount++;
        setProgress(((i + 1) / total) * 100);
      }

      const duration = Date.now() - startTime;

      const entry: AuditEntry = {
        timestamp: new Date(),
        changesApplied: appliedCount,
        categories: Array.from(new Set(selectedChanges.map(c => c.category))),
        durationMs: duration
      };

      setAuditEntry(entry);
      logFormatOperation(entry);

      setTimeout(() => {
        setShowProgressModal(false);
        setShowSummary(true);
      }, 500);

    } catch (error) {
      console.error('Applying changes failed:', error);
      setShowProgressModal(false);
      alert('Some changes could not be applied.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 space-y-4">

        {/* Document-Wide Actions */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Document Actions</span>
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleFormatAction(fixAllHeadings, 'Fix all headings')}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Fix All Headings
            </button>
            <button
              onClick={() => setShowNormalizeModal(true)}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Normalize Fonts
            </button>
            <button
              onClick={() => setShowMarginsModal(true)}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Set Margins
            </button>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  id="addFigureNumbers"
                  checked={addFigureNumbers}
                  onChange={(e) => setAddFigureNumbers(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="addFigureNumbers" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                  Add Figure Numbers (Figure 1, 2...)
                </label>
              </div>
              <button
                onClick={handleImageClick}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Format Images
              </button>
            </div>
          </div>
        </div>

        {/* Headers & Footers */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm">Headers & Footers</span>
          </h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={headerLeftText}
                  onChange={(e) => setHeaderLeftText(e.target.value)}
                  placeholder="Header Left..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="text"
                  value={headerRightText}
                  onChange={(e) => setHeaderRightText(e.target.value)}
                  placeholder="Header Right..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => handleFormatAction(
                  () => updateAllHeaders(headerLeftText, headerRightText),
                  'Update headers'
                )}
                disabled={isProcessing || (!headerLeftText && !headerRightText)}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Update All Headers
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={footerLeftText}
                  onChange={(e) => setFooterLeftText(e.target.value)}
                  placeholder="Left..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="text"
                  value={footerCenterText}
                  onChange={(e) => setFooterCenterText(e.target.value)}
                  placeholder="Center..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="text"
                  value={footerRightText}
                  onChange={(e) => setFooterRightText(e.target.value)}
                  placeholder="Right..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2 px-1 py-1">
                <input
                  type="checkbox"
                  id="addPageNumbers"
                  checked={addPageNumbers}
                  onChange={(e) => setAddPageNumbers(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="addPageNumbers" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                  Add Page Numbers (overrides Center text)
                </label>
              </div>

              <button
                onClick={() => handleFormatAction(
                  () => updateAllFooters(footerLeftText, footerCenterText, footerRightText, addPageNumbers),
                  'Update footers'
                )}
                disabled={isProcessing || (!footerLeftText && !footerCenterText && !footerRightText && !addPageNumbers)}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Update All Footers
              </button>
            </div>
          </div>
        </div>

        {/* Auto Format - Compact & Professional */}
        <div className="pt-2">
          <button
            onClick={startAutoFormat}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm">Auto-Format Document</span>
          </button>
        </div>

      </div>

      {/* Modals */}
      <AutoFormatModal
        isOpen={showAutoFormatModal}
        onClose={() => setShowAutoFormatModal(false)}
        onConfirm={handleAutoFormatConfirm}
      />

      <NormalizeFontsModal
        isOpen={showNormalizeModal}
        onClose={() => setShowNormalizeModal(false)}
        onConfirm={handleNormalizeConfirm}
      />

      <MarginsModal
        isOpen={showMarginsModal}
        onClose={() => setShowMarginsModal(false)}
        onConfirm={handleMarginsConfirm}
      />

      <FormatProgressModal
        isOpen={showProgressModal}
        progress={progress}
        currentStep={progressStep}
        onCancel={() => setShowProgressModal(false)}
      />

      <FormatDiffViewer
        isOpen={showDiffViewer}
        changes={proposedChanges}
        onClose={() => setShowDiffViewer(false)}
        onApply={handleApplyChanges}
      />

      <FormatSummary
        isOpen={showSummary}
        auditEntry={auditEntry}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
};

export default FormattingPanel;
