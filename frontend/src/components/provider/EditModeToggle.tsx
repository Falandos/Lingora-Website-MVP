import { useEditMode } from '../../contexts/EditModeContext';
import { useSearchParams } from 'react-router-dom';

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PreviewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LoadingIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EditModeToggle = () => {
  const { canEdit, isEditMode, toggleEditMode, exitEditMode, saveStatus, isSaving } = useEditMode();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!canEdit) {
    return null;
  }

  const handleSaveAndExit = () => {
    // Remove the edit parameter using React Router
    // This will trigger the useEffect in ProviderPage to exit edit mode
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('edit');
    setSearchParams(newParams);
  };

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-blue-600">
            <LoadingIcon />
            <span className="ml-2 text-xs">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-green-600">
            <SaveIcon />
            <span className="ml-2 text-xs">Saved!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <ErrorIcon />
            <span className="ml-2 text-xs">Error!</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg animate-fade-in">
          {getSaveStatusDisplay()}
        </div>
      )}
      
      {/* Edit Mode Controls */}
      {isEditMode ? (
        <div className="flex items-center space-x-3">
          {/* Edit Mode Active Indicator */}
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-sm font-medium">Edit Mode Active</span>
            </div>
          </div>
          
          {/* Save & Exit Button */}
          <button
            onClick={handleSaveAndExit}
            className="group relative flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            disabled={isSaving}
            title="Save all changes and exit edit mode"
          >
            <div className="flex items-center space-x-2">
              {isSaving ? (
                <LoadingIcon />
              ) : (
                <SaveIcon />
              )}
              <span className="text-sm font-medium">Save & Exit</span>
            </div>
          </button>
        </div>
      ) : (
        /* Entry Edit Mode Button */
        <button
          onClick={toggleEditMode}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-primary-600 hover:bg-primary-700 focus:ring-primary-200 text-white transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 cursor-pointer"
          title="Edit Your Profile"
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-20 scale-0 group-hover:scale-100 transition-transform duration-300" />
          <EditIcon />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Edit Your Profile
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
          </div>
        </button>
      )}
    </div>
  );
};

export default EditModeToggle;