import type { NextPage } from "next";
import { Me } from "~~/components/Me";
import { MetaHeader } from "~~/components/MetaHeader";

const SchedlUI: NextPage = () => {
  return (
    <>
      <MetaHeader title="Schedl UI | Scaffold-ETH 2" description="">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      {/* <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi"> */}
      <div className="grid lg:grid-cols-1 flex-grow" data-theme="exampleUi">
        <Me />
      </div>
    </>
  );
};

export default SchedlUI;
