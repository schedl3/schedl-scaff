import React, { useEffect, useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import { Schedule, ScheduleWeek } from "./ScheduleWeek";
import { TzSelector } from "./TzSelector";
import { Username } from "./Username";
import { XmtpAddress } from "./XmtpAddress";
import { backendGetEnd, backendSet } from "~~/utils/schedlBackendApi";

interface Profile {
  username: string;
  idAddressIsPublic: boolean;
  assistantXmtpAddress: string;
  ethereumAddress: string;
  twitterUsername: string;
  schedule: object;
  tz: string;
  bio: string;
  idAddress: string;
}

export const Me: React.FC = () => {
  const { jwt } = useJwtContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState<string>("loading...");
  const [idAddressIsPublic, setIdAddressIsPublic] = useState<boolean>(false);

  const handleToggle = () => {
    jwt && backendSet(jwt, "idAddressIsPublic", !idAddressIsPublic);
    setIdAddressIsPublic(!idAddressIsPublic);
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(event.target.value);
  };

  const handleSaveBio = () => {
    jwt && backendSet(jwt, "bio", bio);
  };
  const [selectedTz, setSelectedTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleTzChange = (newTz: string) => {
    setSelectedTz(newTz);
    jwt && backendSet(jwt, "tz", newTz);
  };

  useEffect(() => {
    if (jwt) {
      backendGetEnd(jwt, "/users/me", data => {
        setProfile(data);
        setIdAddressIsPublic(data.idAddressIsPublic);
        setBio(data.bio);
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
      <p>
        <input type="checkbox" checked={profile.idAddressIsPublic} onChange={handleToggle} className="checkbox" />{" "}
        idAddressIsPublic: {profile.idAddressIsPublic}
      </p>
      <p>assistantXmtpAddress: {profile.assistantXmtpAddress}</p>
      <XmtpAddress xmtpAddress={profile.assistantXmtpAddress} />
      <p>twitterUsername: {profile.twitterUsername}</p>
      <p>idAddress: {profile.idAddress}</p>
      <p>bio: {profile.bio}</p>
      <textarea className="textarea" value={bio} onChange={handleBioChange} />
      <button onClick={handleSaveBio}>Save</button>
      <p>tz: {profile.tz}</p>
      <TzSelector currentTz={selectedTz} onTzChange={handleTzChange} />
      <p>schedule: {JSON.stringify(profile.schedule)}</p>
      <ScheduleWeek schedule={profile.schedule as Schedule} />
    </div>
  );
};
