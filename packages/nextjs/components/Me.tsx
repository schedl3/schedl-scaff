import React, { useEffect, useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import { Username } from "./Username";
import { XmtpAddress } from "./XmtpAddress";
import axios from "axios";

const BACKEND_URL = "https://localhost:3000";

interface Profile {
  username: string;
  assistantXmtpAddress: string;
  ethereumAddress: string;
  twitterUsername: string;
  schedule: object;
  idAddress: string;
}

export const Me: React.FC = () => {
  const { jwt } = useJwtContext();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (jwt) {
      axios
        .get(BACKEND_URL + "/profile/schedule", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })
        .then(response => {
          console.log("response.data check w", response.data);
          setProfile(response.data);
        })
        .catch(error => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [jwt]);

  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h2>Profile Information</h2>
      <Username username={profile.username} />
      <p>assistantXmtpAddress: {profile.assistantXmtpAddress}</p>
      <XmtpAddress xmtpAddress={profile.assistantXmtpAddress} />
      <p>twitterUsername: {profile.twitterUsername}</p>
      <p>ethereumAddress: {profile.ethereumAddress}</p>
      <p>idAddress: {profile.idAddress}</p>
      <p>schedule: {JSON.stringify(profile.schedule)}</p>
    </div>
  );
};
