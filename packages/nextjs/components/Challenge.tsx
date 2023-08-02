import React, { useState } from "react";
import axios from "axios";
import { useAccount, useSignMessage } from "wagmi";

const BACKEND_URL = "https://localhost:3000";

export const Challenge = () => {
  const [challenge, setChallenge] = useState("");
  const [message, setMessage] = useState("gm wagmi frens");
  const [signature, setSignature] = useState("");
  const [jwt, setJwt] = useState("");
  const [error, setError] = useState("");
  const account = useAccount();
  const { /* data, isError, isLoading, isSuccess, */ signMessage } = useSignMessage({
    message,
    async onSettled(data, error) {
      console.log("Settled", { data, error });
      if (error) {
        setError(error.message);

        return;
      } else if (data) {
        setSignature(data);
        const response = await axios.post(
          BACKEND_URL + "/auth/ethloginjwt",
          {
            message,
            signature: data,
            // signature,
          },
          { withCredentials: true },
        );
        console.log("Signature posted:", response.data);
        setJwt(response.data.access_token);
      }
    },
  });

  const handleChallengeClick = async () => {
    try {
      const response = await axios.get(BACKEND_URL + "/challenge", { withCredentials: true });
      const { nonce } = response.data; // TODO verify nonce
      const URI = "https://localhost:3000"; // XXX not web domain
      const domain = "localhost:3000"; // XXX not window.location.host
      setChallenge(nonce);
      const template = (domain: string, nonce: string, address: string, date: string) =>
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${address}\n` +
        "\n" +
        "Sign in with Ethereum to the app.\n" +
        "\n" +
        `URI: ${URI}\n` +
        "Version: 1\n" +
        "Chain ID: 1\n" +
        `Nonce: ${nonce}\n` +
        `Issued At: ${date}`;
      setMessage(template(domain, nonce, account.address!, new Date().toISOString()));
      setSignature("");
      setError("");
    } catch (error) {
      console.error("Error fetching nonce:", error);
      setError("Error fetching nonce. Please try again later.");
    }
  };

  return (
    <div>
      <p>Challenge: {challenge}</p>
      <button onClick={handleChallengeClick} className="btn btn-sm btn-primary">
        Challenge
      </button>
      <button onClick={() => signMessage()} disabled={!challenge} className="btn btn-sm btn-primary">
        Sign and Post
      </button>
      {error && <p>Error: {error}</p>}
      {signature && <p>Signature: {signature}</p>}
      {jwt && <p>JWT: {jwt}</p>}
    </div>
  );
};
