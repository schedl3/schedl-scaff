import axios from "axios";

// const BACKEND_URL = "https://localhost:3000";
export const BACKEND_URL = () => {
  // if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  if (window.location.hostname === "localhost") return "https://localhost:3000";
  return window.location.origin;
};

export const backendGetChallenge = async () => await axios.get(BACKEND_URL() + "/challenge", { withCredentials: true });

export const backendSiwe = (message: string, signature: string, cb?: (data: any) => void) => {
  axios
    .post(
      BACKEND_URL() + "/auth/ethloginjwt",
      {
        message,
        signature,
      },
      { withCredentials: true },
    )
    .then(response => {
      cb?.(response.data);
    })
    .catch(error => {
      console.error("Error /auth/ethloginjwt", error);
    });
};

export const backendBook = (
  jwt: string,
  fromAddress: string,
  toUsername: string,
  start: string,
  minutes: number,
  msg: string,
  cb?: (data: any) => void,
) => {
  const bookingData = {
    fromAddress,
    toUsername,
    start,
    minutes,
    msg,
  };

  axios
    .post(BACKEND_URL() + "/bookings/me", bookingData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    })
    .then(response => {
      console.log("Booking successfull!", response.data);
      cb?.(response.data);
    })
    .catch(error => {
      console.error("Error booking", error);
    });
};

export const backendSet = (jwt: string, propName: string, val: string | object | boolean, cb?: (data: any) => void) => {
  axios
    .patch(
      BACKEND_URL() + "/users/me/" + propName, // "/set" + capitalize(propName),
      { [propName]: val },
      {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    )
    .then(response => {
      console.log(propName + " updated successfully!", response.data);
      cb?.(response.data);
    })
    .catch(error => {
      console.error("Error updating " + propName, error);
    });
};

export const backendGetEnd = (jwt: string | false, end: string, cb?: (data: any) => void) => {
  axios
    .get(
      BACKEND_URL() + end,
      jwt
        ? {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        : {},
    )
    .then(response => {
      console.log(end + " response.data:", response.data);
      cb?.(response.data);
    })
    .catch(error => {
      console.error("Error fetching " + end, error);
    });
};
