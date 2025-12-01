import { improveWriting as aiImproveWriting, summarizeText as aiSummarizeText, formatText as aiFormatText } from '../utils/gemini';
import { getSelectedText, replaceSelectedText } from '../utils/wordUtils';

/* global Office */

/**
 * Improve writing - Context menu command
 */
export async function improveWriting(event: Office.AddinCommands.Event) {
  try {
    const selectedText = await getSelectedText();
    
    if (!selectedText || selectedText.trim() === '') {
      showNotification('Error', 'Please select some text first');
      event.completed();
      return;
    }

    showNotification('Processing...', 'Improving your writing with AI');
    
    const improvedText = await aiImproveWriting(selectedText);
    await replaceSelectedText(improvedText);
    
    showNotification('Success', 'Text improved successfully!');
  } catch (error) {
    console.error('Improve writing failed:', error);
    showNotification('Error', error instanceof Error ? error.message : 'Failed to improve writing');
  }
  
  event.completed();
}

/**
 * Summarize selection - Context menu command
 */
export async function summarizeSelection(event: Office.AddinCommands.Event) {
  try {
    const selectedText = await getSelectedText();
    
    if (!selectedText || selectedText.trim() === '') {
      showNotification('Error', 'Please select some text first');
      event.completed();
      return;
    }

    showNotification('Processing...', 'Generating summary with AI');
    
    const summary = await aiSummarizeText(selectedText);
    await replaceSelectedText(summary);
    
    showNotification('Success', 'Text summarized successfully!');
  } catch (error) {
    console.error('Summarize failed:', error);
    showNotification('Error', error instanceof Error ? error.message : 'Failed to summarize');
  }
  
  event.completed();
}

/**
 * Format section - Context menu command
 */
export async function formatSection(event: Office.AddinCommands.Event) {
  try {
    const selectedText = await getSelectedText();
    
    if (!selectedText || selectedText.trim() === '') {
      showNotification('Error', 'Please select some text first');
      event.completed();
      return;
    }

    showNotification('Processing...', 'Formatting section with AI');
    
    const formattedText = await aiFormatText(selectedText);
    await replaceSelectedText(formattedText);
    
    showNotification('Success', 'Section formatted successfully!');
  } catch (error) {
    console.error('Format section failed:', error);
    showNotification('Error', error instanceof Error ? error.message : 'Failed to format section');
  }
  
  event.completed();
}

/**
 * Show notification to user
 */
function showNotification(title: string, message: string) {
  Office.context.ui.displayDialogAsync(
    `data:text/html,<html><head><style>body{font-family:sans-serif;padding:20px;}</style></head><body><h3>${title}</h3><p>${message}</p></body></html>`,
    { height: 30, width: 30 }
  );
}

// Register command functions
Office.actions.associate('improveWriting', improveWriting);
Office.actions.associate('summarizeSelection', summarizeSelection);
Office.actions.associate('formatSection', formatSection);
