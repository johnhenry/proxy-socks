import { Server } from "../index.mjs";

const server = new Server(() => new Response("no responder", { status: 500 })); // TODO: can 'null' be used here? nothing?

// Single Endpoint
Deno.serve({ port: 8082 }, (req) => {
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
