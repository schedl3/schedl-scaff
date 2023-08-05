import React, { useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import { backendSet } from "~~/utils/schedlBackendApi";

interface UsernameProps {
  username: string;
}

export const Username: React.FC<UsernameProps> = ({ username }) => {
  const [newUsername, setNewUsername] = useState<string>(username);
  const { jwt } = useJwtContext();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(event.target.value);
  };

  const handleUsernameUpdate = () => {
    jwt && backendSet(jwt, "username", newUsername);
  };

  return (
    <div>
      <label htmlFor="username">Username:</label>
      <input type="text" id="username" value={newUsername} disabled={username !== ""} onChange={handleUsernameChange} />
      <button
        onClick={handleUsernameUpdate}
        disabled={username !== ""}
        className={"btn " + username ? "btn-primary" : "btn-disabled"}
      >
        Update
      </button>
    </div>
  );
};
