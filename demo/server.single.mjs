import { Server } from "../index.mjs";
import { HANDLING_PORT as port } from "./settings.mjs";

const server = new Server(() => new Response("no responder", { status: 500 })); // TODO: can 'null' be used here? nothing?

// Single Endpoint
Deno.serve({ port }, (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return server.fetch(req);
  }
  const { socket: connection, response } = Deno.upgradeWebSocket(req);
  server.addConnection(connection);
  connection.addEventListener("close", () => {
    server.removeConnection(connection);
  });
  return response;
});
