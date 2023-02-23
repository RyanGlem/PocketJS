import http2 from "http2";
import fs from "fs";

const server = http2.createSecureServer({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {
  const path = headers[":path"];
  stream.setEncoding("utf8");

  switch (path) {
    case "/":
      fs.readFile("src/index.html", (err, data) => {
        if (err) throw err;
        stream.end(data);
      });
      break;
    case "/bundle.js":
      fs.readFile("src/bundle.js", (err, data) => {
        if (err) throw err;
        stream.respond({
          status: 200,
          "content-type": "text/javascript;",
        });
        stream.end(data);
      });
      break;
    case "/styles/output.css":
      fs.readFile("src/styles/output.css", (err, data) => {
        if (err) throw err;
        stream.respond({
          status:200,
          "content-type":"text/css"
        })
        stream.end(data)
      })
      break;
    case "/styles/output.css.map":
      fs.readFile("src/styles/output.css.map", (err, data) => {
        if (err) throw err;
        stream.respond ({
          status:200,
          "content-type": "text/css;"
        })
        stream.end(data)
      })
      break;
    default:
      stream.write("Route not found");
      stream.end();
  }
});

server.on("session", (session) => {
  console.log("session started");
  session.on("connect", () => {
    console.log("User connected");
  });
  session.on("close", () => {
    console.log("session closed");
  });
  session.on("error", (err) => console.error("session error", err));
});

server.listen(3000);
