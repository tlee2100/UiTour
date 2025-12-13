import React, { useState, useEffect } from "react";
import { Icon } from '@iconify/react';
import "./Calendar.css";

export default function Calendar({ 
  value = { checkIn: '', checkOut: '' }, 
  onChange,
  minDate = null 
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    if (value?.checkIn) {
      const checkInDate = new Date(value.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      setSelectedStart(checkInDate);
      setCurrentMonth(checkInDate.getMonth());
      setCurrentYear(checkInDate.getFullYear());
    } else {
      // Clear check-in date when value is empty
      setSelectedStart(null);
    }
    if (value?.checkOut) {
      const checkOutDate = new Date(value.checkOut);
      checkOutDate.setHours(0, 0, 0, 0);
      setSelectedEnd(checkOutDate);
    } else {
      // Clear check-out date when value is empty
      setSelectedEnd(null);
    }
  }, [value]);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const weekDays = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const getDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay(); 

    let week = new Array(startDayOfWeek).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(new Date(year, month, d));
      if (week.length === 7) {
        days.push(week);
        week = [];
      }
    }
    if (week.length) days.push([...week, ...new Array(7 - week.length).fill(null)]);
    return days;
  };

  const isPast = (date) => {
    if (!date) return false;
    const min = minDate || today;
    return date < min;
  };

  const isInRange = (date) => {
    if (!date || !selectedStart || !selectedEnd) return false;
    return date >= selectedStart && date <= selectedEnd;
  };

  const isStart = (date) => {
    if (!date || !selectedStart) return false;
    return date.getTime() === selectedStart.getTime();
  };

  const isEnd = (date) => {
    if (!date || !selectedEnd) return false;
    return date.getTime() === selectedEnd.getTime();
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.getTime() === today.getTime();
  };

  const handleDateClick = (date) => {
    if (isPast(date)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(date);
      setSelectedEnd(null);
      onChange?.({ checkIn: formatDate(date), checkOut: '' });
    } else if (selectedStart && !selectedEnd) {
      // Complete selection
      if (date < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
        onChange?.({ checkIn: formatDate(date), checkOut: formatDate(selectedStart) });
      } else {
        setSelectedEnd(date);
        onChange?.({ checkIn: formatDate(selectedStart), checkOut: formatDate(date) });
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const months = [
    { month: currentMonth, year: currentYear },
    { month: (currentMonth + 1) % 12, year: currentMonth === 11 ? currentYear + 1 : currentYear }
  ];

  return (
    <div className="cal-container">
      {months.map((m, idx) => {
        const days = getDays(m.year, m.month);
        return (
          <div key={idx} className="cal-month">
            <div className="cal-header">
              <button 
                className="cal-nav-btn" 
                onClick={prevMonth}
                style={{ visibility: idx === 0 ? 'visible' : 'hidden' }}
              >
                <Icon icon="mdi:chevron-left" width="20" height="20" />
              </button>
              <span className="cal-month-name">{monthNames[m.month]} {m.year}</span>
              <button 
                className="cal-nav-btn" 
                onClick={nextMonth}
                style={{ visibility: idx === 1 ? 'visible' : 'hidden' }}
              >
                <Icon icon="mdi:chevron-right" width="20" height="20" />
              </button>
            </div>
            <div className="cal-weekdays">
              {weekDays.map(d => (
                <div key={d} className="cal-weekday">{d}</div>
              ))}
            </div>
            <div className="cal-days">
              {days.map((week, wIdx) => (
                <div key={wIdx} className="cal-week-row">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <div key={dIdx} className="cal-day cal-day-empty" />;
                    }
                    
                    const past = isPast(day);
                    const inRange = isInRange(day);
                    const start = isStart(day);
                    const end = isEnd(day);
                    const todayClass = isToday(day) ? 'cal-today' : '';

                    return (
                      <button
                        key={dIdx}
                        className={`cal-day cal-day-btn ${todayClass} ${past ? 'cal-day-past' : ''} ${start ? 'cal-day-start' : ''} ${end ? 'cal-day-end' : ''} ${inRange ? 'cal-day-in-range' : ''}`}
                        onClick={() => handleDateClick(day)}
                        onMouseEnter={() => !past && setHoverDate(day)}
                        disabled={past}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
