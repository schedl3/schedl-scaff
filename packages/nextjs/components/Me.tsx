import React, { useEffect, useState } from "react";
import { useJwtContext } from "../contexts/JwtContext";
import { Schedule, ScheduleWeek } from "./ScheduleWeek";
import { TzSelector } from "./TzSelector";
import { CheckCircleIcon, FaceFrownIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ChedPriceMintDeposit } from "~~/components/MintChed";
import { TwitterConnect } from "~~/components/TwitterConnect";
import { Address } from "~~/components/scaffold-eth";
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

interface Booking {
  status: string;
  fromAddress: string;
  toUsername: string;
  start: string; // Date but get from mongo as string
  minutes: number;
  msg: string;
}

export const Me: React.FC = () => {
  const { jwt } = useJwtContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tokensDeposited, setTokensDeposited] = useState<number>(0);
  const [bookingsToMe, setBookingsToMe] = useState<Booking[]>([]);
  const [bookingsFromMe, setBookingsFromMe] = useState<Booking[]>([]);
  const tabs = ["verify", "profile", "schedule"];
  const [activeTab, setActiveTab] = useState<string>("verify");

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleToggle = () => {
    jwt && profile && backendSet(jwt, "idAddressIsPublic", !profile.idAddressIsPublic);
    // setIdAddressIsPublic(!idAddressIsPublic);
    profile && setProfile({ ...profile, idAddressIsPublic: !profile.idAddressIsPublic } as Profile);
  };

  const handleTzChange = (newTz: string) => {
    handleFieldSave("tz", newTz);
  };

  const handleFieldSave = (fieldName: string, newValue: string) => {
    // console.log(`Field ${fieldName} saved with value: ${newValue}`);
    jwt && backendSet(jwt, fieldName, newValue);
    setProfile({ ...profile, [fieldName]: newValue } as Profile);
  };

  useEffect(() => {
    if (jwt) {
      backendGetEnd(jwt, "/users/me", data => {
        setProfile(data);

        backendGetEnd(
          jwt,
          "/token-payment/deposited-tokens/?" +
            (data.username ? "username=" + data.username : "address=" + data.idAddress),
          data => {
            setTokensDeposited(data.depositedTokens);
          },
        );
      });

      backendGetEnd(jwt, "/bookings/me/to", data => {
        setBookingsToMe(data);
      });
      backendGetEnd(jwt, "/bookings/me/from", data => {
        setBookingsFromMe(data);
      });
    }
  }, [jwt]);

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
  // ['initial', 'notified', 'confirmed', 'rejected', 'busy'],
  const BookingStatusIcon = (status: string) => {
    if (status === "rejected" || status === "busy") {
      return <FaceFrownIcon className="w-6 h-6 text-red-500 mr-2" />;
    } else if (status === "confirmed") {
      return <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />;
    } else {
      return <QuestionMarkCircleIcon className="w-6 h-6 text-yellow-500 mr-2 inline-block" />;
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <div className="flex flex-col justify-center items-center p-0 bg-gradient-to-b from-yellow-200 to-white">
        {verified}
        <p className="text-5xl font-bold m-0 font-lato">
          {profile.username} {tokensDeposited >= 1 ? chkmrk : "(not pro)"}
        </p>

        {profile.ethereumAddress ? (
          <p className="text-3xl font-ibm-plex-mono">
            {profile.ethereumAddress}
            {chkmrk}
          </p>
        ) : null}
        {profile.twitterUsername ? (
          <p className="text-3xl font-bold m-0 font-lato">
            <img
              src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png"
              alt="Twitter Logo"
              className="h-6 mb-1 mr-2 inline-block"
            />
            @{profile.twitterUsername} {chkmrk}
          </p>
        ) : null}
        <p
          style={{ lineHeight: 1.5 }}
          className="text-2xl md:text-2xl whitespace-pre-line  font-playfair border  p-8 rounded-lg bg-white w-2/3"
        >
          {profile.bio}
        </p>
      </div>

      {/* <Tabs /> */}

      <div className="w-full flex justify-center pt-4 pb-4 bg-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${tab === "verify" ? "mr-2" : "ml-2"} rounded-md ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* <SocialVerification /> */}

      <div className="w-full p-8" style={{ display: activeTab == "verify" ? "block" : "none" }}>
        <h2 className="text-2xl font-bold mb-4">Verify Your Socials</h2>
        <p className="text-gray-600 mb-8">Connect your social media accounts for verification.</p>
        <table className="table w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Network Type</th>
              <th className="p-2 border">Value</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Schedl:username</td>
              <td className="p-2 border">{profile.username}</td>
              <td className="p-2 border">Immutable</td>
            </tr>
            <tr>
              <td className="p-2 border">Twitter</td>
              <td className="p-2 border">{profile.twitterUsername}</td>
              <td className="p-2 border">
                <TwitterConnect />
              </td>
            </tr>
            <tr>
              <td className="p-2 border">XMTP</td>
              <td className="p-2 border">{profile.assistantXmtpAddress}</td>
              <td className="p-2 border">Confirmed, Private</td>
            </tr>
            <tr>
              <td className="p-2 border">Ethereum</td>
              <td className="p-2 border">{profile.idAddress}</td>
              <td className="p-2 border">
                <p>
                  <input
                    type="checkbox"
                    checked={profile.idAddressIsPublic}
                    onChange={handleToggle}
                    className="checkbox"
                  />{" "}
                  {profile.idAddressIsPublic}
                  Set Public
                </p>
              </td>
            </tr>
            <tr>
              <td className="p-2 border">CHED Deposited</td>
              <td className="p-2 border">{tokensDeposited}</td>
              <td className="p-2 border">
                <ChedPriceMintDeposit />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* <Profile /> */}

      <div className="w-full p-8" style={{ display: activeTab == "profile" ? "block" : "none" }}>
        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
        <ProfileField label="Username" value={profile.username} propName="username" onSave={handleFieldSave} />
        <ProfileField
          label="XMTP Address"
          value={profile.assistantXmtpAddress}
          propName="assistantXmtpAddress"
          onSave={handleFieldSave}
        />
        <ProfileField label="Bio" value={profile.bio} propName="bio" onSave={handleFieldSave} isTextarea={true} />
      </div>

      {/* <Profile /> */}

      <div className="w-full p-8" style={{ display: activeTab == "schedule" ? "block" : "none" }}>
        <TzSelector currentTz={profile.tz} onTzChange={handleTzChange} />
        <div className="bg-slate-100 w-full place-content-start  grid grid-cols-1 md:grid-cols-3 ">
          <div className="bg-slate-50 px-4 py-4 col-span-1 mx-4 w-fit md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Weekly</h2>
            <ScheduleWeek schedule={profile.schedule as Schedule} />
          </div>
          <div className=" bg-slate-50 p-4 w-full col-span-2 md:col-span-2 ">
            <h2 className="text-2xl font-bold mb-4">Upcoming</h2>

            <h2 className="text-2xl font-bold mb-4">Bookings To Me</h2>
            <table className="table-fixedx xborder">
              <thead>
                <tr>
                  <th className="w-1/2">Start</th>
                  <th>From</th>
                  <th className="w-1/2">Message</th>
                </tr>
              </thead>
              <tbody>
                {bookingsToMe
                  .filter(booking => new Date(booking.start) > new Date())
                  .map((booking, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td>
                          {BookingStatusIcon(booking.status)}
                          {new Date(booking.start).toISOString().substr(0, 10)}{" "}
                          {new Date(booking.start).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          ({booking.minutes} minutes)
                        </td>
                        <td>
                          <Address address={booking.fromAddress} />
                        </td>
                        <td colSpan={1}>
                          <p className="whitespace-pre-line flex-grow bg-gray-200 text-gray-600 mr-2 p-3">
                            {booking.msg}
                          </p>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>

            <h2 className="text-2xl font-bold mb-4">Bookings From Me</h2>
            <table className="">
              <thead>
                <tr>
                  <th className="w-1/2">Start</th>
                  <th>To</th>
                  <th className="w-1/2">Message</th>
                </tr>
              </thead>
              <tbody>
                {bookingsFromMe
                  .filter(booking => new Date(booking.start) > new Date())
                  .map((booking, index) => (
                    <React.Fragment key={index}>
                      <tr key={index}>
                        <td>
                          {BookingStatusIcon(booking.status)}
                          {new Date(booking.start).toLocaleDateString()}{" "}
                          {new Date(booking.start).toLocaleString([], { hour: "2-digit", minute: "2-digit" })} (
                          {booking.minutes} minutes)
                        </td>
                        <td>{booking.toUsername}</td>
                        <td colSpan={4}>
                          <p className="whitespace-pre-line flex-grow bg-gray-200 text-gray-600 mr-2 p-3">
                            {booking.msg}
                          </p>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProfileFieldProps {
  label: string;
  value: string;
  propName: string;
  onSave: (propName: string, newValue: string) => void;
  isTextarea?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, propName, onSave, isTextarea = false }) => {
  const [editing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleEditClick = () => {
    setEditedValue(value);
    setEditing(true);
  };

  const handleSaveClick = () => {
    onSave(propName, editedValue);
    setEditing(false);
  };

  return (
    <div className="flex items-center mb-4">
      <div className="flex-grow">
        <p className="font-bold">{label}</p>
        {editing ? (
          <>
            {isTextarea ? (
              <textarea
                className="w-full p-2 border rounded-md resize-none"
                rows={5}
                value={editedValue}
                onChange={e => setEditedValue(e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={editedValue}
                onChange={e => setEditedValue(e.target.value)}
              />
            )}
            <div className="flex mt-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleSaveClick}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 ml-2"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <p className="whitespace-pre-line flex-grow bg-gray-200 text-gray-600 mr-2 p-3">{value}</p>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={handleEditClick}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
