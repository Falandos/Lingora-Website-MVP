import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  languages: Array<{
    language_code: string;
    cefr_level: string;
    name_en?: string;
    name_native?: string;
  }>;
  is_active?: boolean;
  is_public?: boolean;
}

interface UseStaffManagementReturn {
  staff: StaffMember[];
  isLoading: boolean;
  error: string | null;
  createStaff: (data: Partial<StaffMember>) => Promise<StaffMember | null>;
  updateStaff: (id: number, data: Partial<StaffMember>) => Promise<StaffMember | null>;
  deleteStaff: (id: number) => Promise<boolean>;
  setStaff: (staff: StaffMember[]) => void;
  clearError: () => void;
}

export const useStaffManagement = (initialStaff: StaffMember[] = []): UseStaffManagementReturn => {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createStaff = useCallback(async (data: Partial<StaffMember>): Promise<StaffMember | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createStaff({
        name: data.name || 'New Team Member',
        role: data.role || 'Staff Member',
        email: data.email,
        phone: data.phone,
        languages: data.languages?.map(lang => ({
          language_code: lang.language_code,
          cefr_level: lang.cefr_level
        }))
      });

      if (response.success && response.data) {
        const newStaff = response.data as StaffMember;
        setStaff(prev => [...prev, newStaff]);
        return newStaff;
      } else {
        setError(response.message || 'Failed to create staff member');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStaff = useCallback(async (id: number, data: Partial<StaffMember>): Promise<StaffMember | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.role) updateData.role = data.role;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.is_public !== undefined) updateData.is_public = data.is_public;

      const response = await apiService.updateStaff(id, updateData);

      if (response.success && response.data) {
        const updatedStaff = response.data as StaffMember;
        setStaff(prev => prev.map(member => member.id === id ? updatedStaff : member));
        
        // Update languages separately if provided
        if (data.languages) {
          // TODO: Implement language update API call if needed
          // For now, just update the local state
          setStaff(prev => prev.map(member => 
            member.id === id ? { ...member, languages: data.languages! } : member
          ));
        }
        
        return updatedStaff;
      } else {
        setError(response.message || 'Failed to update staff member');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteStaff = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.deleteStaff(id);

      if (response.success) {
        setStaff(prev => prev.filter(member => member.id !== id));
        return true;
      } else {
        setError(response.message || 'Failed to delete staff member');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    staff,
    isLoading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    setStaff,
    clearError
  };
};