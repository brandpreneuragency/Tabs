import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectionState } from '../types';

interface AiChatboxProps {
  selection: SelectionState;
  isDarkMode: boolean;
  isDesktop: boolean;
  apiKey: string | null;
  onRequireApiKey: () => void;
  onReplace: (newText: string) => void;
  onInsert: (newText: string) => void;
}

const AI_PROMPTS = [
  { icon: 'fa-magic', label: 'Improve writing', prompt: 'Improve the writing of the following text, making it more professional and clear:' },
  { icon: 'fa-pen-nib', label: 'Continue writing', prompt: 'Based on the following context, continue writing a few more sentences:' },
  { icon: 'fa-spell-check', label: 'Fix spelling & grammar', prompt: 'Fix any spelling and grammar mistakes in the following text:' },
  { icon: 'fa-language', label: 'Translate into English', prompt: 'Translate the following text into English:' },
  { icon: 'fa-compress-arrows-alt', label: 'Make shorter', prompt: 'Summarize the following text to be much shorter:' },
  { icon: 'fa-expand-arrows-alt', label: 'Make longer', prompt: 'Expand on the following text with more detail and depth:' },
  { icon: 'fa-feather-alt', label: 'Simplify language', prompt: 'Rewrite the following text using simpler language that a child could understand:' },
  { icon: 'fa-smile', label: 'Change tone to Friendly', prompt: 'Rewrite the following text with a friendly and welcoming tone:' },
  { icon: 'fa-list-ul', label: 'Outline', prompt: 'Create a bulleted outline of the main points in the following text:' },
  { icon: 'fa-book-open', label: 'Explain', prompt: 'Explain the concepts in the following text in detail:' },
  { icon: 'fa-robot', label: 'Summarize', prompt: 'Provide a concise summary of the following text:' },
  { icon: 'fa-code', label: 'Explain codes', prompt: 'Explain what this code block does step by step:' },
  { icon: 'fa-tasks', label: 'Find action items', prompt: 'Identify all actionable tasks or items from the following text:' },
  { icon: 'fa-bullhorn', label: 'More persuasive', prompt: 'Rewrite the following text to be more persuasive and compelling:' },
  { icon: 'fa-plus-circle', label: 'Add details', prompt: 'Add more relevant details and context to the following text:' },
  { icon: 'fa-chart-bar', label: 'Add statistics', prompt: 'Enhance the following text by incorporating relevant statistical or data points where appropriate:' },
  { icon: 'fa-laugh-wink', label: 'Add humor', prompt: 'Rewrite the following text with a touch of lighthearted humor:' },
];

const AiChatbox: React.FC<AiChatboxProps> = ({ selection, isDarkMode, isDesktop, apiKey, onRequireApiKey, onReplace, onInsert }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, isTyping]);

  const normalizeErrorMessage = (error: unknown) => {
    const rawMessage = error instanceof Error ? error.message : 'Sorry, something went wrong while talking to the AI.';
    const lower = rawMessage.toLowerCase();

    if (lower.includes('api key') && (lower.includes('invalid') || lower.includes('not valid') || lower.includes('not authorized'))) {
      return 'Your API key is not valid for this desktop request. In Google AI Studio, use a key that allows desktop/server requests (not localhost-only browser referrer restrictions).';
    }

    return rawMessage;
  };

  const handleAiCall = async (promptText: string) => {
    if (!apiKey) {
      onRequireApiKey();
      return;
    }

    // Immediate visual feedback
    setIsTyping(true);
    setResponse('');

    const selectedText = selection.text.trim();
    const finalPrompt = selectedText
      ? `${promptText}\n\nUse this selected context if relevant:\n"""${selectedText}"""`
      : promptText;
    
    try {
      if (isDesktop && window.electronAPI?.ai) {
        const text = await window.electronAPI.ai.generate({
          apiKey,
          prompt: finalPrompt,
        });
        setResponse(text);
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const streamResponse = await ai.models.generateContentStream({
          model: 'gemini-3-flash-preview',
          contents: finalPrompt,
          config: {
              temperature: 0.7,
              topP: 0.95,
          }
        });

        let fullText = '';
        for await (const chunk of streamResponse) {
          const text = chunk.text || '';
          fullText += text;
          setResponse(fullText);
        }
      }
    } catch (error) {
      console.error('Gemini Error:', error);
      setResponse(normalizeErrorMessage(error));
    } finally {
      setIsTyping(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;
    if (!apiKey) {
      onRequireApiKey();
      return;
    }
    handleAiCall(query);
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isTyping) return;
    if (!apiKey) {
      onRequireApiKey();
      return;
    }
    setQuery(prompt);
    handleAiCall(prompt);
  };

  const handleReset = () => {
    setResponse('');
    setQuery('');
    setIsTyping(false);
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`h-16 p-3 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center">
            <i className="fas fa-sparkles text-[10px] text-white"></i>
          </div>
          <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tabs AI Assistant</span>
        </div>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {selection.text.trim() && (
          <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-[11px] uppercase font-semibold tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Selected Context
            </p>
            <p className={`text-xs max-h-20 overflow-hidden whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {selection.text}
            </p>
          </div>
        )}

        {response || isTyping ? (
          <div className="space-y-3">
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {!response && isTyping ? (
                <div className={`flex items-center gap-2 italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <i className="fas fa-circle-notch fa-spin text-xs"></i>
                  <span>Thinking...</span>
                </div>
              ) : (
                <>
                  {response}
                  {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-purple-400 animate-pulse rounded-full align-middle"></span>}
                </>
              )}
            </div>
            {!isTyping && response && (
              <div className={`flex flex-wrap gap-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                {selection.text.trim() && (
                  <>
                    <button 
                      onClick={() => onReplace(response)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                      Replace
                    </button>
                    <button 
                      onClick={() => onInsert(response)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      Insert
                    </button>
                  </>
                )}
                <button 
                  onClick={handleReset}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ml-auto ${isDarkMode ? 'bg-rose-900/40 text-rose-300 hover:bg-rose-900/60' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                >
                  <i className="fas fa-redo-alt mr-1"></i> Reset
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Suggestions</p>
            {AI_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                disabled={isTyping}
                onClick={() => handleSuggestionClick(item.prompt)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl group transition-all disabled:opacity-50 ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 group-hover:border-gray-600 text-gray-500 group-hover:text-purple-400' : 'bg-gray-50 border-transparent group-hover:bg-white group-hover:border-gray-100 text-gray-500 group-hover:text-purple-600'}`}>
                  <i className={`fas ${item.icon} text-xs`}></i>
                </div>
                <span className={`text-sm text-left group-hover:text-gray-900 ${isDarkMode ? 'group-hover:text-white' : ''}`}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`p-3 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <form onSubmit={handleCustomSubmit} className="relative flex items-center">
          <div className="absolute left-3 w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center opacity-70">
            <i className="fas fa-sparkles text-[10px] text-white"></i>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selection.text.trim() ? 'Ask AI (selection included)' : 'Ask AI anything'}
            disabled={isTyping}
            className={`w-full pl-11 pr-10 py-2.5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-200 outline-none placeholder:text-gray-400 transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-100 focus:ring-purple-900/30' : 'bg-gray-100 text-gray-800 focus:ring-purple-200'}`}
          />
          <button 
            type="submit"
            disabled={isTyping || !query.trim()}
            className={`absolute right-2 p-1.5 rounded-xl transition-all ${isTyping ? 'text-purple-600' : query.trim() ? 'text-purple-500 hover:bg-purple-50' : 'text-gray-400'}`}
          >
            {isTyping ? (
              <i className="fas fa-circle-notch fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-paper-plane text-sm"></i>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChatbox;