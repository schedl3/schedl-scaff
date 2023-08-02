import React, { useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import axios from "axios";

const BACKEND_URL = "https://localhost:3000";

interface XmtpAddressProps {
  xmtpAddress: string;
}

export const XmtpAddress: React.FC<XmtpAddressProps> = ({ xmtpAddress }) => {
  const [newXmtpAddress, setNewXmtpAddress] = useState<string>(xmtpAddress);
  const { jwt } = useJwtContext();

  const handleXmtpAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewXmtpAddress(event.target.value);
  };

  const handleXmtpAddressUpdate = () => {
    if (jwt) {
      axios
        .post(
          BACKEND_URL + "/setAssistantXmtpAddress",
          { assistantXmtpAddress: newXmtpAddress },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        )
        .then(response => {
          console.log("assistantXmtpAddress updated successfully!", response.data);
        })
        .catch(error => {
          console.error("Error updating assistantXmtpAddress, maybe not confirmed:", error);
        });
    }
  };

  return (
    <div>
      <label htmlFor="xmtpAddress">XmtpAddress:</label>
      <input
        type="text"
        id="xmtpAddress"
        value={newXmtpAddress}
        placeholder={xmtpAddress}
        onChange={handleXmtpAddressChange}
      />
      <button onClick={handleXmtpAddressUpdate}>Update</button>
    </div>
  );
};
