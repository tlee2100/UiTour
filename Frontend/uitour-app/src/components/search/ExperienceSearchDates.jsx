import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import './ExperienceSearchDates.css';

export default function ExperienceSearchDates({ open, onClose, onSelect, value }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      // Parse existing value if any
      if (value) {
        const parts = value.split(' - ');
        if (parts.length === 2) {
          setSelectedRange({ start: new Date(parts[0]), end: new Date(parts[1]) });
        }
      }
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, value]);

  if (!open) return null;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thisWeekend = {
    start: new Date(today),
    end: new Date(today)
  };
  // Find Saturday
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = 6 - dayOfWeek;
  thisWeekend.start.setDate(today.getDate() + daysUntilSaturday);
  thisWeekend.end.setDate(thisWeekend.start.getDate() + 1);

  const formatDate = (date) => {
    const months = ['thg 1', 'thg 2', 'thg 3', 'thg 4', 'thg 5', 'thg 6', 
                    'thg 7', 'thg 8', 'thg 9', 'thg 10', 'thg 11', 'thg 12'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatRange = (start, end) => {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${end.getDate()} ${formatDate(start).split(' ')[1]}`;
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const handleQuickSelect = (type) => {
    let range;
    switch(type) {
      case 'today':
        range = { start: today, end: today };
        break;
      case 'tomorrow':
        range = { start: tomorrow, end: tomorrow };
        break;
      case 'weekend':
        range = thisWeekend;
        break;
      default:
        return;
    }
    setSelectedRange(range);
    onSelect?.(formatRange(range.start, range.end));
  };

  const handleDateClick = (date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else if (selectedRange.start && !selectedRange.end) {
      if (date < selectedRange.start) {
        setSelectedRange({ start: date, end: selectedRange.start });
      } else {
        setSelectedRange({ start: selectedRange.start, end: date });
        onSelect?.(formatRange(selectedRange.start, date));
      }
    }
  };

  const isInRange = (date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isSelected = (date) => {
    if (!selectedRange.start) return false;
    if (selectedRange.end) {
      return date.getTime() === selectedRange.start.getTime() || 
             date.getTime() === selectedRange.end.getTime();
    }
    return date.getTime() === selectedRange.start.getTime();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="esd-popover" role="dialog" aria-label="Select dates">
      <div className="esd-content">
        {/* Quick Select Options */}
        <div className="esd-quick-select">
          <button 
            className="esd-quick-btn"
            onClick={() => handleQuickSelect('today')}
          >
            <div className="esd-quick-label">Hôm nay</div>
            <div className="esd-quick-date">{formatDate(today)}</div>
          </button>
          
          <button 
            className="esd-quick-btn"
            onClick={() => handleQuickSelect('tomorrow')}
          >
            <div className="esd-quick-label">Ngày mai</div>
            <div className="esd-quick-date">{formatDate(tomorrow)}</div>
          </button>
          
          <button 
            className="esd-quick-btn esd-quick-btn-active"
            onClick={() => handleQuickSelect('weekend')}
          >
            <div className="esd-quick-label">Cuối tuần này</div>
            <div className="esd-quick-date">{formatRange(thisWeekend.start, thisWeekend.end)}</div>
          </button>
        </div>

        {/* Calendar */}
        <div className="esd-calendar">
          <div className="esd-calendar-header">
            <button className="esd-nav-btn" onClick={prevMonth}>
              <Icon icon="mdi:chevron-left" width="20" height="20" />
            </button>
            <div className="esd-month-year">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button className="esd-nav-btn" onClick={nextMonth}>
              <Icon icon="mdi:chevron-right" width="20" height="20" />
            </button>
          </div>

          <div className="esd-weekdays">
            {weekDays.map(day => (
              <div key={day} className="esd-weekday">{day}</div>
            ))}
          </div>

          <div className="esd-days-grid">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="esd-day-empty" />;
              }
              
              const inRange = isInRange(date);
              const selected = isSelected(date);
              const past = isPast(date);
              
              return (
                <button
                  key={date.getTime()}
                  className={`esd-day ${past ? 'esd-day-past' : ''} ${selected ? 'esd-day-selected' : ''} ${inRange ? 'esd-day-in-range' : ''}`}
                  onClick={() => !past && handleDateClick(date)}
                  disabled={past}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

