import axios from "axios";

const BACKEND_URL = "https://localhost:3000";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const backendGetChallenge = async () => await axios.get(BACKEND_URL + "/challenge", { withCredentials: true });

export const backendSiwe = (message: string, signature: string, cb?: (data: any) => void) => {
  axios
    .post(
      BACKEND_URL + "/auth/ethloginjwt",
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

export const backendSet = (jwt: string, propName: string, val: string, cb?: (data: any) => void) => {
  axios
    .post(
      BACKEND_URL + "/set" + capitalize(propName),
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
      BACKEND_URL + end,
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
