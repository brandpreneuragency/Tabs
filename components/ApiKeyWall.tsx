import React, { useEffect, useState } from 'react';

interface ApiKeyWallProps {
  isOpen: boolean;
  isDarkMode: boolean;
  isDesktop: boolean;
  hasApiKey: boolean;
  onSave: (key: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onClose: () => void;
}

const ApiKeyWall: React.FC<ApiKeyWallProps> = ({
  isOpen,
  isDarkMode,
  isDesktop,
  hasApiKey,
  onSave,
  onRemove,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setInputValue('');
      setIsSaving(false);
      setIsRemoving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter your Gemini API key.');
      return;
    }

    try {
      setError('');
      setIsSaving(true);
      await onSave(trimmed);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save API key.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setError('');
      setIsRemoving(true);
      await onRemove();
      onClose();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove API key.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Unlock AI Assistant</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your Gemini API key to enable AI features.
          </p>
        </div>

        <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
          <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Gemini API Key
          </label>
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="AIza..."
            autoFocus
            className={`w-full rounded-xl px-3 py-2 text-sm outline-none border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500/40' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-200'}`}
          />

          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {isDesktop
              ? 'Desktop: key is saved with OS-backed encryption.'
              : 'Web: key is only kept for this browser session and is not saved to disk.'}
          </p>

          {error && (
            <div className={`text-xs rounded-lg px-3 py-2 ${isDarkMode ? 'bg-red-950/60 text-red-300 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center gap-2 justify-end">
            {hasApiKey && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving || isSaving}
                className={`px-3 py-2 text-xs rounded-lg font-medium ${isDarkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-red-50 text-red-700 hover:bg-red-100'} disabled:opacity-50`}
              >
                {isRemoving ? 'Removing...' : 'Remove Key'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-2 text-xs rounded-lg font-medium ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving || isRemoving}
              className="px-3 py-2 text-xs rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save & Enable AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyWall;
