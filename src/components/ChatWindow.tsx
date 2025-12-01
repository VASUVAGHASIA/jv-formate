/* global Word */
import React, { useState, useRef, useEffect } from 'react';
import { generateActionableContent, listModels, type AttachedFile as GeminiAttachedFile } from '../utils/gemini';
import { parseMarkdownToHtml } from '../utils/markdownParser';
import {
  replaceSelectedTextWithHtml,
  getSelectedText,
  formatSelection,
  formatDocument,
  getDocumentStats,
  getFullDocumentText,
  fixAllHeadings,
  normalizeDocumentFonts,
  setDocumentMargins,
  centerAllImages,
  updateAllHeaders,
  updateAllFooters,
  applyBulletList,
  applyNumberedList,
  clearFormatting,
  autoFormatDocument,
  addBorderToSelection,
  addPageBorder,
  addBorderToParagraphs,
  removeBorders,
  addDecorativeBorder
} from '../utils/wordUtils';

type AttachedFile = GeminiAttachedFile;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionPerformed?: string;
  addedToDoc?: boolean;
  insertedRangeId?: string;
  payload?: string;
  attachedFiles?: AttachedFile[];
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontName?: string;
    fontSize?: number;
    color?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    lineSpacing?: number;
    spaceAfter?: number;
    spaceBefore?: number;
  };
}

type ChatMode = 'ask' | 'edit';

export type GeminiModel =
  | 'gemini-2.0-flash-exp'
  | 'gemini-2.0-flash-lite'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-flash-8b'
  | 'gemini-1.5-pro';

const ChatWindow: React.FC = () => {
  const [chatMode, setChatMode] = useState<ChatMode>('ask');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.0-flash-lite');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canReadDocument, setCanReadDocument] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch available models on component mount
    const fetchModels = async () => {
      try {
        const models = await listModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    fetchModels();
  }, []);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const attachedFile: AttachedFile = {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          content: content.split(',')[1] || content, // Remove data URL prefix
        };
        setAttachedFiles((prev) => [...prev, attachedFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const attachedFile: AttachedFile = {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          content: content.split(',')[1] || content, // Remove data URL prefix
        };
        setAttachedFiles((prev) => [...prev, attachedFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddToDoc = async (messageId: string, content: string, formatting?: any) => {
    try {
      const htmlContent = parseMarkdownToHtml(content);

      // Insert and track the range
      await Word.run(async (context) => {
        const range = context.document.getSelection();
        const insertedRange = range.insertHtml(htmlContent, Word.InsertLocation.end);

        // Apply formatting if present
        if (formatting) {
          if (formatting.fontName) insertedRange.font.name = formatting.fontName;

          if (formatting.fontSize) {
            const size = parseFloat(formatting.fontSize);
            if (!isNaN(size) && size > 0) {
              insertedRange.font.size = size;
            }
          }

          if (formatting.bold !== undefined) insertedRange.font.bold = formatting.bold;
          if (formatting.italic !== undefined) insertedRange.font.italic = formatting.italic;
          if (formatting.color) insertedRange.font.color = formatting.color;

          if (formatting.alignment) {
            // We need to sync to load paragraphs for alignment
            insertedRange.paragraphs.load('items');
            await context.sync();

            const alignMap: Record<string, Word.Alignment> = {
              'left': Word.Alignment.left,
              'center': Word.Alignment.centered,
              'right': Word.Alignment.right,
              'justify': Word.Alignment.justified
            };

            const mappedAlignment = alignMap[formatting.alignment.toLowerCase()] || Word.Alignment.left;

            insertedRange.paragraphs.items.forEach((p: any) => {
              p.alignment = mappedAlignment;
            });
          }
        }

        // Sync formatting before creating content control
        await context.sync();

        // Track the range using a unique ID
        const rangeId = `inserted-${messageId}-${Date.now()}`;

        // Wrap in a try-catch specifically for content control creation as it can be finicky
        try {
          const cc = insertedRange.insertContentControl();
          cc.tag = rangeId;
          cc.appearance = Word.ContentControlAppearance.hidden;

          // Sync to ensure the CC is created
          await context.sync();

          // Update message state only if successful
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, addedToDoc: true, insertedRangeId: rangeId }
              : msg
          ));
        } catch (ccError) {
          console.warn("Failed to create content control, but content was inserted:", ccError);
          // Still mark as added, but maybe without the range ID for undo? 
          // Or just fail gracefully. For now, we'll mark it added so user knows.
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, addedToDoc: true } // No rangeId means undo might not work, but content is there
              : msg
          ));
        }
      });
    } catch (error) {
      console.error('Failed to add to doc:', error);
    }
  };

  const handleUndoAddToDoc = async (messageId: string, rangeId: string) => {
    try {
      await Word.run(async (context) => {
        const contentControls = context.document.contentControls;
        contentControls.load('items');
        await context.sync();

        // Find and delete the content control with the matching tag
        for (const cc of contentControls.items) {
          cc.load('tag');
        }
        await context.sync();

        for (const cc of contentControls.items) {
          if (cc.tag === rangeId) {
            cc.delete(false); // false = delete both the content control and its content
            break;
          }
        }

        await context.sync();

        // Update message state
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, addedToDoc: false, insertedRangeId: undefined }
            : msg
        ));
      });
    } catch (error) {
      console.error('Failed to undo add to doc:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // 1. Get Context (Selection or Document)
      let contextText = '';
      let hasSelection = false;

      try {
        const selection = await getSelectedText();
        if (selection && selection.trim().length > 0) {
          contextText = selection;
          hasSelection = true;
        } else if (canReadDocument) {
          // If toggle is enabled, read full document
          const fullText = await getFullDocumentText();
          if (fullText && fullText.trim().length > 0) {
            contextText = fullText;
          }
        } else {
          const stats = await getDocumentStats();
          if (stats.characterCount > 0) {
            contextText = "Entire document context (content not fully loaded for performance).";
          }
        }
      } catch (e) {
        console.warn("Failed to get context:", e);
      }

      // 2. Call AI
      const response = await generateActionableContent(
        input,
        contextText,
        hasSelection,
        selectedModel,
        userMessage.attachedFiles
      );

      // 3. Execute Action
      let actionPerformed = '';
      let payload: string | undefined;
      let formatting: any | undefined;

      if (response.action) {
        const action = response.action;

        // Capture formatting if present
        if (action.formatting) {
          formatting = action.formatting;
        }

        // In 'ask' mode, intercept ALL actions - no document modifications allowed
        // Only the "Add to doc" button should modify the document
        if (chatMode === 'ask') {
          // Store content as payload for display and manual insertion via "Add to doc" button
          if (action.content) {
            payload = action.content;
            actionPerformed = 'Content ready - click "Add to doc" to insert';
          }
          // Skip action execution entirely in ask mode
        } else {
          try {
            if (action.type === 'format' && action.formatting) {
              if (action.target === 'document') {
                await formatDocument(action.formatting);
                actionPerformed = 'Formatted document';
              } else {
                await formatSelection(action.formatting);
                actionPerformed = 'Formatted selection';
              }
            } else if (action.type === 'replace' && action.content) {
              // Parse Markdown to HTML for rich text replacement
              const htmlContent = parseMarkdownToHtml(action.content);
              await replaceSelectedTextWithHtml(htmlContent);
              // Apply formatting if present
              if (formatting) {
                await formatSelection(formatting);
              }
              actionPerformed = 'Replaced text';
            } else if (action.type === 'insert' && action.content) {
              // Parse Markdown to HTML for rich text insertion
              const htmlContent = parseMarkdownToHtml(action.content);
              // We use insertHtmlAtCursor but we need to apply formatting.
              await Word.run(async (context) => {
                const range = context.document.getSelection();
                const insertedRange = range.insertHtml(htmlContent, Word.InsertLocation.end);

                if (formatting) {
                  // Sanitize and apply formatting
                  if (formatting.fontName) insertedRange.font.name = formatting.fontName;

                  if (formatting.fontSize) {
                    const size = parseFloat(formatting.fontSize);
                    if (!isNaN(size) && size > 0) {
                      insertedRange.font.size = size;
                    }
                  }

                  if (formatting.bold !== undefined) insertedRange.font.bold = formatting.bold;
                  if (formatting.italic !== undefined) insertedRange.font.italic = formatting.italic;
                  if (formatting.color) insertedRange.font.color = formatting.color;

                  // Load paragraphs for alignment and spacing
                  insertedRange.paragraphs.load('items');
                  await context.sync();

                  if (formatting.alignment || formatting.lineSpacing || formatting.spaceAfter !== undefined || formatting.spaceBefore !== undefined) {
                    const alignMap: Record<string, Word.Alignment> = {
                      'left': Word.Alignment.left,
                      'center': Word.Alignment.centered,
                      'right': Word.Alignment.right,
                      'justify': Word.Alignment.justified
                    };

                    insertedRange.paragraphs.items.forEach((p: any) => {
                      if (formatting.alignment) {
                        const mappedAlignment = alignMap[formatting.alignment.toLowerCase()] || Word.Alignment.left;
                        p.alignment = mappedAlignment;
                      }
                      if (formatting.lineSpacing) {
                        p.lineSpacing = formatting.lineSpacing;
                      }
                      if (formatting.spaceAfter !== undefined) {
                        p.spaceAfter = formatting.spaceAfter;
                      }
                      if (formatting.spaceBefore !== undefined) {
                        p.spaceBefore = formatting.spaceBefore;
                      }
                    });
                  }
                }
                await context.sync();
              });
              actionPerformed = 'Inserted text';
            } else if (action.type === 'command' && action.commandName) {
              switch (action.commandName) {
                case 'fixHeadings':
                  await fixAllHeadings();
                  actionPerformed = 'Fixed headings';
                  break;
                case 'normalizeFonts':
                  await normalizeDocumentFonts(action.args?.fontName, action.args?.fontSize);
                  actionPerformed = 'Normalized fonts';
                  break;
                case 'setMargins':
                  await setDocumentMargins(action.args);
                  actionPerformed = 'Set margins';
                  break;
                case 'formatImages':
                  await centerAllImages(action.args?.padding, action.args?.addCaptions, action.args?.alignment);
                  actionPerformed = 'Formatted images';
                  break;
                case 'updateHeader':
                  await updateAllHeaders(action.args?.leftText || '', action.args?.rightText || '');
                  actionPerformed = 'Updated headers';
                  break;
                case 'updateFooter':
                  await updateAllFooters(
                    action.args?.leftText || '',
                    action.args?.centerText || '',
                    action.args?.rightText || '',
                    action.args?.addPageNumbers || false
                  );
                  actionPerformed = 'Updated footers';
                  break;
                case 'applyBulletList':
                  await applyBulletList();
                  actionPerformed = 'Applied bullet list';
                  break;
                case 'applyNumberedList':
                  await applyNumberedList();
                  actionPerformed = 'Applied numbered list';
                  break;
                case 'clearFormatting':
                  await clearFormatting();
                  actionPerformed = 'Cleared formatting';
                  break;
                case 'autoFormat':
                  await autoFormatDocument();
                  actionPerformed = 'Auto-formatted document';
                  break;
                case 'addBorder':
                  await addBorderToSelection(action.args);
                  actionPerformed = 'Added border to selection';
                  break;
                case 'addPageBorder':
                  await addPageBorder(action.args);
                  actionPerformed = 'Added page border';
                  break;
                case 'addParagraphBorder':
                  await addBorderToParagraphs(action.args);
                  actionPerformed = 'Added border to paragraphs';
                  break;
                case 'removeBorders':
                  await removeBorders(action.args?.target);
                  actionPerformed = 'Removed borders';
                  break;
                case 'addDecorativeBorder':
                  await addDecorativeBorder(action.args);
                  actionPerformed = 'Added decorative border';
                  break;
              }
            } else if (action.type === 'multi-command' && action.multiCommands) {
              // Execute multiple commands in sequence
              const commandResults: string[] = [];
              for (const cmd of action.multiCommands) {
                try {
                  switch (cmd.commandName) {
                    case 'fixHeadings':
                      await fixAllHeadings();
                      commandResults.push('Fixed headings');
                      break;
                    case 'normalizeFonts':
                      await normalizeDocumentFonts(cmd.args?.fontName, cmd.args?.fontSize);
                      commandResults.push('Normalized fonts');
                      break;
                    case 'setMargins':
                      await setDocumentMargins(cmd.args);
                      commandResults.push('Set margins');
                      break;
                    case 'formatImages':
                      await centerAllImages(cmd.args?.padding, cmd.args?.addCaptions, cmd.args?.alignment);
                      commandResults.push('Formatted images');
                      break;
                    case 'updateHeader':
                      await updateAllHeaders(cmd.args?.leftText || '', cmd.args?.rightText || '');
                      commandResults.push('Updated headers');
                      break;
                    case 'updateFooter':
                      await updateAllFooters(
                        cmd.args?.leftText || '',
                        cmd.args?.centerText || '',
                        cmd.args?.rightText || '',
                        cmd.args?.addPageNumbers || false
                      );
                      commandResults.push('Updated footers');
                      break;
                    case 'applyBulletList':
                      await applyBulletList();
                      commandResults.push('Applied bullet list');
                      break;
                    case 'applyNumberedList':
                      await applyNumberedList();
                      commandResults.push('Applied numbered list');
                      break;
                    case 'clearFormatting':
                      await clearFormatting();
                      commandResults.push('Cleared formatting');
                      break;
                    case 'autoFormat':
                      await autoFormatDocument();
                      commandResults.push('Auto-formatted document');
                      break;
                    case 'addBorder':
                      await addBorderToSelection(cmd.args);
                      commandResults.push('Added border');
                      break;
                    case 'addPageBorder':
                      await addPageBorder(cmd.args);
                      commandResults.push('Added page border');
                      break;
                    case 'addParagraphBorder':
                      await addBorderToParagraphs(cmd.args);
                      commandResults.push('Added paragraph border');
                      break;
                    case 'removeBorders':
                      await removeBorders(cmd.args?.target);
                      commandResults.push('Removed borders');
                      break;
                    case 'addDecorativeBorder':
                      await addDecorativeBorder(cmd.args);
                      commandResults.push('Added decorative border');
                      break;
                  }
                } catch (cmdError) {
                  console.error(`Command ${cmd.commandName} failed:`, cmdError);
                  commandResults.push(`${cmd.commandName} failed`);
                }
              }
              actionPerformed = commandResults.join(', ');
            }
          } catch (e) {
            console.error("Action failed:", e);
            actionPerformed = 'Action failed';
          }
        }
      }

      // In edit mode, no automatic insertion - actions were already executed above
      // The action execution logic handles all insertions/modifications
      // Store payload for potential manual insertion via "Add to doc" button
      if (response.action && response.action.content && !payload) {
        payload = response.action.content;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.chatResponse,
        payload,
        formatting,
        timestamp: new Date(),
        actionPerformed
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate content'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">


      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">How can I help?</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">I can format, write, and edit.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] ${message.role === 'user'
                  ? 'bg-gray-800 dark:bg-blue-600 text-white rounded-lg p-2'
                  : 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg p-2'
                  }`}
              >
                <p className="text-xs whitespace-pre-wrap break-words">{message.content}</p>
                {message.attachedFiles && message.attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-200 truncate max-w-[150px]">{file.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
                {message.payload && (
                  <div
                    className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-xs whitespace-pre-wrap break-words shadow-sm overflow-x-auto text-gray-800 dark:text-gray-200"
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(message.payload) }}
                  />
                )}
                {message.actionPerformed && (
                  <div className="mt-2 text-xs flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {message.actionPerformed}
                  </div>
                )}
                <p className="text-[10px] mt-1 opacity-70 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {message.role === 'assistant' && chatMode === 'ask' && (
                  <div className="mt-2 flex space-x-2 pt-2">
                    <button
                      onClick={() => handleCopy(message.payload || message.content)}
                      className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
                      title="Copy"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    {!message.addedToDoc ? (
                      <button
                        onClick={() => handleAddToDoc(message.id, message.payload || message.content, message.formatting)}
                        className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
                        title="Add to doc"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to doc
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUndoAddToDoc(message.id, message.insertedRangeId!)}
                        className="text-[10px] text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center"
                        title="Undo"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Undo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
        <div className="flex-1 flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <div className="px-2 pt-1.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCanReadDocument(!canReadDocument)}
                className={`text-xs font-bold transition-colors border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 ${canReadDocument
                  ? 'text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                  }`}
                title={canReadDocument ? "Gemini can read full document" : "Gemini cannot read full document"}
                style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '-3px' }}
              >
                WW
              </button>
              <button
                onClick={handleAttachClick}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-1"
                title="Attach files (or drag & drop)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
          </div>
          {attachedFiles.length > 0 && (
            <div className="px-2 pb-1 space-y-1">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-[10px]">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <svg className="w-3 h-3 text-gray-600 dark:text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-gray-400 hover:text-red-600 ml-2 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            placeholder={chatMode === 'ask' ? "Ask AI..." : "Describe changes..."}
            className={`flex-1 border-none px-3 pt-1 pb-1 text-xs focus:outline-none focus:ring-0 resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400' : ''
              }`}
            rows={2}
            disabled={isLoading}
          />
          <div className="px-2 pb-1.5 flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <select
                value={chatMode}
                onChange={(e) => setChatMode(e.target.value as ChatMode)}
                className="text-[10px] border-none bg-transparent p-0 focus:outline-none focus:ring-0 font-medium text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                <option value="ask">Ask</option>
                <option value="edit">Edit</option>
              </select>
              <span className="text-gray-300">|</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                className="text-[10px] border-none bg-transparent p-0 focus:outline-none focus:ring-0 text-gray-500 dark:text-gray-400 cursor-pointer"
                title="Select AI Model"
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model.replace('models/', '')}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="gemini-2.0-flash-exp">2.0 Flash (Exp)</option>
                    <option value="gemini-2.0-flash-lite">2.0 Flash Lite</option>
                    <option value="gemini-1.5-flash">1.5 Flash</option>
                    <option value="gemini-1.5-flash-8b">1.5 Flash 8B</option>
                    <option value="gemini-1.5-pro">1.5 Pro</option>
                  </>
                )}
              </select>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-md p-1.5 transition-colors flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
