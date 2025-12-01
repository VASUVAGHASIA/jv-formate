import React, { useState } from 'react';
import { generateContent, cleanMarkdownFormatting } from '../utils/gemini';
import { 
  getSelectedText, 
  replaceSelectedText, 
  insertTextAtCursor,
} from '../utils/wordUtils';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: (input: string) => string;
}

const agents: Agent[] = [
  {
    id: 'improve',
    name: 'Improve Writing',
    description: 'Make your text clearer and more professional',
    icon: '✨',
    prompt: (text) => `Improve the following text by making it clearer, more concise, and better written. Return ONLY the improved text without any explanations or markdown formatting:\n\n${text}`,
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary of your text',
    icon: '📝',
    prompt: (text) => `Create a concise summary of the following text. Return ONLY the summary without any explanations or markdown formatting:\n\n${text}`,
  },
  {
    id: 'expand',
    name: 'Expand Content',
    description: 'Add more detail and depth to your text',
    icon: '📈',
    prompt: (text) => `Expand the following text with more detail, examples, and depth. Return ONLY the expanded content WITHOUT the original text. Do not use markdown formatting like **bold** or *italic*. Use plain text formatting:\n\n${text}`,
  },
  {
    id: 'formalize',
    name: 'Make Formal',
    description: 'Convert to professional, formal tone',
    icon: '👔',
    prompt: (text) => `Rewrite the following text in a formal, professional tone. Return ONLY the rewritten text without any markdown formatting:\n\n${text}`,
  },
  {
    id: 'simplify',
    name: 'Simplify',
    description: 'Make text easier to understand',
    icon: '💡',
    prompt: (text) => `Simplify the following text to make it easier to understand. Return ONLY the simplified text without any markdown formatting:\n\n${text}`,
  },
  {
    id: 'grammar',
    name: 'Fix Grammar',
    description: 'Correct grammar and spelling errors',
    icon: '✓',
    prompt: (text) => `Fix all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text without any markdown formatting:\n\n${text}`,
  },
];

interface AgentResult {
  agentId: string;
  content: string;
}

const SidebarAgents: React.FC = () => {
  const [processingAgentId, setProcessingAgentId] = useState<string>('');
  const [agentResults, setAgentResults] = useState<Record<string, AgentResult>>({});

  const handleAgentAction = async (agent: Agent) => {
    setProcessingAgentId(agent.id);

    try {
      const selectedText = await getSelectedText();
      
      if (!selectedText || selectedText.trim() === '') {
        alert('Please select some text first');
        setProcessingAgentId('');
        return;
      }

      const prompt = agent.prompt(selectedText);
      const response = await generateContent(prompt);
      const cleanedResponse = cleanMarkdownFormatting(response);
      
      setAgentResults((prev) => ({
        ...prev,
        [agent.id]: { agentId: agent.id, content: cleanedResponse },
      }));
    } catch (error) {
      console.error('Agent action failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to process text'}`);
    } finally {
      setProcessingAgentId('');
    }
  };

  const handleInsert = async (agentId: string) => {
    const result = agentResults[agentId];
    if (!result) return;
    try {
      await insertTextAtCursor('\n\n' + result.content);
      setAgentResults((prev) => {
        const newResults = { ...prev };
        delete newResults[agentId];
        return newResults;
      });
    } catch (error) {
      console.error('Failed to insert:', error);
    }
  };

  const handleReplace = async (agentId: string) => {
    const result = agentResults[agentId];
    if (!result) return;
    try {
      await replaceSelectedText(result.content);
      setAgentResults((prev) => {
        const newResults = { ...prev };
        delete newResults[agentId];
        return newResults;
      });
    } catch (error) {
      console.error('Failed to replace:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">Writing Tools</h2>
          <p className="text-xs text-gray-500 mt-1">Select text and choose an action</p>
        </div>

        {/* AI Agents */}
        <div>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="space-y-2">
                {/* Agent Button */}
                <button
                  onClick={() => handleAgentAction(agent)}
                  disabled={processingAgentId !== ''}
                  className={`w-full text-left bg-white border border-gray-200 rounded-lg p-3 transition-all shadow-sm hover:shadow-md hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    processingAgentId === agent.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' 
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* SVG Icon */}
                    {agent.id === 'improve' && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {agent.id === 'summarize' && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {agent.id === 'expand' && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    )}
                    {agent.id === 'formalize' && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.248 6.253 2 10.502 2 15.5 2 20.498 6.248 24.747 12 24.747c5.752 0 10-4.249 10-9.247S17.752 6.253 12 6.253z" />
                      </svg>
                    )}
                    {agent.id === 'simplify' && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {agent.id === 'grammar' && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{agent.description}</div>
                    </div>
                    {processingAgentId === agent.id && (
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600"></div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Result Display */}
                {agentResults[agent.id] && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700 font-medium text-xs">Generated Content</span>
                      </div>
                      <div className="bg-white rounded p-3 text-xs text-gray-800 max-h-48 overflow-y-auto whitespace-pre-wrap border border-green-100 shadow-inner leading-relaxed">
                        {agentResults[agent.id].content}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReplace(agent.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition-all hover:shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 105.199 7H10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6a1 1 0 011-1h.102A7.002 7.002 0 014 3V3a1 1 0 01-1-1V3a1 1 0 011-1z" />
                        </svg>
                        <span>Replace</span>
                      </button>
                      <button
                        onClick={() => handleInsert(agent.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition-all hover:shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Insert</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarAgents;
