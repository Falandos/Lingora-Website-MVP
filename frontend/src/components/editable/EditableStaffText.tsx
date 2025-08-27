import { useState, useRef, useEffect } from 'react';
import { useStaffEdit } from '../../contexts/StaffEditContext';

interface EditableStaffTextProps {
  value: string;
  field: string;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  multiline?: boolean;
  maxLength?: number;
  children?: React.ReactNode;
}

const EditableStaffText: React.FC<EditableStaffTextProps> = ({
  value,
  field,
  placeholder = 'Click to edit...',
  className = '',
  displayClassName = '',
  inputClassName = '',
  multiline = false,
  maxLength,
  children
}) => {
  const { isEditMode, canEdit, autoSave } = useStaffEdit();
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

  // Show edit indicators only in edit mode
  const editClasses = canEdit && isEditMode 
    ? 'editable-field hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200 cursor-pointer' 
    : '';

  const containerClasses = `${className} ${editClasses}`.trim();

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div ref={containerRef} className={containerClasses}>
        <InputComponent
          ref={inputRef as any}
          type={multiline ? undefined : 'text'}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full px-2 py-1 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            ${multiline ? 'resize-none min-h-[60px]' : ''} 
            ${inputClassName}
          `.trim()}
          rows={multiline ? 3 : undefined}
        />
        {hasChanged && (
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className={containerClasses}
    >
      <div className={`${displayClassName} ${!value && placeholder ? 'text-gray-400' : ''}`}>
        {value || (canEdit && isEditMode ? placeholder : '')}
        {canEdit && isEditMode && (
          <svg className="inline w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
      </div>
      {children}
    </div>
  );
};

export default EditableStaffText;