import { useState, useEffect } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { EditableSelect } from '../editable';
import { StaffEditProvider } from '../../contexts/StaffEditContext';
import EditableStaffText from '../editable/EditableStaffText';
import { useStaffManagement } from '../../hooks/useStaffManagement';
import StaffEditModal from './StaffEditModal';
import StaffDetailModal from './StaffDetailModal';

interface Staff {
  id: number;
  name: string;
  role_title?: string;
  role?: string;
  languages: Array<{
    language_code: string;
    cefr_level?: string;
    name_en?: string;
    name_native?: string;
  }> | string[];
  email_public?: string;
  phone_public?: string;
  email?: string;
  phone?: string;
}

interface EditableStaffSectionProps {
  staff: Staff[];
  triggerConfetti: () => void;
}

const EditableStaffSection: React.FC<EditableStaffSectionProps> = ({
  staff,
  triggerConfetti
}) => {
  const { isEditMode, canEdit } = useEditMode();
  const { 
    staff: managedStaff, 
    isLoading, 
    error, 
    createStaff, 
    updateStaff, 
    deleteStaff,
    setStaff,
    clearError 
  } = useStaffManagement(staff);
  
  const [editingStaff, setEditingStaff] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<Staff | null>(null);

  // Update managed staff when prop changes
  useEffect(() => {
    setStaff(staff);
  }, [staff, setStaff]);

  const languageOptions = [
    { value: 'nl', label: 'Dutch', icon: '🇳🇱' },
    { value: 'en', label: 'English', icon: '🇬🇧' },
    { value: 'de', label: 'German', icon: '🇩🇪' },
    { value: 'ar', label: 'Arabic', icon: '🇸🇦' },
    { value: 'fr', label: 'French', icon: '🇫🇷' },
    { value: 'es', label: 'Spanish', icon: '🇪🇸' },
    { value: 'zh', label: 'Chinese', icon: '🇨🇳' },
    { value: 'hi', label: 'Hindi', icon: '🇮🇳' },
    { value: 'tr', label: 'Turkish', icon: '🇹🇷' },
    { value: 'pl', label: 'Polish', icon: '🇵🇱' },
    { value: 'uk', label: 'Ukrainian', icon: '🇺🇦' },
    { value: 'ru', label: 'Russian', icon: '🇷🇺' },
    { value: 'so', label: 'Somali', icon: '🇸🇴' },
    { value: 'ti', label: 'Tigrinya', icon: '🇪🇷' },
  ];

  const getFlagUrl = (langCode: string) => {
    const countryCodeMap: Record<string, string> = {
      'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
      'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'zh-cn': 'cn', 'zh-Hans': 'cn', 
      'yue': 'hk', 'es': 'es', 'hi': 'in', 'tr': 'tr', 'fr': 'fr', 
      'ti': 'er', 'so': 'so', 'pt': 'pt', 'ru': 'ru', 'ber': 'ma'
    };
    const countryCode = countryCodeMap[langCode] || 'un';
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };


  const addNewStaff = async () => {
    clearError();
    const newStaffData = {
      name: 'New Team Member',
      role: 'Staff Member',
      languages: [{ language_code: 'nl', cefr_level: 'B2' }],
      email: '',
      phone: ''
    };
    
    const createdStaff = await createStaff(newStaffData);
    if (createdStaff) {
      setEditingStaff(createdStaff.id);
    }
  };

  const removeStaff = async (staffId: number) => {
    clearError();
    const success = await deleteStaff(staffId);
    if (success) {
      setEditingStaff(null);
    }
  };

  const toggleStaffEdit = (staffId: number) => {
    const staff = managedStaff.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      setModalOpen(true);
    }
  };

  const viewStaffDetails = (staffId: number) => {
    const staff = managedStaff.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaffForDetail(staff);
      setDetailModalOpen(true);
    }
  };

  const handleModalSave = async (updatedStaff: Staff): Promise<boolean> => {
    try {
      const success = await updateStaff(updatedStaff.id, {
        name: updatedStaff.name,
        role: updatedStaff.role_title || updatedStaff.role || '',
        email: updatedStaff.email_public || updatedStaff.email || '',
        phone: updatedStaff.phone_public || updatedStaff.phone || '',
        languages: updatedStaff.languages
      });
      return success !== null;
    } catch (error) {
      console.error('Failed to save staff in modal:', error);
      return false;
    }
  };

  const handleModalDelete = async (staffId: number): Promise<boolean> => {
    try {
      return await deleteStaff(staffId);
    } catch (error) {
      console.error('Failed to delete staff in modal:', error);
      return false;
    }
  };

  // Custom auto-save handler for staff fields
  const handleStaffAutoSave = async (field: string, value: any) => {
    // Extract staff ID and field type from the field string
    const match = field.match(/^staff_(\d+)_(.+)$/);
    if (!match) return false;
    
    const [, staffIdStr, fieldType] = match;
    const staffId = parseInt(staffIdStr);
    
    // Map field types to API field names
    const fieldMap: Record<string, string> = {
      'name': 'name',
      'role': 'role', 
      'email': 'email',
      'phone': 'phone'
    };
    
    const apiField = fieldMap[fieldType];
    if (!apiField) return false;

    try {
      const updateData = { [apiField]: value };
      const updatedStaff = await updateStaff(staffId, updateData);
      return updatedStaff !== null;
    } catch (error) {
      console.error('Failed to save staff field:', error);
      return false;
    }
  };

  // Helper function to get language codes array
  const getLanguageCodes = (languages: Staff['languages']): string[] => {
    if (Array.isArray(languages)) {
      if (languages.length > 0 && typeof languages[0] === 'string') {
        return languages as string[];
      }
      return languages.map((lang: any) => lang.language_code);
    }
    return [];
  };

  // Helper function to get role title
  const getRoleTitle = (member: Staff): string => {
    return member.role_title || member.role || 'Staff Member';
  };

  // Helper function to get email
  const getEmail = (member: Staff): string => {
    return member.email_public || member.email || '';
  };

  // Helper function to get phone  
  const getPhone = (member: Staff): string => {
    return member.phone_public || member.phone || '';
  };

  return (
    <StaffEditProvider onStaffAutoSave={handleStaffAutoSave}>
      <div className="edit-section">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-900">Who Speaks What</h3>
        {canEdit && isEditMode && (
          <button
            onClick={addNewStaff}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            Add Member
          </button>
        )}
      </div>

      <div className="space-y-3">
        {managedStaff.map((member, index) => (
          <div 
            key={member.id} 
            className={`
              flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 group cursor-pointer
              ${editingStaff === member.id && canEdit && isEditMode 
                ? 'bg-blue-50 border-blue-200 shadow-md' 
                : 'bg-gray-50 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:border-primary-200 hover:shadow-md'
              }
              animate-slide-up
            `}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => {
              if (canEdit && isEditMode) {
                toggleStaffEdit(member.id);
              } else {
                viewStaffDetails(member.id);
              }
            }}
            title={canEdit && isEditMode ? "Click to edit team member" : "Click to view contact details"}
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 cursor-pointer shadow-lg group-hover:shadow-xl" 
                 onClick={(e) => {
                   e.stopPropagation();
                   triggerConfetti();
                 }}
                 title="Click me! 🎉">
              {member.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name and Contact Row */}
              <div className="flex items-center gap-2 mb-1">
                {/* Name - Now part of the whole clickable card */}
                <div className="font-medium text-gray-900 text-sm flex-1">
                  {member.name}
                </div>

                {/* Contact Icons - Simple indicators */}
                <div className="flex items-center gap-1">
                  {/* Email Icon - Just visual indicator */}
                  {getEmail(member) && (
                    <div className="p-1 bg-blue-100 rounded-full">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Phone Icon - Just visual indicator */}
                  {getPhone(member) && (
                    <div className="p-1 bg-green-100 rounded-full">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  )}

                  {/* Edit/Delete Buttons in Edit Mode */}
                  {canEdit && isEditMode && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStaffEdit(member.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          editingStaff === member.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                        }`}
                        title={editingStaff === member.id ? 'Close editor' : 'Edit member'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {editingStaff === member.id ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          )}
                        </svg>
                      </button>
                      
                      {managedStaff.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStaff(member.id);
                          }}
                          disabled={isLoading}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete member"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="text-xs text-gray-500 font-medium mb-2">
                {getRoleTitle(member)}
              </div>

              {/* Languages - Now on separate row with wrapping */}
              <div className="flex flex-wrap items-center gap-1">
                {getLanguageCodes(member.languages).map((langCode) => {
                  return (
                    <div key={langCode} className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200 shadow-sm">
                      <img
                        src={getFlagUrl(langCode)}
                        alt={`${langCode} flag`}
                        className="w-3 h-2 object-cover rounded-sm mr-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="uppercase">{langCode}</span>
                    </div>
                  );
                })}
              </div>

              {/* Inline editing removed - now handled by modal */}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {managedStaff.length === 0 && canEdit && isEditMode && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 mb-4">No team members added yet</p>
            <button
              onClick={addNewStaff}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Your First Team Member
            </button>
          </div>
        )}

        {/* Non-edit mode empty state */}
        {managedStaff.length === 0 && (!canEdit || !isEditMode) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No team members listed</p>
          </div>
        )}
      </div>
      
      {/* Staff Edit Modal */}
      <StaffEditModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        isLoading={isLoading}
      />

      {/* Staff Detail Modal */}
      <StaffDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedStaffForDetail(null);
        }}
        staff={selectedStaffForDetail}
      />
      </div>
    </StaffEditProvider>
  );
};

export default EditableStaffSection;