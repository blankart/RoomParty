import { router, createContext } from "@rooms2watch/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import ws from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

const allowList = [process.env.WEB_BASE_URL];

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
      createContext,
    })
  );

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
