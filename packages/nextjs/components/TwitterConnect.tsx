import React from "react";

export const TwitterConnect: React.FC = () => {
  const handleSignInWithTwitter = () => {
    const width = 600;
    const height = 400;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const options = `width=${width},height=${height},top=${top},left=${left}`;
    window.open("https://localhost:3000/auth/twitter", "_blank", options);
  };

  return (
    <div>
      <button onClick={handleSignInWithTwitter} className="btn btn-sm btn-primary">
        Sign in with Twitter
      </button>
    </div>
  );
};
