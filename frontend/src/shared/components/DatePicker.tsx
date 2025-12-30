import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export const DatePicker = ({ value, onChange, placeholder }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value to set initial year and month
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} style={{ padding: '0.5rem' }} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === dateStr;
      const isToday = new Date().toDateString() === new Date(selectedYear, selectedMonth, day).toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: isSelected ? 'rgba(180, 160, 134, 0.4)' : 'transparent',
            color: isSelected ? '#E8DCC0' : isToday ? '#D4C5A9' : '#A39178',
            fontSize: '0.875rem',
            fontFamily: "'Noto Serif KR', serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: isSelected ? '600' : '400'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'rgba(180, 160, 134, 0.2)';
              e.currentTarget.style.color = '#D4C5A9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isToday ? '#D4C5A9' : '#A39178';
            }
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(180, 160, 134, 0.3)',
          background: 'rgba(15, 15, 20, 0.6)',
          color: value ? '#E8DCC0' : '#A39178',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.3s',
          fontFamily: "'Noto Serif KR', serif",
          boxSizing: 'border-box',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.6)';
          e.currentTarget.style.background = 'rgba(15, 15, 20, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.3)';
          e.currentTarget.style.background = 'rgba(15, 15, 20, 0.6)';
        }}
      >
        <span>{value ? formatDisplayDate(value) : placeholder || '날짜 선택'}</span>
        <span style={{ fontSize: '1rem' }}>📅</span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          right: 0,
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          border: '1px solid rgba(180, 160, 134, 0.3)',
          padding: '1rem',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Month/Year Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: '0.5rem'
          }}>
            <button
              type="button"
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D4C5A9',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem'
              }}
            >
              ‹
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  background: 'rgba(15, 15, 20, 0.6)',
                  border: '1px solid rgba(180, 160, 134, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#E8DCC0',
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: "'Noto Serif KR', serif",
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{
                  background: 'rgba(15, 15, 20, 0.6)',
                  border: '1px solid rgba(180, 160, 134, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#E8DCC0',
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: "'Noto Serif KR', serif",
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D4C5A9',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem'
              }}
            >
              ›
            </button>
          </div>

          {/* Week Days */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            {weekDays.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: '#A39178',
                  fontFamily: "'Noto Serif KR', serif",
                  padding: '0.25rem'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem'
          }}>
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};
