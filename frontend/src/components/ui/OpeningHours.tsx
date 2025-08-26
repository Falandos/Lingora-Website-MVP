import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TimeSlot {
  open: string;
  close: string;
}

interface DayHours {
  isOpen: boolean;
  slots: TimeSlot[];
}

interface OpeningHoursData {
  [key: string]: DayHours;
}

interface OpeningHoursProps {
  value: OpeningHoursData;
  onChange: (hours: OpeningHoursData) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', labelKey: 'days.monday', short: 'Mon' },
  { key: 'tuesday', labelKey: 'days.tuesday', short: 'Tue' },
  { key: 'wednesday', labelKey: 'days.wednesday', short: 'Wed' },
  { key: 'thursday', labelKey: 'days.thursday', short: 'Thu' },
  { key: 'friday', labelKey: 'days.friday', short: 'Fri' },
  { key: 'saturday', labelKey: 'days.saturday', short: 'Sat' },
  { key: 'sunday', labelKey: 'days.sunday', short: 'Sun' },
];

const DEFAULT_DAY_HOURS: DayHours = {
  isOpen: false,
  slots: [{ open: '09:00', close: '17:00' }]
};

const OpeningHours = ({ value, onChange, disabled = false }: OpeningHoursProps) => {
  const { t } = useTranslation();
  const [hours, setHours] = useState<OpeningHoursData>(value);

  useEffect(() => {
    setHours(value);
  }, [value]);

  const handleDayToggle = (dayKey: string, isOpen: boolean) => {
    const newHours = {
      ...hours,
      [dayKey]: {
        ...DEFAULT_DAY_HOURS,
        isOpen,
        slots: hours[dayKey]?.slots || DEFAULT_DAY_HOURS.slots
      }
    };
    setHours(newHours);
    onChange(newHours);
  };

  const handleTimeChange = (dayKey: string, slotIndex: number, field: 'open' | 'close', value: string) => {
    const newHours = {
      ...hours,
      [dayKey]: {
        ...hours[dayKey],
        slots: hours[dayKey].slots.map((slot, index) =>
          index === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    };
    setHours(newHours);
    onChange(newHours);
  };

  const addTimeSlot = (dayKey: string) => {
    const newHours = {
      ...hours,
      [dayKey]: {
        ...hours[dayKey],
        slots: [
          ...hours[dayKey].slots,
          { open: '09:00', close: '17:00' }
        ]
      }
    };
    setHours(newHours);
    onChange(newHours);
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    if (hours[dayKey].slots.length <= 1) return; // Keep at least one slot

    const newHours = {
      ...hours,
      [dayKey]: {
        ...hours[dayKey],
        slots: hours[dayKey].slots.filter((_, index) => index !== slotIndex)
      }
    };
    setHours(newHours);
    onChange(newHours);
  };

  const copyToAllDays = (dayKey: string) => {
    const sourceDay = hours[dayKey];
    const newHours = { ...hours };
    
    DAYS_OF_WEEK.forEach(day => {
      if (day.key !== dayKey) {
        newHours[day.key] = {
          isOpen: sourceDay.isOpen,
          slots: [...sourceDay.slots]
        };
      }
    });
    
    setHours(newHours);
    onChange(newHours);
  };

  const renderTimeSlot = (dayKey: string, slot: TimeSlot, slotIndex: number) => (
    <div key={slotIndex} className="flex items-center space-x-2">
      <input
        type="time"
        value={slot.open}
        onChange={(e) => handleTimeChange(dayKey, slotIndex, 'open', e.target.value)}
        disabled={disabled || !hours[dayKey]?.isOpen}
        className="input-field text-sm w-20"
      />
      <span className="text-gray-400 text-sm">to</span>
      <input
        type="time"
        value={slot.close}
        onChange={(e) => handleTimeChange(dayKey, slotIndex, 'close', e.target.value)}
        disabled={disabled || !hours[dayKey]?.isOpen}
        className="input-field text-sm w-20"
      />
      {hours[dayKey].slots.length > 1 && (
        <button
          type="button"
          onClick={() => removeTimeSlot(dayKey, slotIndex)}
          disabled={disabled || !hours[dayKey]?.isOpen}
          className="text-red-500 hover:text-red-700 text-sm p-1"
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Opening Hours</h3>
        <div className="text-sm text-gray-500">
          Set your weekly schedule
        </div>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const dayHours = hours[day.key] || DEFAULT_DAY_HOURS;
          
          return (
            <div key={day.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dayHours.isOpen}
                      onChange={(e) => handleDayToggle(day.key, e.target.checked)}
                      disabled={disabled}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                      {day.short} - {t(day.labelKey, day.key)}
                    </span>
                  </label>
                </div>
                
                {dayHours.isOpen && (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => addTimeSlot(day.key)}
                      disabled={disabled}
                      className="text-xs text-primary-600 hover:text-primary-800"
                    >
                      + Add slot
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToAllDays(day.key)}
                      disabled={disabled}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Copy to all
                    </button>
                  </div>
                )}
              </div>

              {dayHours.isOpen ? (
                <div className="space-y-2 ml-6">
                  {dayHours.slots.map((slot, slotIndex) =>
                    renderTimeSlot(day.key, slot, slotIndex)
                  )}
                </div>
              ) : (
                <div className="ml-6 text-sm text-gray-500">Closed</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div>💡 You can add multiple time slots per day (e.g., morning + evening)</div>
        </div>
        <div className="mt-1">
          Use "Copy to all" to quickly apply the same hours to all days of the week
        </div>
      </div>
    </div>
  );
};

export default OpeningHours;