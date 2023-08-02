import React, { useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import axios from "axios";

const BACKEND_URL = "https://localhost:3000";

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
    if (jwt) {
      axios
        .post(
          BACKEND_URL + "/setUsername",
          { username: newUsername },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        )
        .then(response => {
          console.log("Username updated successfully!", response.data);
        })
        .catch(error => {
          console.error("Error updating username (Username can only be set if it is currently empty):", error);
        });
    }
  };

  return (
    <div>
      <label htmlFor="username">Username:</label>
      <input type="text" id="username" value={newUsername} placeholder={username} onChange={handleUsernameChange} />
      <button onClick={handleUsernameUpdate}>Update</button>
    </div>
  );
};
