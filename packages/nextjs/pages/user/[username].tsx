import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckCircleIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useJwtContext } from "~~//contexts/JwtContext";
import { MetaHeader } from "~~/components/MetaHeader";
import { TimeSlotCalendar, TimeSlotList, fmtEpochDate24H, getISODate } from "~~/components/TimeSlotPicker";
import { TzSelector } from "~~/components/TzSelector";
import { backendBook, backendGetEnd } from "~~/utils/schedlBackendApi";

interface PartialUser {
  username: string;
  ethereumAddress: string;
  twitterUsername: string;
  bio: string;
}

const UserProfile: React.FC<{ username: string | undefined }> = ({ username }) => {
  const { jwt } = useJwtContext();
  const account = useAccount();
  const [user, setUser] = useState<PartialUser | undefined>(undefined);
  const [tokensDeposited, setTokensDeposited] = useState<number>(0);
  const [avail, setAvail] = useState<any>(undefined);
  const [loadingU, setLoadingU] = useState(true);
  const [loadingA, setLoadingA] = useState(true);
  const [selectedTz, setSelectedTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingU(true);
      try {
        backendGetEnd(false, `/users/?username=${username}`, (data: any) => {
          const user: PartialUser = data;
          setUser(user);
          setLoadingU(false);

          backendGetEnd(
            false,
            "/token-payment/deposited-tokens/?" +
              (data.username ? "username=" + data.username : "address=" + data.idAddress),
            data => {
              setTokensDeposited(data.depositedTokens);
            },
          );
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
    setSelectedSlot(slot);
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleClickRequestBooking = () => {
    console.log("Message saved:", message);
    if (!selectedSlot || !selectedDate) {
      console.error("No slot/date selected");
      return;
    }
    const { hour, minute } = DateTime.fromJSDate(selectedSlot, { zone: "utc" });
    let slotDT = DateTime.fromJSDate(selectedDate);
    slotDT = slotDT.set({ hour, minute });
    slotDT = slotDT.setZone(selectedTz);
    const t = slotDT.toUTC().toISO();
    if (!t) {
      console.error("Invalid date " + slotDT);
      return;
    }
    jwt && account.address && username && backendBook(jwt, account.address, username, t, 30, message);
  };

  if (loadingA || loadingU) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const chkmrk = <CheckCircleIcon className="w-6 h-6 text-slate-400 mr-2 inline-block" />;
  const verified = (
    <div className="flex items-center text-slate-400 pt-8">
      {tokensDeposited >= 1 ? (
        <>
          {chkmrk}
          <span>Verified Member</span>
        </>
      ) : (
        <>
          <QuestionMarkCircleIcon className="w-6 h-6 text-black-500 mr-2" />
          <span>Not a member</span>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col justify-center items-center p-0 bg-gradient-to-b from-yellow-200 to-white">
        {verified}
        <p className="text-5xl font-bold m-0 font-lato">
          {user.username} {tokensDeposited >= 1 ? chkmrk : "(not pro)"}
        </p>

        {user.ethereumAddress ? (
          <p className="text-3xl font-ibm-plex-mono">
            {user.ethereumAddress}
            {chkmrk}
          </p>
        ) : null}
        {user.twitterUsername ? (
          <p className="text-3xl font-bold m-0 font-lato">
            <Image
              src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png"
              alt="Twitter Logo"
              width="27"
              height="27"
              className="h-6 mb-1 mr-2 inline-block"
            />
            @{user.twitterUsername} {chkmrk}
          </p>
        ) : null}
        {/* <h1 className="text-3xl md:text-4xl font-bold">About</h1> */}
        <p
          style={{ lineHeight: 1.5 }}
          className="text-2xl md:text-2xl whitespace-pre-line  font-playfair border  p-8 rounded-lg bg-white w-2/3"
        >
          {user.bio}
        </p>
      </div>

      <div className="w-full  grid grid-cols-2 md:grid-cols-2 ">
        <div className=" bg-slate-100 px-4 py-4 col-span-1 mx-4 md:col-span-1  grid grid-cols-2 ">
          <div className=" bg-slate-50 px-4 py-4 col-span-1 mx-4 md:col-span-1">
            <TzSelector currentTz={selectedTz} onTzChange={handleTzChange} />
            <p className="font-bold font-lato">Pick Date for Available Times</p>
            <TimeSlotCalendar availableDates={avail} handleDayClick={handleDayClick} />
          </div>
          <div className=" bg-slate-50 px-4 py-4  col-span-1 mx-4 md:col-span-1">
            <TimeSlotList ranges={avail[selectedDay]} slotMinutes={30} handleBookSlot={handleBookSlot} />
          </div>
        </div>
        <div className="bg-slate-100 px-4 py-4 col-span-1 mx-4 md:col-span-1">
          <div className="bg-white p-4 rounded-md border border-gray-300">
            <div className="bg-custom-teal border py-0 mb-4 rounded px-4" role="alert">
              {tokensDeposited >= 1 ? (
                <p className="">Anyone can book with a pro user.</p>
              ) : (
                <p className="">Only a pro user can book with a non-pro user.</p>
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2 font-lato">Make a Booking Request</h2>

            <div className="flex items-center">
              <p className="m-1 text-sm text-gray-600 w-28 font-ibm-plex-mono">To:</p>
              <p className="m-1 font-bold">{username}</p>
            </div>
            <div className="pb-0 flex items-center">
              <p className="m-1 text-sm text-gray-600 w-28 font-ibm-plex-mono">Date:</p>
              <p className="m-1 font-bold">{selectedDate.toDateString()}</p>
            </div>
            <div className="pb-0 flex items-center">
              <p className="m-1 text-sm text-gray-600 w-28 font-ibm-plex-mono">Time (24 H):</p>
              {selectedSlot === null ? (
                <p className="m-1 text-red-400">Choose a time on the left</p>
              ) : (
                <p className="m-1 font-bold">{fmtEpochDate24H(selectedSlot)} (30 minutes)</p>
              )}
            </div>

            <label className="m-1 text-sm text-gray-600 w-28 font-ibm-plex-mono">Personalized Message:</label>
            <textarea
              className="w-full m-1 p-2 border rounded-md resize-none"
              rows={5}
              value={message}
              onChange={handleTextareaChange}
            ></textarea>
            <button
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleClickRequestBooking}
            >
              Request Booking
            </button>
          </div>
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
      <MetaHeader title={`Schedl UI | ${username}'s Booking Page`} description="">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-1 flex-grow" data-theme="exampleUi">
        {username ? <UserProfile username={Array.isArray(username) ? username[0] : username} /> : null}
      </div>
    </>
  );
};

export default UserPage;
