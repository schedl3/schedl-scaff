import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Time24H = string;
type Date24H = Date;
const time24HtoDate24H = (t: Time24H): Date24H => new Date(`1970-01-01T${t}`);
const fmtDate24H = (d: Date24H) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
  ranges: [Time24H, Time24H][];
  slotMinutes: number;
}

export function TimeSlotList({ ranges, slotMinutes }: TimeSlotListProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const generateTimeSlots = (range: [Time24H, Time24H]): Date24H[] => {
    const slots: Date24H[] = [];
    const [startTime, endTime] = range;
    const startHour = time24HtoDate24H(startTime);

    while (startHour < time24HtoDate24H(endTime)) {
      slots.push(new Date(startHour));
      startHour.setMinutes(startHour.getMinutes() + slotMinutes);
    }

    return slots;
  };

  const bookSlot = (slot: Date24H) => {
    console.log(`Booking slot: ${slot}`);
  };

  if (!ranges || ranges.length === 0) {
    return null;
  }
  const allTimeSlots: Date24H[] = ranges.flatMap(generateTimeSlots);

  return (
    <div className="time-slot-list">
      <p>Selected slot: {selectedSlot === null ? "..." : fmtDate24H(allTimeSlots[selectedSlot])}</p>
      {allTimeSlots.map((slot, index) => (
        <div
          className={`time-slot-hour ${selectedSlot === index ? "selected" : ""}`}
          key={index}
          onClick={() => setSelectedSlot(index)}
        >
          {selectedSlot === index ? (
            <>
              {fmtDate24H(slot)}
              <button onClick={() => bookSlot(allTimeSlots[selectedSlot])} className="btn">
                Book
              </button>
            </>
          ) : (
            fmtDate24H(slot)
          )}
        </div>
      ))}
    </div>
  );
}
