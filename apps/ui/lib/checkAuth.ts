import { GetServerSidePropsContext } from "next";
import * as config from "../config";

export async function checkAuth(context: GetServerSidePropsContext) {
  const res = await fetch(config.apiEndpoint + "/api/user/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stringSession: context.req.cookies[config.cookies.stringSession.name],
    }),
  });

  const json = await res.json();

  if (json.err || json.data.isBanned) {
    return false;
  }

  if (config.isBeta && !json.data.beta.isTester) {
    return false;
  }

  return true;
}
