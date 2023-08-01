import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:3000";

export const Challenge = () => {
  const [challenge, setChallenge] = useState("");

  const handleChallengeClick = async () => {
    try {
      const response = await axios.get(BACKEND_URL + "/challenge");
      const { nonce } = response.data; // TODO verify nonce
      setChallenge(nonce);
    } catch (error) {
      console.error("Error fetching nonce:", error);
    }
  };

  return (
    <div>
      <p>Challenge: {challenge}</p>
      <button onClick={handleChallengeClick} className="btn btn-sm btn-primary">
        Challenge
      </button>
    </div>
  );
};
