import express from "express";
import cors from "cors";
import ws from "ws";
import passport from 'passport'
import expressSession from 'express-session'
import jwt from 'jsonwebtoken'
import { randomUUID } from "crypto";

import * as trpcExpress from "@trpc/server/adapters/express";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

import { router, createContext } from "@rooms2watch/trpc";
import { initializeGoogleOAuth20Provider, JwtPayload } from '@rooms2watch/auth-providers'
import { ACCESS_TOKEN_KEY } from "@rooms2watch/common-types";

const allowList = [process.env.WEB_BASE_URL];

function jwtSignerWithRedirect(redirectUrl: string) {
  return function (req: express.Request, res: express.Response) {
    const user = req.user as { provider: 'Google', providerId: string }
    const token = jwt.sign(user, 'SECRET', { expiresIn: '24h' })
    res.cookie(ACCESS_TOKEN_KEY, `Bearer ${token}`)
    return res.redirect(redirectUrl)
  }
}

async function jwtVerifier(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, 'SECRET', function (err, decoded) {
      if (err) {
        return reject(err)
      }

      resolve(decoded as JwtPayload)
    })
  })
}

async function main() {
  const app = express();

  app.use(
    cors(function (req, res) {
      const corsOptions = { origin: false };
      const origin = req.header("Origin");
      if (origin && allowList.indexOf(origin) !== -1) {
        corsOptions.origin = true;
      }

      res(null, corsOptions);
    })
  );

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router,
      createContext: createContext(jwtVerifier),
    })
  );

  app.use(expressSession({
    secret: 'SECRET',
    genid() {
      return randomUUID()
    },
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser(function (user, done) {
    done(null, user as any);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user as any);
  });

  if (
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.SERVER_URL &&
    process.env.WEB_BASE_URL
  ) {
    initializeGoogleOAuth20Provider(
      app,
      passport,
      {
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        serverUrl: process.env.SERVER_URL,
        webCallbackUrl: process.env.WEB_BASE_URL,
        passReqToCallback: true,
        state: false,
        skipUserProfile: false,
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      },
      jwtSignerWithRedirect
    )
  }

  const port = process.env.SERVER_PORT || process.env.PORT || 8000;
  const server = app.listen(port, () => {
    console.log(`listening on port ${port}.`);
  });

  const wss = new ws.Server({
    server,
  });
  const handler = applyWSSHandler({
    wss,
    router,
    createContext: createContext as any,
  });

  wss.on("connection", (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
      console.log(`➖➖ Connection (${wss.clients.size})`);
    });
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wss.close();
  });
}

main();
