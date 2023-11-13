import { Agent } from "../index.mjs";
import { invertedPromise, routeEmptyFavicon } from "../util/index.mjs";
const address = `http://localhost:8082`;
let response, setResponse;

const { serve } = new Agent(address, { reconnect: 1000, log: 2 });
serve(async (request, { id }) => {
  try {
    const faviconResponse = routeEmptyFavicon(request);
    if (faviconResponse) {
      return faviconResponse;
    }
    let name = "Stranger";
    try {
      ({ name } = await request.json());
    } catch {}

    [response, setResponse] = invertedPromise();
    setTimeout(() => {
      setResponse(
        new Response(`Hello there ${name}.`, {
          status: 200,
          statusText: "OK",
          headers: {
            "content-type": "text/vanilla",
            "e-tag": id,
          },
        })
      );
    });
    return response;
  } catch (e) {
    console.error(e);
  }
});
// serve({ connection }, async (request) => {
//   try {
//     const { url, method, headers } = request;
//     const text = await request.text();
//     [response, setResponse] = invertedPromise();
//     return response;
//   } catch (e) {
//     console.log(e);
//   }
// });

/*

setResponse(new Response("howdy!", {
  status: 210,
  statusText: "It's all good",
  headers: {
    "content-type": "text/vanilla",
  }
}));

*/
