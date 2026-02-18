import React, { useEffect, useRef } from 'react';
import { SelectionState } from '../types';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isActive: boolean;
  isDarkMode: boolean;
  baseFontSize: number;
  onSelectionChange: (selection: SelectionState) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, isActive, isDarkMode, baseFontSize, onSelectionChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isActive]);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const text = editorRef.current.innerText.trim();
      
      if (text === '' && (currentHtml === '<br>' || currentHtml === '<p><br></p>')) {
        editorRef.current.innerHTML = '';
        onChange('');
      } else {
        onChange(currentHtml);
      }
    }
  };

  const checkSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      
      if (text && editorRef.current?.contains(range.commonAncestorContainer)) {
        const rects = range.getClientRects();
        const rect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();
        onSelectionChange({ text, rect });
      } else {
        onSelectionChange({ text: '', rect: null });
      }
    } else {
      onSelectionChange({ text: '', rect: null });
    }
  };

  if (!isActive) return null;

  return (
    <div 
      className={`h-full overflow-y-auto cursor-text transition-colors duration-300 print-container ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`} 
      onClick={() => {
        if (editorRef.current && document.activeElement !== editorRef.current) {
            editorRef.current.focus();
        }
      }}
      onMouseUp={checkSelection}
      onKeyUp={checkSelection}
    >
      <div
        id="editor-content"
        ref={editorRef}
        contentEditable
        data-placeholder="Start typing here..."
        className={`w-full max-w-5xl mx-auto min-h-full p-12 outline-none leading-relaxed transition-all shadow-sm ${isDarkMode ? 'bg-gray-900 text-gray-100 border-x border-gray-800' : 'bg-white text-gray-800 border-x border-gray-200'}`}
        style={{
            fontFamily: 'Inter, sans-serif',
            // @ts-ignore
            '--editor-p': `${baseFontSize}px`,
            '--editor-h3': `${baseFontSize + 4}px`,
            '--editor-h2': `${baseFontSize + 8}px`,
            '--editor-h1': `${baseFontSize + 12}px`,
        } as React.CSSProperties}
        onInput={handleInput}
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;