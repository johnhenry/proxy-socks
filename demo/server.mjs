import { Server } from "../index.mjs";
import { PORTS } from "./settings.mjs";

const server = new Server(() => new Response("no responder", { status: 500 })); // TODO: can 'null' be used here? nothing?

// Websocket Endpoint
Deno.serve({ port: PORTS.HANDLING }, (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket: connection, response } = Deno.upgradeWebSocket(req);
  server.addConnection(connection);
  connection.addEventListener("close", () => {
    server.removeConnection(connection);
  });
  return response;
});

////////////////////////////

// HTTP Endpoint

Deno.serve({ port: PORTS.INCOMING }, server.fetch);
