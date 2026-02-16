import React, { useState, useRef, useEffect } from 'react';

interface ToolbarProps {
  onExecCommand: (command: string, value?: string) => void;
  onFontSizeChange: (delta: number) => void;
  baseFontSize: number;
  isDarkMode: boolean;
}

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#db5353', '#e06666', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79', '#c27ba0',
];

const Toolbar: React.FC<ToolbarProps> = ({ onExecCommand, onFontSizeChange, baseFontSize, isDarkMode }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<'style' | 'color' | 'bg' | 'list' | null>('style');
  const [alignIcon, setAlignIcon] = useState('fa-align-left');
  
  // Link Form State
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    if (name === 'insert') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        setLinkText(selection.toString());
        setSavedRange(selection.getRangeAt(0).cloneRange());
      } else {
        setLinkText('');
        setSavedRange(null);
      }
      setLinkUrl('');
    }
    
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onExecCommand('insertImage', result);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveDropdown(null);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    let finalUrl = linkUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const selection = window.getSelection();
    if (selection && savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    const displayText = linkText || finalUrl;
    const linkHtml = `<a href="${finalUrl}" target="_blank" class="text-blue-600 underline">${displayText}</a>`;
    
    onExecCommand('insertHTML', linkHtml);
    setActiveDropdown(null);
  };

  const Button = ({ 
    command, 
    value, 
    icon, 
    title,
    onClickOverride,
    className = ""
  }: { 
    command?: string; 
    value?: string; 
    icon: string; 
    title: string;
    onClickOverride?: () => void;
    className?: string;
  }) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClickOverride ? onClickOverride : () => command && onExecCommand(command, value)}
      className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${className}`}
      title={title}
      type="button"
    >
      <i className={`fas ${icon}`}></i>
    </button>
  );

  return (
    <div 
      className={`sticky top-0 z-40 border-b px-2 sm:px-4 py-1.5 flex items-center gap-1 sm:gap-3 shadow-sm flex-wrap transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} 
      ref={dropdownRef}
    >
      <div className="flex items-center gap-1">
        <Button command="undo" icon="fa-undo" title="Undo" />
        <Button command="redo" icon="fa-redo" title="Redo" />
      </div>

      <div className="flex items-center gap-1">
        <select 
          onChange={(e) => onExecCommand('fontName', e.target.value)}
          className={`border rounded px-1 py-1 text-xs sm:text-sm focus:outline-none focus:border-blue-500 cursor-pointer transition-colors w-[60px] sm:w-[70px] truncate ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-black'}`}
          defaultValue="Inter"
        >
          <optgroup label="Sans Serif">
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Public Sans">Public Sans</option>
            <option value="Host Grotesk">Host Grotesk</option>
            <option value="Space Grotesk">Space Grotesk</option>
          </optgroup>
          <optgroup label="Serif">
            <option value="Source Serif 4">Source Serif 4</option>
            <option value="EB Garamond">EB Garamond</option>
          </optgroup>
          <optgroup label="Monospace">
            <option value="JetBrains Mono">JetBrains Mono</option>
            <option value="Fira Code">Fira Code</option>
            <option value="IBM Plex Mono">IBM Plex Mono</option>
          </optgroup>
        </select>

        <select 
          onChange={(e) => onExecCommand('formatBlock', e.target.value)}
          className={`border rounded px-1 py-1 text-xs sm:text-sm focus:outline-none focus:border-blue-500 w-12 sm:w-14 cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-black'}`}
          defaultValue="P"
        >
          <option value="P">p</option>
          <option value="H1">h1</option>
          <option value="H2">h2</option>
          <option value="H3">h3</option>
        </select>

        <div className={`flex items-center gap-0.5 border rounded p-0.5 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onFontSizeChange(-2)}
                className={`w-6 h-6 flex items-center justify-center rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Decrease font size"
            >
                <i className="fas fa-minus text-[10px]"></i>
            </button>
            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onFontSizeChange(2)}
                className={`w-6 h-6 flex items-center justify-center rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Increase font size"
            >
                <i className="fas fa-plus text-[10px]"></i>
            </button>
        </div>
      </div>

      {/* Style Dropdown (Bold, Italic, Strikethrough, Colors, Highlight, Lists) */}
      <div className="flex items-center gap-1 relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleDropdown('style')}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 w-10 justify-between ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          title="Text Style"
        >
          <i className="fas fa-font text-sm"></i>
          <i className="fas fa-caret-down text-[10px] text-gray-400"></i>
        </button>

        {activeDropdown === 'style' && (
          <div className={`absolute top-full left-0 mt-1 shadow-2xl rounded-lg p-2 z-[60] w-56 border transition-all animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-1">
              {/* Text Style Section */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveSubMenu(activeSubMenu === 'style' ? null : 'style')}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${activeSubMenu === 'style' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-italic text-xs"></i>
                  <span>Text Style</span>
                </div>
                <i className={`fas fa-chevron-${activeSubMenu === 'style' ? 'up' : 'down'} text-[10px]`}></i>
              </button>
              {activeSubMenu === 'style' && (
                <div className="flex items-center gap-1 p-1 animate-in slide-in-from-top-2 duration-150">
                  <Button command="bold" icon="fa-bold" title="Bold" className="flex-1" />
                  <Button command="italic" icon="fa-italic" title="Italic" className="flex-1" />
                  <Button command="strikethrough" icon="fa-strikethrough" title="Strikethrough" className="flex-1" />
                </div>
              )}

              {/* Text Color Section */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveSubMenu(activeSubMenu === 'color' ? null : 'color')}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${activeSubMenu === 'color' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold font-serif text-sm border-b-2 pb-0.5 ${isDarkMode ? 'border-gray-300' : 'border-black'}`}>A</span>
                  <span>Text Color</span>
                </div>
                <i className={`fas fa-chevron-${activeSubMenu === 'color' ? 'up' : 'down'} text-[10px]`}></i>
              </button>
              {activeSubMenu === 'color' && (
                <div className="grid grid-cols-6 gap-1 p-1 animate-in slide-in-from-top-2 duration-150">
                  {COLORS.map((c, i) => (
                    <button
                      key={`text-${i}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { onExecCommand('foreColor', c); }}
                      className="w-7 h-7 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              )}

              {/* Highlight Section */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveSubMenu(activeSubMenu === 'bg' ? null : 'bg')}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${activeSubMenu === 'bg' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-highlighter text-xs"></i>
                  <span>Highlight</span>
                </div>
                <i className={`fas fa-chevron-${activeSubMenu === 'bg' ? 'up' : 'down'} text-[10px]`}></i>
              </button>
              {activeSubMenu === 'bg' && (
                <div className="space-y-2 p-1 animate-in slide-in-from-top-2 duration-150">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onExecCommand('hiliteColor', 'transparent'); }}
                    className={`w-full text-center px-2 py-1 border text-[10px] rounded transition-colors uppercase font-bold ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Clear Highlight
                  </button>
                  <div className="grid grid-cols-6 gap-1">
                    {COLORS.map((c, i) => (
                      <button
                        key={`bg-${i}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onExecCommand('hiliteColor', c); }}
                        className="w-7 h-7 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* List Formatting Section */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveSubMenu(activeSubMenu === 'list' ? null : 'list')}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${activeSubMenu === 'list' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-list-ul text-xs"></i>
                  <span>List Style</span>
                </div>
                <i className={`fas fa-chevron-${activeSubMenu === 'list' ? 'up' : 'down'} text-[10px]`}></i>
              </button>
              {activeSubMenu === 'list' && (
                <div className="flex items-center gap-1 p-1 animate-in slide-in-from-top-2 duration-150">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onExecCommand('insertUnorderedList'); }}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    title="Bullets"
                  >
                    <i className="fas fa-list-ul text-xs"></i>
                    <span className="text-[10px]">Bullets</span>
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onExecCommand('insertOrderedList'); }}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    title="Numbers"
                  >
                    <i className="fas fa-list-ol text-xs"></i>
                    <span className="text-[10px]">Numbers</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Insert Dropdown (Image & Link) */}
      <div className="flex items-center gap-1 relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleDropdown('insert')}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 w-10 justify-between ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          title="Insert Media"
        >
          <i className="fas fa-plus-circle text-sm"></i>
          <i className="fas fa-caret-down text-[10px] text-gray-400"></i>
        </button>

        {activeDropdown === 'insert' && (
          <div className={`absolute top-full left-0 mt-1 shadow-2xl rounded-lg p-1 z-[60] flex flex-col min-w-[160px] border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-3 px-3 py-2 text-left text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <i className="fas fa-image w-4 text-center"></i>
              Insert Image
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveDropdown('linkForm')}
              className={`flex items-center gap-3 px-3 py-2 text-left text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <i className="fas fa-link w-4 text-center"></i>
              Insert Link
            </button>
          </div>
        )}

        {/* Link Form Submenu */}
        {activeDropdown === 'linkForm' && (
          <div className={`absolute top-full left-0 mt-1 shadow-2xl rounded-lg p-3 z-[60] w-64 border animate-in fade-in zoom-in-95 duration-150 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <form onSubmit={handleInsertLink} className="space-y-3">
              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Text to display</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className={`w-full px-2 py-1.5 text-xs rounded border outline-none focus:border-blue-500 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                  autoFocus
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-2 py-1.5 text-xs rounded border outline-none focus:border-blue-500 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleDropdown('align')}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 w-10 justify-between ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          title="Alignment"
        >
          <i className={`fas ${alignIcon} text-sm`}></i>
          <i className="fas fa-caret-down text-[10px] text-gray-400"></i>
        </button>
        
        {activeDropdown === 'align' && (
            <div className={`absolute top-full left-0 mt-1 shadow-2xl rounded-lg p-1 z-[60] flex flex-col min-w-[120px] border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {[
                    { cmd: 'justifyLeft', icon: 'fa-align-left', label: 'Left' },
                    { cmd: 'justifyCenter', icon: 'fa-align-center', label: 'Center' },
                    { cmd: 'justifyRight', icon: 'fa-align-right', label: 'Right' }
                ].map(opt => (
                    <button
                      key={opt.cmd}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                          onExecCommand(opt.cmd);
                          setAlignIcon(opt.icon);
                          setActiveDropdown(null);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-left text-xs rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <i className={`fas ${opt.icon} w-4 text-center`}></i>
                        {opt.label}
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;