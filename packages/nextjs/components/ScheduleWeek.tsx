import React, { useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import { backendSet } from "~~/utils/schedlBackendApi";

// copied from bookings.utils
type Partial24hTime = string & { __partial24hTimeBrand: never };
const validatePartial24hTime = (value: string): Partial24hTime => {
  // Regular expression to match 24-hour time format
  const regex = /^(?:2[0-3]|[01]?[0-9])(?::([0-5]?[0-9]))?$/;

  if (!regex.test(value)) {
    throw new Error(value + ": Invalid partial 24-hour time format. Use HH or HH:mm format.");
  }

  return value as Partial24hTime;
};

// not copied from bookings.utils
export interface Schedule {
  [day: string]: string;
}
type CSVRanges = string;

interface ScheduleWeekProps {
  schedule: Schedule;
}

export const ScheduleWeek: React.FC<ScheduleWeekProps> = ({ schedule }) => {
  const { jwt } = useJwtContext();
  const [scheduleData, setScheduleData] = useState<Schedule>(schedule);

  const handleDayChange = (day: string, ranges: CSVRanges) => {
    setScheduleData(prevSchedule => {
      const next = { ...prevSchedule, [day]: ranges };
      console.log("next", next);
      jwt && backendSet(jwt, "schedule", next as Schedule);
      return next;
    });
  };

  return (
    <div>
      {JSON.stringify(scheduleData)}
      <table className="table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time Ranges</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scheduleData).map(([day, ranges]) => (
            <tr key={day}>
              <td>{day}</td>
              <td>
                <UpdateRanges ranges={ranges} onChange={(newRanges: CSVRanges) => handleDayChange(day, newRanges)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface UpdateRangesProps {
  ranges: CSVRanges;
  onChange: (newRanges: CSVRanges) => void;
}

const UpdateRanges: React.FC<UpdateRangesProps> = ({ ranges, onChange }) => {
  const [timeRanges, setTimeRanges] = useState<string[]>(ranges ? ranges.split(",") : []);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRanges = [...timeRanges];
    newRanges[index] = event.target.value;
    setTimeRanges(newRanges);
  };

  const handleUpdateRange = (index: number) => {
    try {
      const range = timeRanges[index].trim();
      timeRanges[index] = range; // might have trimmed whitespace
      range.split("-").forEach(validatePartial24hTime);
      range.split("-").forEach(time => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, mm] = time.split(":");
        // mm must be 0, 15, or 30
        if (mm && ![0, 15, 30].includes(parseInt(mm))) {
          throw new Error("Minutes must be 0, 15, or 30.");
        }
      });

      onChange(timeRanges.join(","));
      setValidationError(null);
    } catch (error: any) {
      setValidationError(error.toString());
    }
  };

  const handleDeleteRange = (indexToDelete: number) => {
    const updatedTimeRanges = [...timeRanges];
    updatedTimeRanges.splice(indexToDelete, 1);
    setTimeRanges(updatedTimeRanges);
    onChange(updatedTimeRanges.join(","));
  };

  const handleAddRange = () => {
    setTimeRanges(prevRanges => [...prevRanges, ""]);
  };

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Range</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {timeRanges.map((range, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={range}
                  onChange={e => handleChange(e, index)}
                  className="input w-full max-w-xs"
                />
              </td>
              <td>
                <button onClick={() => handleUpdateRange(index)} className="btn btn-sm btn-primary">
                  Update
                </button>
              </td>
              <td>
                <button onClick={() => handleDeleteRange(index)} className="btn btn-sm btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRange} className="btn btn-sm btn-primary">
        Add
      </button>
      {validationError && <p style={{ color: "red" }}>{validationError}</p>}
    </div>
  );
};

export default UpdateRanges;
