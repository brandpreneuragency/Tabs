import React, { useState, useEffect, useCallback, useRef } from 'react';
import Tab from './components/Tab';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import ContextMenu from './components/ContextMenu';
import AiChatbox from './components/AiChatbox';
import LibraryModal from './components/LibraryModal';
import ApiKeyWall from './components/ApiKeyWall';
import { DEFAULT_MODEL_ID, MODEL_CATEGORIES } from './config/modelCatalog';
import { DocumentData, ContextMenuState, SelectionState, LibraryItem } from './types';

const STORAGE_KEY = 'tabbed-docs-data';
const THEME_KEY = 'tabbed-docs-theme';
const SIZE_KEY = 'tabbed-docs-font-size';
const LIBRARY_KEY = 'tabbed-docs-library';
const MODEL_KEY = 'tabbed-docs-selected-model';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createNewDoc = (count: number): DocumentData => ({
  id: generateId(),
  title: `Untitled ${count}`,
  content: '', 
  isPinned: false,
  isActive: true,
  lastModified: Date.now(),
});

const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isApiKeyWallOpen, setIsApiKeyWallOpen] = useState(false);
  const [isAiSidebarCollapsed, setIsAiSidebarCollapsed] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [selection, setSelection] = useState<SelectionState>({ text: '', rect: null });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    docId: null,
  });

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const prevDocCountRef = useRef(0);
  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI?.secureKey;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedSize = localStorage.getItem(SIZE_KEY);
    const savedModel = localStorage.getItem(MODEL_KEY);
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    if (savedSize) {
      setBaseFontSize(parseInt(savedSize, 10) || 16);
    }

    if (savedModel) {
      setSelectedModelId(savedModel);
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed);
        } else {
          setDocuments([createNewDoc(1)]);
        }
      } catch (e) {
        setDocuments([createNewDoc(1)]);
      }
    } else {
      setDocuments([createNewDoc(1)]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(SIZE_KEY, baseFontSize.toString());
    }
  }, [baseFontSize, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(MODEL_KEY, selectedModelId);
    }
  }, [selectedModelId, loaded]);

  useEffect(() => {
    let mounted = true;

    const loadApiKey = async () => {
      if (!isDesktop) {
        if (mounted) {
          setIsApiKeyReady(true);
        }
        return;
      }

      try {
        const storedKey = await window.electronAPI?.secureKey.get();
        if (mounted) {
          setApiKey(storedKey || null);
        }
      } catch (error) {
        console.error('Failed to load secure API key:', error);
      } finally {
        if (mounted) {
          setIsApiKeyReady(true);
        }
      }
    };

    loadApiKey();

    return () => {
      mounted = false;
    };
  }, [isDesktop]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (documents.length > prevDocCountRef.current) {
        const lastDoc = documents[documents.length - 1];
        if (lastDoc && lastDoc.isActive && tabsContainerRef.current) {
            tabsContainerRef.current.scrollTo({
                left: tabsContainerRef.current.scrollWidth,
                behavior: 'smooth'
            });
        }
    }
    prevDocCountRef.current = documents.length;
  }, [documents]);

  const activeDoc = documents.find(d => d.isActive);

  const handleCreateDoc = () => {
    const newDoc = createNewDoc(documents.length + 1);
    setDocuments(prev => prev.map(d => ({ ...d, isActive: false })).concat(newDoc));
  };

  const handleActivateDoc = (id: string) => {
    setDocuments(prev => prev.map(d => ({
      ...d,
      isActive: d.id === id
    })));
  };

  const handleCloseDoc = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const docToClose = documents.find(d => d.id === id);
    if (docToClose?.isPinned) return;

    setDocuments(prev => {
      const remaining = prev.filter(d => d.id !== id);
      if (docToClose?.isActive && remaining.length > 0) {
        remaining[remaining.length - 1].isActive = true;
      } else if (remaining.length === 0) {
        return [createNewDoc(1)];
      }
      return remaining;
    });
  };

  const handleUpdateContent = useCallback((newContent: string) => {
    setDocuments(prev => prev.map(d => 
      d.isActive ? { ...d, content: newContent, lastModified: Date.now() } : d
    ));
  }, []);

  const handleContextMenu = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      docId,
    });
  };

  const handleTogglePin = (id: string) => {
    setDocuments(prev => {
        const updated = prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d);
        const pinned = updated.filter(d => d.isPinned);
        const unpinned = updated.filter(d => !d.isPinned);
        return [...pinned, ...unpinned];
    });
  };

  const handleRename = (id: string, newName?: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    if (newName !== undefined) {
      if (newName.trim() !== "") {
        setDocuments(prev => prev.map(d => 
          d.id === id ? { ...d, title: newName.trim() } : d
        ));
      }
      return;
    }

    const promptName = prompt("Enter new document name:", doc.title);
    if (promptName && promptName.trim() !== "") {
      setDocuments(prev => prev.map(d => 
        d.id === id ? { ...d, title: promptName.trim() } : d
      ));
    }
  };

  const handleExecCommand = (command: string, value?: string) => {
    const editor = document.getElementById('editor-content');
    if (editor) {
      if (document.activeElement !== editor) {
        editor.focus();
      }
    }
    document.execCommand(command, false, value);
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleSaveToLibrary = () => {
    if (!activeDoc) return;
    
    const newName = prompt("Save to library as:", activeDoc.title);
    if (newName === null) return;

    const finalName = newName.trim() || activeDoc.title;
    const libraryStr = localStorage.getItem(LIBRARY_KEY);
    let library: LibraryItem[] = libraryStr ? JSON.parse(libraryStr) : [];
    
    const libraryItem: LibraryItem = {
      id: activeDoc.id,
      title: finalName,
      content: activeDoc.content,
      savedAt: Date.now()
    };

    const existingIndex = library.findIndex(item => item.id === activeDoc.id);
    if (existingIndex > -1) {
      library[existingIndex] = libraryItem;
    } else {
      library.push(libraryItem);
    }

    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    setIsFabOpen(false);
    
    if (finalName !== activeDoc.title) {
      handleRename(activeDoc.id, finalName);
    }
    alert(`"${finalName}" saved to library successfully.`);
  };

  const handleLoadFromLibrary = (item: LibraryItem) => {
    const alreadyOpen = documents.find(d => d.id === item.id);
    if (alreadyOpen) {
      handleActivateDoc(item.id);
      return;
    }

    const newDoc: DocumentData = {
      id: item.id,
      title: item.title,
      content: item.content,
      isPinned: false,
      isActive: true,
      lastModified: Date.now()
    };

    setDocuments(prev => prev.map(d => ({ ...d, isActive: false })).concat(newDoc));
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    if (!activeDoc) return;
    setIsFabOpen(false);

    if (format === 'pdf') {
      window.print();
    } else if (format === 'docx') {
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${activeDoc.title}</title>
        <style>
          body { font-family: Arial, sans-serif; }
        </style>
        </head><body>
      `;
      const footer = "</body></html>";
      const sourceHTML = header + activeDoc.content + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeDoc.title || 'document'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleAiReplace = (newText: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(newText));
      handleUpdateContent(document.getElementById('editor-content')?.innerHTML || '');
    }
  };

  const handleAiInsert = (newText: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.innerHTML = `<p>${newText}</p>`;
      range.collapse(false);
      range.insertNode(div);
      handleUpdateContent(document.getElementById('editor-content')?.innerHTML || '');
    }
  };

  const handleSaveApiKey = async (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) {
      throw new Error('API key is required.');
    }

    if (isDesktop) {
      await window.electronAPI?.secureKey.set(trimmed);
    }

    setApiKey(trimmed);
  };

  const handleRemoveApiKey = async () => {
    if (isDesktop) {
      await window.electronAPI?.secureKey.remove();
    }

    setApiKey(null);
    setSelection({ text: '', rect: null });
  };

  if (!loaded) return <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-500">Loading Assistant...</div>;
  if (!isApiKeyReady) return <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-500">Preparing AI Assistant...</div>;

  // Ultra compact button styling to ensure fit on one row
  const fabButtonClass = `flex items-center gap-1.5 px-2 py-2 rounded-xl shadow-lg border text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap`;
  const sidebarToggleBaseClass = 'absolute right-3 top-3 w-10 h-10 rounded-xl shadow-md z-30 flex items-center justify-center transition-colors text-white';
  const sidebarToggleOpenClass = 'bg-blue-600 hover:bg-blue-700';
  const sidebarToggleCloseClass = 'bg-gray-600 hover:bg-gray-700';
  const selectedModel = MODEL_CATEGORIES.flatMap(category => category.models).find(model => model.id === selectedModelId);
  const selectedModelName = selectedModel?.name || 'Selected Model';
  const providerRaw = (selectedModel?.id.split('/')[0] || 'model').toLowerCase();
  const providerLabelMap: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    'meta-llama': 'Meta Llama',
    deepseek: 'DeepSeek',
  };
  const keyLabel = `${providerLabelMap[providerRaw] || providerRaw.toUpperCase()} API Key`;
  const keyPlaceholderMap: Record<string, string> = {
    openai: 'sk-... ',
    anthropic: 'sk-ant-... ',
    google: 'AIza... ',
    'meta-llama': 'sk-or-... ',
    deepseek: 'sk-... ',
  };
  const keyPlaceholder = (keyPlaceholderMap[providerRaw] || 'sk-...').trim();

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <div className={`pt-1 px-1 flex items-end gap-1 select-none border-b transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
        <div 
            ref={tabsContainerRef}
            className="flex items-end gap-1 flex-1 overflow-x-auto overflow-y-hidden no-scrollbar"
            onWheel={handleTabsWheel}
        >
          {documents.map(doc => (
            <Tab
              key={doc.id}
              doc={doc}
              isDarkMode={isDarkMode}
              onActivate={handleActivateDoc}
              onClose={handleCloseDoc}
              onContextMenu={handleContextMenu}
              onRename={handleRename}
            />
          ))}
          
          <button
            onClick={handleCreateDoc}
            className={`ml-1 p-2 mb-1.5 rounded-full w-8 h-8 flex items-center justify-center transition-colors shrink-0 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
            title="New Document"
          >
            <i className="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>

      <Toolbar 
        onExecCommand={handleExecCommand}
        onFontSizeChange={(delta) => setBaseFontSize(prev => Math.max(8, Math.min(72, prev + delta)))}
        baseFontSize={baseFontSize}
        isDarkMode={isDarkMode} 
      />

      <div className="flex-1 min-h-0 flex relative">
        <div className="flex-1 min-w-0 min-h-0">
          {activeDoc ? (
            <Editor 
              key={activeDoc.id} 
              content={activeDoc.content} 
              onChange={handleUpdateContent} 
              isActive={true} 
              isDarkMode={isDarkMode}
              baseFontSize={baseFontSize}
              onSelectionChange={setSelection}
            />
          ) : (
            <div className={`flex-1 h-full flex items-center justify-center text-gray-400 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              No documents open
            </div>
          )}
        </div>

        {!isAiSidebarCollapsed && (
          <div className={`w-[360px] lg:w-[400px] min-h-0 border-l ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
            <AiChatbox 
              selection={selection} 
              isDarkMode={isDarkMode}
              isDesktop={isDesktop}
              apiKey={apiKey}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              onRequireApiKey={() => setIsApiKeyWallOpen(true)}
              onReplace={handleAiReplace} 
              onInsert={handleAiInsert}
            />
          </div>
        )}

        <button
          onClick={() => setIsAiSidebarCollapsed(prev => !prev)}
          className={`${sidebarToggleBaseClass} ${isAiSidebarCollapsed ? sidebarToggleOpenClass : sidebarToggleCloseClass}`}
          title={isAiSidebarCollapsed ? 'Open AI Assistant' : 'Collapse AI Assistant'}
        >
          <i className={`fas ${isAiSidebarCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'} text-sm`}></i>
        </button>
      </div>

      <LibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        isDarkMode={isDarkMode}
        onLoadDoc={handleLoadFromLibrary}
      />

      {/* FAB Container - Row orientation */}
      <div ref={fabRef} className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-row-reverse items-center gap-2 sm:gap-3">
        {/* Toggle Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:rotate-90 active:scale-90 shrink-0 ${isFabOpen ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <i className={`fas ${isFabOpen ? 'fa-times' : 'fa-cog'} text-lg sm:text-xl`}></i>
        </button>

        {/* Menu Buttons in 1 Row - Optimized for mobile */}
        {isFabOpen && (
          <div className="flex flex-row items-center gap-1.5 sm:gap-2 animate-in slide-in-from-right-5 duration-200 overflow-x-auto no-scrollbar max-w-[calc(100vw-80px)] sm:max-w-[calc(100vw-120px)]">
            <button
              onClick={handleSaveToLibrary}
              className={`${fabButtonClass} ${isDarkMode ? 'bg-gray-800 border-gray-700 text-blue-400' : 'bg-white border-gray-200 text-blue-600'}`}
            >
              <i className="fas fa-save"></i> Save
            </button>
            <button
              onClick={() => { setIsLibraryOpen(true); setIsFabOpen(false); }}
              className={`${fabButtonClass} ${isDarkMode ? 'bg-gray-800 border-gray-700 text-amber-400' : 'bg-white border-gray-200 text-amber-600'}`}
            >
              <i className="fas fa-folder-open"></i> Open
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className={`${fabButtonClass} ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              <i className="fas fa-file-pdf text-red-500"></i> PDF
            </button>
            <button
              onClick={() => handleExport('docx')}
              className={`${fabButtonClass} ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              <i className="fas fa-file-word text-blue-500"></i> Word
            </button>
            <button
              onClick={() => { setIsDarkMode(!isDarkMode); setIsFabOpen(false); }}
              className={`${fabButtonClass} ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i> {isDarkMode ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={() => { setIsApiKeyWallOpen(true); setIsFabOpen(false); }}
              className={`${fabButtonClass} ${apiKey ? (isDarkMode ? 'bg-gray-800 border-gray-700 text-green-400' : 'bg-white border-gray-200 text-green-700') : (isDarkMode ? 'bg-gray-800 border-gray-700 text-orange-400' : 'bg-white border-gray-200 text-orange-700')}`}
            >
              <i className={`fas ${apiKey ? 'fa-key' : 'fa-lock'}`}></i> {apiKey ? 'AI Key' : 'Enable AI'}
            </button>
          </div>
        )}
      </div>

      <ApiKeyWall
        isOpen={isApiKeyWallOpen}
        isDarkMode={isDarkMode}
        isDesktop={isDesktop}
        hasApiKey={!!apiKey}
        selectedModelName={selectedModelName}
        keyLabel={keyLabel}
        keyPlaceholder={keyPlaceholder}
        onSave={handleSaveApiKey}
        onRemove={handleRemoveApiKey}
        onClose={() => setIsApiKeyWallOpen(false)}
      />

      <ContextMenu
        menuState={contextMenu}
        isDarkMode={isDarkMode}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        onTogglePin={handleTogglePin}
        onRename={handleRename}
        onCloseTab={handleCloseDoc}
        isPinned={documents.find(d => d.id === contextMenu.docId)?.isPinned || false}
      />
    </div>
  );
};

export default App;