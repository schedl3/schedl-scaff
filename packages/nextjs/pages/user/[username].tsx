import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useJwtContext } from "~~//contexts/JwtContext";
import { MetaHeader } from "~~/components/MetaHeader";
import { Schedule } from "~~/components/ScheduleWeek";
import { TimeSlotCalendar, TimeSlotList, getISODate } from "~~/components/TimeSlotPicker";
import { TzSelector } from "~~/components/TzSelector";
import { backendBook, backendGetEnd } from "~~/utils/schedlBackendApi";

interface PartialUser {
  username: string;
  schedule: Schedule;
  twitterUsername: string;
  bio: string;
  tz: string;
}

const UserProfile: React.FC<{ username: string | undefined }> = ({ username }) => {
  const { jwt } = useJwtContext();
  const account = useAccount();
  const [user, setUser] = useState<PartialUser | undefined>(undefined);
  const [avail, setAvail] = useState<any>(undefined);
  const [loadingU, setLoadingU] = useState(true);
  const [loadingA, setLoadingA] = useState(true);
  const [selectedTz, setSelectedTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingU(true);
      try {
        backendGetEnd(false, `/users/?username=${username}`, (data: any) => {
          const user: PartialUser = data;
          setUser(user);
          setLoadingU(false);
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoadingU(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingA(true);
      try {
        backendGetEnd(false, `/users/availability?tz=${selectedTz}&username=${username}`, (data: any) => {
          const times: any = data;
          setAvail(times);
          setLoadingA(false); // XXX
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoadingA(false);
      }
    };

    fetchUserProfile();
  }, [username, selectedTz]);

  const handleTzChange = (newTz: string) => {
    setSelectedTz(newTz);

    setLoadingA(true);
    backendGetEnd(false, `/users/availability?tz=${newTz}&username=${username}`, (data: any) => {
      const times: any = data;
      setAvail(times);
      setLoadingA(false); // XXX
    });
  };

  const handleDayClick = (date: Date) => {
    // not date.toISOString() - cal day is in local tz, toLocaleDateString wrong fmt
    const formattedDate = getISODate(date);
    if (avail[formattedDate]) {
      setSelectedDate(date);
      setSelectedDay(formattedDate);
    }
  };

  const handleBookSlot = (slot: Date) => {
    const { hour, minute } = DateTime.fromJSDate(slot, { zone: "utc" });
    let slotDT = DateTime.fromJSDate(selectedDate);
    slotDT = slotDT.set({ hour, minute });
    slotDT = slotDT.setZone(selectedTz);
    jwt &&
      account.address &&
      username &&
      backendBook(jwt, account.address, username, slotDT.toUTC().toISO()!, 30, "test2");
  };

  if (loadingA || loadingU) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th colSpan={2}>User Profile - {user.username}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Schedule</td>
            <td>{JSON.stringify(user.schedule)}</td>
          </tr>
          <tr>
            <td>Twitter Username</td>
            <td>{user.twitterUsername}</td>
          </tr>
          <tr>
            <td>Bio</td>
            <td>{user.bio}</td>
          </tr>
          <tr>
            <td>Timezone</td>
            <td>{user.tz}</td>
          </tr>
        </tbody>
      </table>
      {/* {avail && <p>Availability: {JSON.stringify(avail)}</p>} */}
      <TzSelector currentTz={selectedTz} onTzChange={handleTzChange} />
      <p>
        Selected date: {selectedDate.toDateString()} {selectedDay}
      </p>
      <div>
        <div style={{ float: "left" }}>
          <TimeSlotCalendar availableDates={avail} handleDayClick={handleDayClick} />
        </div>
        <div style={{ float: "right" }}>
          <TimeSlotList ranges={avail[selectedDay]} slotMinutes={30} handleBookSlot={handleBookSlot} />
        </div>
      </div>
    </div>
  );
};

const UserPage: NextPage = () => {
  const router = useRouter();
  const { username } = router.query; // XXX string | string[] | undefined
  return (
    <>
      <MetaHeader title={`Schedl UI | ${username}'s Page`} description="">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        {username ? <UserProfile username={Array.isArray(username) ? username[0] : username} /> : null}
      </div>
    </>
  );
};

export default UserPage;
