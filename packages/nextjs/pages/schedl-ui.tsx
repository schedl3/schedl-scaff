import type { NextPage } from "next";
import { Challenge } from "~~/components/Challenge";
import { MetaHeader } from "~~/components/MetaHeader";

const SchedlUI: NextPage = () => {
  return (
    <>
      <MetaHeader title="Schedl UI | Scaffold-ETH 2" description="">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <Challenge />
      </div>
    </>
  );
};

export default SchedlUI;
