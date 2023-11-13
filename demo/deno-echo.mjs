const port = 8080;
Deno.serve({ port }, async (req) => {
  const { method, url, headers } = req;
  const input = JSON.stringify(
    {
      method,
      url,
      headers: Object.fromEntries(headers),
      ...(req.body ? { body: await req.json() } : {}),
    },
    null,
    " "
  );
  return new Response(input, {
    headers: {
      "content-type": "application/json",
      "content-length": input.length,
    },
  });
});
