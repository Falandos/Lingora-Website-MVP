import { useEffect, useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';

const EditModeIndicator = () => {
  const { isEditMode, canEdit } = useEditMode();
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  // Add/remove edit mode class to body
  useEffect(() => {
    if (isEditMode) {
      document.body.classList.add('edit-mode');
      // Show help tooltip briefly when entering edit mode
      setShowHelpTooltip(true);
      const timer = setTimeout(() => {
        setShowHelpTooltip(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove('edit-mode');
      setShowHelpTooltip(false);
    }
  }, [isEditMode]);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      {/* Help tooltip */}
      {showHelpTooltip && isEditMode && (
        <div className="edit-help-tooltip show animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Click on any blue highlighted area to edit • Changes save automatically</span>
            <button 
              onClick={() => setShowHelpTooltip(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Visual edit mode overlay effects */}
      {isEditMode && (
        <style>{`
          .edit-section {
            position: relative;
          }
          
          .edit-section::before {
            content: '';
            position: absolute;
            top: -4px;
            right: -4px;
            bottom: -4px;
            left: -4px;
            border: 1px dashed transparent;
            border-radius: 8px;
            transition: all 0.2s ease;
            pointer-events: none;
          }
          
          .edit-section:hover::before {
            border-color: rgba(59, 130, 246, 0.4);
            background: rgba(59, 130, 246, 0.02);
          }
        `}</style>
      )}
    </>
  );
};

export default EditModeIndicator;