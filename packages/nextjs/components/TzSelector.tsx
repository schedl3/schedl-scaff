import React from "react";
import TimezoneSelect from "react-timezone-select";

export interface TzSelectorProps {
  currentTz: string;
  onTzChange: (newTz: string) => void;
}
export const TzSelector: React.FC<TzSelectorProps> = ({ currentTz, onTzChange }) => {
  const handleTzChange = (tz: any) => {
    // Call the callback function to save the new tz
    onTzChange(tz.value);
  };

  return (
    <div className="flex items-center mb-4">
      <div className="flex-grow">
        <p className="font-bold">Time Zone</p>
        <TimezoneSelect value={currentTz} onChange={handleTzChange} />
      </div>
    </div>
  );
};
