import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface EditModeContextType {
  isEditMode: boolean;
  canEdit: boolean;
  isOwner: boolean;
  toggleEditMode: () => void;
  enterEditMode: () => void;
  exitEditMode: () => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  autoSave: (field: string, value: any) => Promise<void>;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

interface EditModeProviderProps {
  children: ReactNode;
  providerData?: {
    id: number;
    user_id: number;
    slug: string;
  };
}

export function EditModeProvider({ children, providerData }: EditModeProviderProps) {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check if current user is the owner of this provider page
  const isOwner = !!(user && providerData && user.id === providerData.user_id && user.role === 'provider');
  
  // User can edit if they're the owner and not an admin
  const canEdit = isOwner;

  const toggleEditMode = () => {
    if (canEdit) {
      setIsEditMode(prev => !prev);
    }
  };

  const enterEditMode = () => {
    if (canEdit) {
      setIsEditMode(true);
    }
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSaveStatus('idle');
  };

  // Auto-save function with debouncing
  const autoSave = async (field: string, value: any) => {
    if (!canEdit || !providerData) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        setIsSaving(true);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/providers/my', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            [field]: value
          }),
        });

        if (response.ok) {
          setSaveStatus('saved');
          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Debounce for 2 seconds

    setAutoSaveTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Exit edit mode when user logs out or loses ownership
  useEffect(() => {
    if (!canEdit && isEditMode) {
      setIsEditMode(false);
    }
  }, [canEdit, isEditMode]);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        canEdit,
        isOwner,
        toggleEditMode,
        enterEditMode,
        exitEditMode,
        isSaving,
        saveStatus,
        setSaveStatus,
        autoSave,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}