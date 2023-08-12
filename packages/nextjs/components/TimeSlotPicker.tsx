import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Time24H = string;
type Date24H = Date;
const pad02 = (n: number) => n.toString().padStart(2, "0");
const time24HtoEpochDate24H = (t: Time24H): Date24H => new Date(`1970-01-01T${t}Z`);
// NOT: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtEpochDate24H = (d: Date24H) => `${pad02(d.getUTCHours())}:${pad02(d.getUTCMinutes())}`;

export const getISODate = (date: Date) =>
  `${date.getFullYear()}-${pad02(date.getMonth() + 1)}-${pad02(date.getDate())}`;

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
  handleBookSlot: (slot: Date24H) => void;
}

export function TimeSlotList({ ranges, slotMinutes, handleBookSlot }: TimeSlotListProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const generateTimeSlots = (range: [Time24H, Time24H]): Date24H[] => {
    const slots: Date24H[] = [];
    const [startTime, endTime] = range;
    const startHour = time24HtoEpochDate24H(startTime);

    while (startHour < time24HtoEpochDate24H(endTime)) {
      slots.push(new Date(startHour));
      startHour.setMinutes(startHour.getMinutes() + slotMinutes);
    }

    return slots;
  };

  if (!ranges || ranges.length === 0) {
    return null;
  }
  const allTimeSlots: Date24H[] = ranges.flatMap(generateTimeSlots);

  return (
    <div className="time-slot-list">
      <p>Selected slot: {selectedSlot === null ? "..." : fmtEpochDate24H(allTimeSlots[selectedSlot])}</p>
      {allTimeSlots.map((slot, index) => (
        <div
          className={`time-slot-hour ${selectedSlot === index ? "selected" : ""}`}
          key={index}
          onClick={() => setSelectedSlot(index)}
        >
          {selectedSlot === index ? (
            <>
              {fmtEpochDate24H(slot)}
              <button onClick={() => handleBookSlot(allTimeSlots[selectedSlot])} className="btn">
                Book
              </button>
            </>
          ) : (
            fmtEpochDate24H(slot)
          )}
        </div>
      ))}
    </div>
  );
}
