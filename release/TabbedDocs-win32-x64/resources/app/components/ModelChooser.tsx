import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ModelCategory } from '../types';

interface ModelChooserProps {
  categories: ModelCategory[];
  selectedModelId: string;
  isDarkMode: boolean;
  onSelectModel: (modelId: string) => void;
}

const ModelChooser: React.FC<ModelChooserProps> = ({ categories, selectedModelId, isDarkMode, onSelectModel }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedModel = useMemo(() => {
    for (const category of categories) {
      const found = category.models.find(model => model.id === selectedModelId);
      if (found) return found;
    }
    return null;
  }, [categories, selectedModelId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`h-8 min-w-[190px] px-3 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        title={selectedModel?.vibe || 'Select model'}
      >
        <span className="truncate">{selectedModel?.name || 'Select model'}</span>
        <i className={`fas fa-chevron-down text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-[320px] max-h-[320px] overflow-y-auto rounded-xl border shadow-xl z-50 p-2 no-scrollbar ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          {categories.map(category => (
            <div key={category.id} className="mb-2 last:mb-0">
              <p className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {category.label}
              </p>

              <div className="space-y-1">
                {category.models.map(model => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-2 py-2 rounded-lg transition-colors ${selectedModelId === model.id ? (isDarkMode ? 'bg-purple-900/40 border border-purple-800' : 'bg-purple-50 border border-purple-100') : (isDarkMode ? 'hover:bg-gray-800 border border-transparent' : 'hover:bg-gray-50 border border-transparent')}`}
                    title={model.vibe}
                  >
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{model.name}</p>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{model.vibe}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelChooser;
