import { useState, useRef, useEffect } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';

interface EditableTextProps {
  value: string;
  field: string;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  multiline?: boolean;
  maxLength?: number;
  showEditIcon?: boolean;  // New prop to control edit icon display
  children?: React.ReactNode;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  field,
  placeholder = 'Click to edit...',
  className = '',
  displayClassName = '',
  inputClassName = '',
  multiline = false,
  maxLength,
  showEditIcon = true,  // Default to showing icon for backward compatibility
  children
}) => {
  const { isEditMode, canEdit, autoSave } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setCurrentValue(value);
    setHasChanged(false);
  }, [value]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleClick = () => {
    if (canEdit && isEditMode && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    setHasChanged(newValue !== value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = async () => {
    if (hasChanged) {
      await autoSave(field, currentValue);
    }
    setIsEditing(false);
    setHasChanged(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
    setHasChanged(false);
  };

  const handleBlur = () => {
    // Small delay to allow clicking save button
    setTimeout(() => {
      if (hasChanged) {
        handleSave();
      } else {
        setIsEditing(false);
      }
    }, 100);
  };

  const getEditableStyles = () => {
    if (!canEdit || !isEditMode) return '';
    
    return `
      editable-field
      ${isEditing ? 'editable-active' : 'editable-hover'}
      transition-all duration-200
      ${!isEditing ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200' : ''}
    `;
  };

  const inputElement = multiline ? (
    <textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      value={currentValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={Math.min(Math.max(currentValue.split('\n').length, 3), 8)}
      className={`
        w-full p-3 border-2 border-blue-300 rounded-lg resize-vertical
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${inputClassName}
      `}
    />
  ) : (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={currentValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`
        w-full p-3 border-2 border-blue-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${inputClassName}
      `}
    />
  );

  if (isEditing && canEdit && isEditMode) {
    return (
      <div className={`relative ${className}`} ref={containerRef}>
        {inputElement}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!hasChanged}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${hasChanged
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
          {maxLength && (
            <span className={`text-xs ${currentValue.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
              {currentValue.length}{maxLength && `/${maxLength}`}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {multiline ? 'Press Ctrl+Enter to save, Esc to cancel' : 'Press Enter to save, Esc to cancel'}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative group
        ${className} 
        ${getEditableStyles()}
        ${canEdit && isEditMode ? 'border-2 border-dashed border-transparent hover:border-blue-200 rounded-lg p-2 -m-2' : ''}
      `}
      onClick={handleClick}
      ref={containerRef}
    >
      <div className={displayClassName}>
        {children || currentValue || (
          <span className="text-gray-400 italic">
            {canEdit && isEditMode ? placeholder : 'No content'}
          </span>
        )}
      </div>
      
      {/* Edit indicator - Conditional based on showEditIcon prop */}
      {showEditIcon && canEdit && isEditMode && !isEditing && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 animate-edit-pulse border-2 border-white" title="Click to edit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default EditableText;