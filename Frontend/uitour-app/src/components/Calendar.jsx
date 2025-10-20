import React from "react";
import "./Calendar.css";

export default function Calendar() {
  const today = new Date();
  const months = [
    today.getMonth(),
    (today.getMonth() + 1) % 12
  ];
  const year = today.getFullYear();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const getDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay(); 

    let week = new Array(startDayOfWeek).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(d);
      if (week.length === 7) {
        days.push(week);
        week = [];
      }
    }
    if (week.length) days.push([...week, ...new Array(7 - week.length).fill(null)]);
    return days;
  };

  return (
    <div className="cal-container">
      {months.map((month, idx) => (
        <div key={idx} className="cal-month">
          <div className="cal-header">
            <span className="cal-month-name">{monthNames[month]} {year}</span>
          </div>
          <div className="cal-weekdays">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
          </div>
          <div className="cal-days">
            {getDays(year, month).map((week, wIdx) => (
              <div key={wIdx} className="cal-week-row">
                {week.map((day, dIdx) => (
                  <div 
                    key={dIdx} 
                    className={`cal-day ${day === today.getDate() && month === today.getMonth() ? 'cal-today' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
