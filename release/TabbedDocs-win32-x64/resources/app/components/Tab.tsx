import React, { useState, useRef, useEffect } from 'react';
import { DocumentData } from '../types';

interface TabProps {
  doc: DocumentData;
  isDarkMode: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, docId: string) => void;
  onRename: (id: string, newName: string) => void;
}

const Tab: React.FC<TabProps> = ({ doc, isDarkMode, onActivate, onClose, onContextMenu, onRename }) => {
  const { id, title, isPinned, isActive } = doc;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPinned) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      onRename(id, editValue);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, id);
  };

  const baseClasses = "relative group flex items-center cursor-pointer select-none transition-all duration-150 ease-in-out shrink-0";
  
  let activeClasses = "";
  if (isActive) {
    activeClasses = isDarkMode 
      ? "bg-gray-900 text-gray-100 rounded-t-lg z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.3)] border-t border-l border-r border-gray-700" 
      : "bg-white text-gray-800 rounded-t-lg z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.1)] border-t border-l border-r border-gray-300";
  } else {
    activeClasses = isDarkMode
      ? "bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-t-md mt-1 border-t border-l border-r border-transparent hover:border-gray-700"
      : "bg-gray-300 text-gray-600 hover:bg-gray-200 rounded-t-md mt-1 border-t border-l border-r border-transparent hover:border-gray-300";
  }
  
  // Mobile width: 40% unpinned, 20% pinned. Desktop: fixed widths.
  const widthClasses = isPinned 
    ? "w-[20vw] sm:w-12 justify-center px-0" 
    : "w-[40vw] sm:w-48 sm:max-w-[12rem] px-3";
    
  const paddingClasses = isActive ? "pt-2 pb-2" : "pt-1.5 pb-1.5";

  return (
    <div
      className={`${baseClasses} ${activeClasses} ${widthClasses} ${paddingClasses}`}
      onClick={() => onActivate(id)}
      onContextMenu={(e) => onContextMenu(e, id)}
      title={title}
    >
      <div className={`flex items-center justify-center ${isPinned ? 'mx-auto' : 'mr-2'}`}>
        <i className={`fas fa-file-alt ${isActive ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : 'text-gray-500'}`}></i>
      </div>

      {!isPinned && (
        isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 min-w-0 text-xs sm:text-sm font-medium px-1 py-0 rounded outline-none border ${isDarkMode ? 'bg-gray-700 text-gray-100 border-blue-500' : 'bg-white text-gray-800 border-blue-400'}`}
          />
        ) : (
          <span 
            className="truncate text-xs sm:text-sm font-medium flex-1"
            onDoubleClick={handleDoubleClick}
          >
            {title}
          </span>
        )
      )}

      {/* Menu Dots - visible on active or hover */}
      {!isEditing && (
        <button
          onClick={handleMenuClick}
          className={`ml-1 p-1 rounded-full transition-opacity focus:outline-none ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <i className={`fas fa-ellipsis-v text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
        </button>
      )}
      
      {isActive && (
        <div className={`absolute bottom-[-1px] left-0 right-0 h-[1px] z-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}></div>
      )}
    </div>
  );
};

export default Tab;