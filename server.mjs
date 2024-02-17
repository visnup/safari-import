import { createServer } from "http";

const headers = {
  "content-type": "text/javascript",
  "access-control-allow-origin": "*",
};

const scripts = createServer(async (req, res) => {
  switch (req.url) {
    case "/a.js":
      res.writeHead(200, headers);
      res.end(`export const a = 1;\n`);
      break;
    case "/b.js":
      // res.writeHead(200, headers); // works
      res.writeHead(200, { ...headers, link: `</a.js>; rel="modulepreload"` }); // causes bug
      //res.writeHead(200, { ...headers, link: `</a.js>; rel="preload"; as="script"` }); // also causes bug
      res.end(`import { a } from "/a.js";\nexport const b = a + 1;\n`);
      break;
    default:
      res.writeHead(404);
      res.end("404 Not Found");
  }
});

const html = createServer(async (req, res) => {
  switch (req.url) {
    case "/":
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        // `<script type="module" src="http://localhost:8080/b.js"></script>` // also causes bug
        `<script type="module">import { b } from "http://localhost:8080/b.js"; console.log(b);</script>`
      );
      break;
    default:
      res.writeHead(404);
      res.end("404 Not Found");
  }
});

scripts.listen(8080);
html.listen(8000, () => {
  console.log(`Visit http://localhost:8000 in Safari.`);
});
