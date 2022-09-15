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
import { createAuthProviderJwt, initializeGoogleOAuth20Provider } from '@rooms2watch/auth-providers'

const allowList = [process.env.WEB_BASE_URL];

async function main() {
  const app = express();

  const { signer, verifier } = createAuthProviderJwt(jwt, {
    secret: process.env.SERVER_JWT_SECRET!,
    jwtOptions: { expiresIn: '1d' }
  })

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
      createContext: createContext(verifier),
    })
  );
  app.use(expressSession({
    secret: process.env.SERVER_SESSION_SECRET!,
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
      signer
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
