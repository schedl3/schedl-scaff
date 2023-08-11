import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export const getISODate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;

interface AvailableDates {
  [date: string]: string[][];
}

export interface TimeSlotCalendarProps {
  availableDates: AvailableDates;
  handleDayClick: (date: Date) => void;
}

export function TimeSlotCalendar({ availableDates, handleDayClick }: TimeSlotCalendarProps) {
  const dateDisabled = ({ date }: { date: Date }) => availableDates[getISODate(date)] == undefined;
  const tileContent = ({ date }: { date: Date }) => {
    if (!dateDisabled({ date })) {
      return <div className="highlighted-day"></div>;
    }
  };

  return (
    <div>
      <Calendar
        onChange={handleDayClick as any}
        tileContent={tileContent}
        onClickDay={handleDayClick}
        selectRange={false}
        tileDisabled={dateDisabled}
      />
    </div>
  );
}

export interface TimeSlotListProps {
  ranges: [string, string][];
  slotMinutes: number;
}

export function TimeSlotList({ ranges, slotMinutes }: TimeSlotListProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const generateTimeSlots = (range: [string, string]): string[] => {
    const [startTime, endTime] = range;
    const slots: string[] = [];
    const startHour = new Date(`1970-01-01T${startTime}`);
    const endHour = new Date(`1970-01-01T${endTime}`);

    while (startHour < endHour) {
      const formattedStart = startHour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      slots.push(formattedStart);
      startHour.setMinutes(startHour.getMinutes() + slotMinutes);
    }

    return slots;
  };

  if (!ranges || ranges.length === 0) {
    return null;
  }
  const allTimeSlots = ranges.flatMap(generateTimeSlots);

  return (
    <div className="time-slot-list">
      <p>Selected slot: {selectedSlot === null ? "..." : allTimeSlots[selectedSlot]}</p>
      {allTimeSlots.map((slot, index) => (
        <div
          className={`time-slot-hour ${selectedSlot === index ? "selected" : ""}`}
          key={index}
          onClick={() => setSelectedSlot(index)}
        >
          {slot}
        </div>
      ))}
    </div>
  );
}
