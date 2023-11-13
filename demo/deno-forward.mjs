// https://blog.r0b.io/post/creating-a-proxy-with-deno/
const port = 8081;
const address = `http://localhost:8080`;
const replaceURLOrigin = ({ pathname, search }, origin) => {
  const url = new URL("." + pathname, origin);
  url.search = search;
  return url;
};

Deno.serve({ port }, async (request) => {
  const originalURL = new URL(request.url);
  console.log(originalURL.hostname);
  const url = replaceURLOrigin(originalURL, address);
  const headers = new Headers(request.headers);
  headers.set("Host", originalURL.hostname);
  return fetch(url, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual",
  });
});
