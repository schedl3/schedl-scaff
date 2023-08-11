import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { Schedule, ScheduleWeek } from "~~/components/ScheduleWeek";
import { backendGetEnd } from "~~/utils/schedlBackendApi";

interface PartialUser {
  username: string;
  schedule: Schedule;
  twitterUsername: string;
  bio: string;
  tz: string;
}

const UserProfile: React.FC<{ username: string | string[] | undefined }> = ({ username }) => {
  const [user, setUser] = useState<PartialUser | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        backendGetEnd(false, `/users/?username=${username}`, (data: any) => {
          // backendGetEnd(false, `/profile/${username}`, (data: any) => {
          const user: PartialUser = data;
          setUser(user);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
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
            <td>Schedule</td>
            <td>
              <ScheduleWeek schedule={user.schedule as Schedule} />
            </td>
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
    </div>
  );
};

const UserPage: NextPage = () => {
  const router = useRouter();
  const { username } = router.query;
  return (
    <>
      <MetaHeader title={`Schedl UI | ${username}'s Page`} description="">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        {username ? <UserProfile username={username} /> : null}
      </div>
    </>
  );
};

export default UserPage;
