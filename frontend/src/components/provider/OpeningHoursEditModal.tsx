import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useEditMode } from '../../contexts/EditModeContext';

interface TimeSlot {
  open: string;
  close: string;
}

interface DayInfo {
  isOpen: boolean;
  slots: TimeSlot[];
}

interface OpeningHoursData {
  monday: DayInfo;
  tuesday: DayInfo;
  wednesday: DayInfo;
  thursday: DayInfo;
  friday: DayInfo;
  saturday: DayInfo;
  sunday: DayInfo;
}

interface OpeningHoursEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  openingHoursData: OpeningHoursData;
  onSave: (updatedData: OpeningHoursData) => Promise<boolean>;
}

const OpeningHoursEditModal: React.FC<OpeningHoursEditModalProps> = ({
  isOpen,
  onClose,
  openingHoursData,
  onSave
}) => {
  const [formData, setFormData] = useState<OpeningHoursData>(openingHoursData);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { autoSave } = useEditMode();
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };
  
  // Track if there are any changes from original data
  const hasChanges = () => {
    return days.some(day => {
      const original = openingHoursData[day];
      const current = formData[day];
      
      if (original.isOpen !== current.isOpen) return true;
      if (original.slots.length !== current.slots.length) return true;
      
      return original.slots.some((slot, index) => {
        const currentSlot = current.slots[index];
        return !currentSlot || slot.open !== currentSlot.open || slot.close !== currentSlot.close;
      });
    });
  };

  // Initialize form data ONLY when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...openingHoursData });
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSaving(false);
      setValidationError('');
    }
  }, [isOpen]);

  const validateTimeSlot = (open: string, close: string): boolean => {
    if (!open || !close) return false;
    
    const openTime = new Date(`1970-01-01T${open}:00`);
    const closeTime = new Date(`1970-01-01T${close}:00`);
    
    return openTime < closeTime;
  };

  const validateForm = (): boolean => {
    const errors = [];
    
    days.forEach(day => {
      const dayInfo = formData[day];
      if (dayInfo.isOpen && dayInfo.slots.length > 0) {
        dayInfo.slots.forEach((slot, index) => {
          if (!validateTimeSlot(slot.open, slot.close)) {
            errors.push(`${dayLabels[day]} - Time slot ${index + 1}: Opening time must be before closing time`);
          }
        });
      }
    });

    if (errors.length > 0) {
      setValidationError(errors.join('; '));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setValidationError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save opening hours:', error);
      setValidationError('Failed to save opening hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDayOpen = (day: keyof OpeningHoursData) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
        slots: !prev[day].isOpen ? [{ open: '09:00', close: '17:00' }] : []
      }
    }));
    
    // Clear validation error when user makes changes
    if (validationError) {
      setValidationError('');
    }
  };

  const addTimeSlot = (day: keyof OpeningHoursData) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { open: '09:00', close: '17:00' }]
      }
    }));
  };

  const removeTimeSlot = (day: keyof OpeningHoursData, slotIndex: number) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, index) => index !== slotIndex)
      }
    }));
  };

  const updateTimeSlot = (day: keyof OpeningHoursData, slotIndex: number, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, index) => 
          index === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const applyToAllDays = (templateDay: keyof OpeningHoursData) => {
    const template = formData[templateDay];
    const updatedData = { ...formData };
    
    days.forEach(day => {
      if (day !== templateDay) {
        updatedData[day] = {
          isOpen: template.isOpen,
          slots: template.slots.map(slot => ({ ...slot }))
        };
      }
    });
    
    setFormData(updatedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Opening Hours</h2>
                <p className="text-sm text-gray-500">Set your availability throughout the week</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={saving}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Validation Error Message */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{validationError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {dayLabels[day]}
                    </h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData[day].isOpen}
                        onChange={() => toggleDayOpen(day)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        disabled={saving}
                      />
                      <span className="ml-2 text-sm text-gray-600">Open</span>
                    </label>
                  </div>
                  
                  {formData[day].isOpen && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addTimeSlot(day)}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                        disabled={saving}
                      >
                        Add Time Slot
                      </button>
                      <button
                        onClick={() => applyToAllDays(day)}
                        className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded"
                        disabled={saving}
                        title="Apply these hours to all days"
                      >
                        Copy to All
                      </button>
                    </div>
                  )}
                </div>

                {formData[day].isOpen ? (
                  <div className="space-y-2">
                    {formData[day].slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) => updateTimeSlot(day, slotIndex, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={saving}
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) => updateTimeSlot(day, slotIndex, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={saving}
                          />
                        </div>
                        
                        {formData[day].slots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(day, slotIndex)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            disabled={saving}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {formData[day].slots.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No time slots set</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Closed</p>
                )}
              </div>
            ))}
          </div>

          {/* Quick Templates */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Templates</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const businessHours = { isOpen: true, slots: [{ open: '09:00', close: '17:00' }] };
                  const weekdaysOnly = {
                    monday: businessHours, tuesday: businessHours, wednesday: businessHours,
                    thursday: businessHours, friday: businessHours,
                    saturday: { isOpen: false, slots: [] }, sunday: { isOpen: false, slots: [] }
                  };
                  setFormData(weekdaysOnly);
                }}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Business Hours (9-5, Mon-Fri)
              </button>
              <button
                onClick={() => {
                  const allDay = { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] };
                  const allDays = days.reduce((acc, day) => ({ ...acc, [day]: allDay }), {} as OpeningHoursData);
                  setFormData(allDays);
                }}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                24/7
              </button>
              <button
                onClick={() => {
                  const closed = { isOpen: false, slots: [] };
                  const allClosed = days.reduce((acc, day) => ({ ...acc, [day]: closed }), {} as OpeningHoursData);
                  setFormData(allClosed);
                }}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Closed All Week
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            className={`${hasChanges() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </div>
            ) : (
              hasChanges() ? 'Save Changes' : 'No Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpeningHoursEditModal;