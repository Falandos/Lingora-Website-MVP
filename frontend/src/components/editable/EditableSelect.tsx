import { useState, useRef, useEffect } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface EditableSelectProps {
  value: string | string[];
  field: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  multiple?: boolean;
  maxSelections?: number;
  children?: React.ReactNode;
}

const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  field,
  options,
  placeholder = 'Click to select...',
  className = '',
  displayClassName = '',
  multiple = false,
  maxSelections,
  children
}) => {
  const { isEditMode, canEdit, autoSave } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setCurrentValue(value);
    setHasChanged(false);
  }, [value]);

  // Auto-focus search input when entering edit mode
  useEffect(() => {
    if (isEditing && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isEditing]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (hasChanged) {
          handleSave();
        } else {
          setIsEditing(false);
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, hasChanged]);

  const handleClick = () => {
    if (canEdit && isEditMode && !isEditing) {
      setIsEditing(true);
      setSearchTerm('');
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    let newValue: string | string[];

    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      if (currentArray.includes(optionValue)) {
        // Remove if already selected
        newValue = currentArray.filter(v => v !== optionValue);
      } else {
        // Add if not selected and within max limit
        if (!maxSelections || currentArray.length < maxSelections) {
          newValue = [...currentArray, optionValue];
        } else {
          return; // Don't add if max reached
        }
      }
    } else {
      newValue = optionValue;
      setIsEditing(false); // Close dropdown for single select
    }

    setCurrentValue(newValue);
    setHasChanged(JSON.stringify(newValue) !== JSON.stringify(value));
    
    if (!multiple) {
      handleSave(); // Auto-save for single select
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
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedOptions = () => {
    const selectedValues = Array.isArray(currentValue) ? currentValue : [currentValue];
    return options.filter(option => selectedValues.includes(option.value));
  };

  const getDisplayText = () => {
    const selected = getSelectedOptions();
    if (selected.length === 0) {
      return canEdit && isEditMode ? placeholder : 'None selected';
    }
    return selected.map(opt => opt.label).join(', ');
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

  const isOptionSelected = (optionValue: string) => {
    if (Array.isArray(currentValue)) {
      return currentValue.includes(optionValue);
    }
    return currentValue === optionValue;
  };

  if (isEditing && canEdit && isEditMode) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div className="border-2 border-blue-300 rounded-lg bg-white">
          {/* Search input */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search options..."
            className="w-full p-3 border-none rounded-t-lg focus:outline-none"
          />
          
          {/* Options list */}
          <div className="max-h-60 overflow-y-auto border-t">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`
                    p-3 cursor-pointer border-b border-gray-100 last:border-b-0
                    hover:bg-blue-50 transition-colors flex items-center justify-between
                    ${isOptionSelected(option.value) ? 'bg-blue-100 text-blue-800' : ''}
                  `}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <span className="mr-3 text-lg">{option.icon}</span>
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isOptionSelected(option.value) && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action buttons for multiple select */}
        {multiple && (
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
            <div className="text-xs text-gray-500">
              {Array.isArray(currentValue) ? currentValue.length : 0} selected
              {maxSelections && ` (max ${maxSelections})`}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1">
          Type to search • Click to select {multiple ? '• Multiple selections allowed' : ''}
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
      ref={dropdownRef}
    >
      <div className={displayClassName}>
        {children || (
          <span className={getSelectedOptions().length === 0 ? 'text-gray-400 italic' : ''}>
            {getDisplayText()}
          </span>
        )}
      </div>
      
      {/* Selected items as badges for multiple select */}
      {multiple && Array.isArray(currentValue) && currentValue.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {getSelectedOptions().map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          ))}
        </div>
      )}
      
      {/* Edit indicator */}
      {canEdit && isEditMode && !isEditing && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default EditableSelect;