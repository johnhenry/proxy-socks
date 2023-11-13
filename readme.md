# Proxy Socks 🧦 🧦

Library for creating a reverse proxy over websockets.

Request/Response <-HTTP-> [Server] <-WS-> [Agent]

## Quick Start

1. Create Server (Deno)

```javascript
import { Server } from "npm:websocket-reverse-proxy";
const server = new Server(() => new Response("no responder", { status: 500 })); //
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
```

2. Create Agent

```javascript
import { Agent } from "websocket-reverse-proxy";
const address = `ws://localhost:8082`;
const { serve } = new Agent(address, { reconnect: 1000, log: 2 });
serve(async (request, { id }) => {
  return new Response(`Hello there!`, {
    status: 200,
    statusText: "OK",
    headers: {
      "content-type": "application/text",
      "e-tag": id,
    },
  });
});
```
