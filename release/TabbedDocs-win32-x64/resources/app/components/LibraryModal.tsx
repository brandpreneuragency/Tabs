import React, { useState, useEffect } from 'react';
import { LibraryItem } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onLoadDoc: (item: LibraryItem) => void;
}

const LIBRARY_KEY = 'tabbed-docs-library';

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, isDarkMode, onLoadDoc }) => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(LIBRARY_KEY);
      if (saved) {
        try {
          setLibrary(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load library", e);
        }
      }
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = library.filter(item => item.id !== id);
    setLibrary(updated);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <i className="fas fa-archive"></i>
            </div>
            <h2 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Local Library</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {library.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
              <i className="fas fa-folder-open text-4xl mb-2"></i>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Your library is empty.</p>
              <p className="text-sm">Save documents to the library to see them here.</p>
            </div>
          ) : (
            library.sort((a, b) => b.savedAt - a.savedAt).map((item) => (
              <div 
                key={item.id}
                onClick={() => { onLoadDoc(item); onClose(); }}
                className={`group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-100 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'}`}
              >
                <div className="flex flex-col min-w-0">
                  <span className={`font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.title}</span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Saved on {formatDate(item.savedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                    title="Delete from library"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <i className={`fas fa-chevron-right text-xs opacity-30 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}></i>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`p-4 border-t text-center text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
          {library.length} items in library
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;