let o;
let ts;
ts = new TransformStream();
ts.writable.getWriter().write("input");
const request = new Request("http://-", {
  method: "POST",
  body: ts.readable,
  duplex: "half",
});
o = await request.body.getReader().read();
console.log(o);
ts = new TransformStream();
ts.writable.getWriter().write("output");
const response = new Response(ts.readable);
o = await response.body.getReader().read();
console.log(o);
