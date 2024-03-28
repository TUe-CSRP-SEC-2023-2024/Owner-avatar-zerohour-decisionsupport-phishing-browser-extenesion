import { getHost } from "./storage";

async function fetchApi(method, endpoint, jsonObj={}) {
  const host = await getHost();

  return await fetch(host + "/api/v2" + endpoint, {
    method: method,
    body: JSON.stringify(jsonObj),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export {
  fetchApi
};