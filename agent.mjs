import {
  bytesToBase64,
  base64ToBytes,
  doConnection,
  randId,
} from "./util/index.mjs";

const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

const Agent = class {
  #connection = null;
  #id = null;
  #sessions = null;
  #send = null;
  #recieve = null;
  #reconnect = undefined;
  #boundServe = (handler) => {};
  #log = 0;
  #abort = () => {};
  #handler = () => new Response("empty responder", { status: 500 });
  constructor(
    address,
    { reconnect, log, abort, secret } = {
      reconnect: undefined,
      log: 0,
      abort: () => new Response("aborted", { status: 500 }),
      secret: undefined,
    }
  ) {
    this.#log = log;
    this.#reconnect = reconnect;
    this.#id = randId("agent-");
    this.#abort = abort;
    this.#sessions = new Map();
    if (this.#log > LOG_LEVELS.WARN) {
      console.log("AgentID", this.#id);
    }
    this.#connection = this.createConnection(address, secret);
    this.#boundServe = this.unboundServe.bind(this);
  }
  createConnection(address, secret) {
    return new Promise((success) => {
      const connection = new WebSocket(address);
      const handshaker = () => {
        const [send, recieve] = doConnection(connection);
        send({
          kind: "agent",
          secret,
          agent: this.#id,
        });
        this.#send = send;
        this.#recieve = recieve;
        setTimeout(async () => {
          let stream = null;
          let send, recieve;
          for await (const message of this.#recieve) {
            const { kind, id, payload, request: req } = message;
            if (kind === "request") {
              let response;
              [send, recieve] = doConnection(connection, {
                filter: (x) => x.request === req,
                transform: (x) => ({ ...x, request: req }),
              });
              let body = null;
              if (payload.body) {
                stream = new TransformStream();
                body = stream.readable;
                setTimeout(async () => {
                  const writer = stream.writable.getWriter();
                  for await (const message of recieve) {
                    const { kind, payload } = message;
                    if (kind === "request:body") {
                      writer?.write(
                        payload.bodyKind === "base64"
                          ? base64ToBytes(payload.body)
                          : payload.body
                      );
                    } else if (
                      kind === "request:body:end" ||
                      kind === "request:end"
                    ) {
                      writer?.close();
                    } else if (kind === "response:body?") {
                      // read response body
                      const res = await response;
                      const reader = res.body.getReader();
                      let value, done;
                      while (!done) {
                        // TODO: bail out if collection empty?
                        ({ value, done } = await reader.read());
                        send({
                          kind: "response:body",
                          payload: {
                            body: bytesToBase64(value),
                            bodyKind: "base64",
                          },
                        });
                      }
                      //reader.close();
                      send({ kind: "response:body:end" });
                    }
                  }
                });
              }

              const request = new Request(payload.url, {
                method: payload.method,
                headers: payload.headers,
                body: body,
                duplex: "half",
              });
              response = this.#handler(request, { id: req });
              this.#sessions.set(id, {
                send,
                recieve,
                request,
                response,
              });
              response.then(
                (response = new Response(null, { status: 500 })) => {
                  const session = this.#sessions.get(id);
                  this.#sessions.set(id, {
                    ...session,
                    response,
                  });
                  send({
                    kind: "response",
                    payload: {
                      headers: Object.fromEntries(response.headers),
                      statusText: response.statusText,
                      status: response.status,
                      body: !!response.body,
                    },
                  });
                  if (response.body) {
                    setTimeout(async () => {
                      const reader = response.body.getReader();
                      let { value, done } = await reader.read();
                      while (!done) {
                        // TODO: bail out if collection empty?
                        send({
                          kind: "response:body",
                          payload: {
                            body: bytesToBase64(value),
                            bodyKind: "base64",
                          },
                        });
                        ({ value, done } = await reader.read());
                        await new Promise((success) =>
                          setTimeout(success, 1000)
                        );
                      }
                      send({ kind: "response:body:end" });
                    });
                  }
                }
              );
            }
          }
        });
        success(connection);
      };
      const closer = () => {
        if (this.#log > LOG_LEVELS.WARN) {
          console.log(`reconnecting in ${this.#reconnect} ms`);
        }

        if (this.#reconnect !== undefined) {
          this.#connection = new Promise(async (success) => {
            await new Promise((success) =>
              setTimeout(success, this.#reconnect)
            );
            success(this.createConnection(address));
          });
        }
      };
      connection.addEventListener("open", handshaker);
      connection.addEventListener("close", closer);
    });
  }
  get connection() {
    return this.#connection;
  }
  unboundServe(handler) {
    this.#handler = handler;
  }
  get serve() {
    return this.#boundServe;
  }
};

const upgradeWebSocket = (req) => {
  const response = new Response(null, { websocket: true });
};
export { Agent, upgradeWebSocket, LOG_LEVELS };

export default Agent;
