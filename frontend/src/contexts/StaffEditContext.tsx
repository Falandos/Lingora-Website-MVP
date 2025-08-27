import { createContext, useContext, type ReactNode } from 'react';
import { useEditMode } from './EditModeContext';

interface StaffEditContextType {
  isEditMode: boolean;
  canEdit: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  autoSave: (field: string, value: any) => Promise<void>;
}

const StaffEditContext = createContext<StaffEditContextType | undefined>(undefined);

interface StaffEditProviderProps {
  children: ReactNode;
  onStaffAutoSave: (field: string, value: any) => Promise<boolean>;
}

export function StaffEditProvider({ children, onStaffAutoSave }: StaffEditProviderProps) {
  const { isEditMode, canEdit, isSaving, saveStatus, setSaveStatus } = useEditMode();

  // Custom auto-save handler for staff fields
  const autoSave = async (field: string, value: any) => {
    if (!canEdit) return;

    try {
      setSaveStatus('saving');
      const success = await onStaffAutoSave(field, value);
      
      if (success) {
        setSaveStatus('saved');
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Staff auto-save failed:', error);
      setSaveStatus('error');
    }
  };

  return (
    <StaffEditContext.Provider value={{
      isEditMode,
      canEdit,
      isSaving,
      saveStatus,
      setSaveStatus,
      autoSave
    }}>
      {children}
    </StaffEditContext.Provider>
  );
}

export function useStaffEdit() {
  const context = useContext(StaffEditContext);
  if (context === undefined) {
    throw new Error('useStaffEdit must be used within a StaffEditProvider');
  }
  return context;
}