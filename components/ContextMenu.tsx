import React, { useEffect, useRef } from 'react';
import { ContextMenuState } from '../types';

interface ContextMenuProps {
  menuState: ContextMenuState;
  isDarkMode: boolean;
  onClose: () => void;
  onTogglePin: (id: string) => void;
  onRename: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  isPinned: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  menuState, 
  isDarkMode,
  onClose, 
  onTogglePin, 
  onRename, 
  onCloseTab,
  isPinned 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (menuState.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuState.visible, onClose]);

  if (!menuState.visible || !menuState.docId) return null;

  return (
    <div
      ref={menuRef}
      className={`fixed z-[100] w-48 rounded-md shadow-xl border py-1 text-sm transition-colors animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}
      style={{ top: menuState.y, left: menuState.x }}
    >
      <button
        onClick={() => {
          onTogglePin(menuState.docId!);
          onClose();
        }}
        className={`block w-full text-left px-4 py-2.5 flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      >
        <i className={`fas fa-thumbtack ${isPinned ? (isDarkMode ? 'text-blue-400' : 'text-blue-500') : 'text-gray-400'} w-4 text-center`}></i>
        <span>{isPinned ? 'Unpin Tab' : 'Pin Tab'}</span>
      </button>
      <button
        onClick={() => {
          onRename(menuState.docId!);
          onClose();
        }}
        className={`block w-full text-left px-4 py-2.5 flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      >
        <i className="fas fa-edit text-gray-400 w-4 text-center"></i>
        <span>Rename</span>
      </button>
      <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
      <button
        onClick={(e) => {
          onCloseTab(menuState.docId!, e);
          onClose();
        }}
        className={`block w-full text-left px-4 py-2.5 flex items-center gap-2 transition-colors text-red-500 ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
      >
        <i className="fas fa-trash-alt w-4 text-center"></i>
        <span>Close Tab</span>
      </button>
    </div>
  );
};

export default ContextMenu;