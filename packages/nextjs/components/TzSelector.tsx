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
    <div>
      <h2>Time Zone Selector</h2>
      <blockquote>Please make a selection</blockquote>
      <div className="select-wrapper">
        <TimezoneSelect value={currentTz} onChange={handleTzChange} />
      </div>
    </div>
  );
};
