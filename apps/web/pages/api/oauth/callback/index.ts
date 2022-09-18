import { ACCESS_TOKEN_KEY } from "@rooms2watch/shared-lib";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.query;
  if (!access_token) return res.redirect("/");
  if (typeof access_token !== "string") return res.redirect("/");
  res.setHeader("set-cookie", `${ACCESS_TOKEN_KEY}=${access_token}; path=/;`);
  res.redirect("/");
}
