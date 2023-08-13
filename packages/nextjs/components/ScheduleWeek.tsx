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

  const overrideDaisyRounding = { borderRadius: 0 };
  return (
    <div className="w-8">
      {/* {JSON.stringify(scheduleData)} */}
      <table className="table table-zebra ">
        {/* <thead>
          <tr>
            <th>Day</th>
            <th>Time Ranges</th>
          </tr>
        </thead> */}
        <tbody className="table table-zebra rounded-none">
          {Object.entries(scheduleData).map(([day, ranges]) => (
            <tr key={day}>
              <td className="p-4" style={overrideDaisyRounding}>
                {day}
              </td>
              <td className="p-1">
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
        {/* <thead>
          <tr>
            <th>Range</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead> */}
        <tbody>
          {timeRanges.length === 0 ? (
            <tr>
              <td>Unavailable</td>
            </tr>
          ) : (
            timeRanges.map((range, index) => (
              <tr key={index} className="p-0">
                <td className="p-1">
                  <input
                    type="text"
                    value={range}
                    placeholder="HH:mm-HH:mm"
                    onChange={e => handleChange(e, index)}
                    className="input w-36 border border-gray-300 rounded-md px-2 py-1"
                  />
                </td>
                <td className="p-1">
                  <button
                    onClick={() => handleUpdateRange(index)}
                    className="btn btn-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Update
                  </button>
                </td>
                <td className="p-1">
                  <button onClick={() => handleDeleteRange(index)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button onClick={handleAddRange}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {validationError && <p className="text-red-500 mt-2">{validationError}</p>}
    </div>
  );
};

export default UpdateRanges;
