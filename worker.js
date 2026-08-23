import app from "./server.js";
import { Readable } from "stream";

export default {
  async fetch(request, env, ctx) {
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
    }

    const url = new URL(request.url);

    return new Promise((resolve) => {
      let reqStream;
      if (request.body && !["GET", "HEAD"].includes(request.method)) {
        reqStream = Readable.fromWeb(request.body);
      } else {
        reqStream = new Readable({
          read() {
            this.push(null);
          },
        });
      }

      const req = Object.assign(reqStream, {
        url: url.pathname + url.search,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        rawHeaders: Array.from(request.headers.entries()).flat(),
        httpVersion: "1.1",
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        connection: { remoteAddress: request.headers.get("cf-connecting-ip") || "127.0.0.1" },
        socket: { remoteAddress: request.headers.get("cf-connecting-ip") || "127.0.0.1" },
      });

      const resHeaders = new Headers();
      let statusCode = 200;
      let statusMessage = "OK";
      const chunks = [];

      const res = {
        statusCode: 200,
        statusMessage: "OK",
        headersSent: false,
        setHeader(name, value) {
          if (Array.isArray(value)) {
            resHeaders.delete(name);
            value.forEach((v) => resHeaders.append(name, v));
          } else {
            resHeaders.set(name, value);
          }
          return this;
        },
        getHeader(name) {
          return resHeaders.get(name);
        },
        removeHeader(name) {
          resHeaders.delete(name);
          return this;
        },
        hasHeader(name) {
          return resHeaders.has(name);
        },
        writeHead(code, message, headers) {
          if (typeof message === "object") {
            headers = message;
            message = "OK";
          }
          statusCode = code;
          if (message) statusMessage = message;
          if (headers) {
            for (const [k, v] of Object.entries(headers)) {
              this.setHeader(k, v);
            }
          }
          this.headersSent = true;
          return this;
        },
        write(chunk) {
          if (chunk) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }
          return true;
        },
        end(chunk) {
          if (chunk) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }
          this.headersSent = true;
          const body = Buffer.concat(chunks);
          const response = new Response(
            ["GET", "HEAD"].includes(request.method) && (statusCode === 204 || statusCode === 304) ? null : body,
            {
              status: statusCode,
              statusText: statusMessage,
              headers: resHeaders,
            }
          );
          resolve(response);
        },
        on() {
          return this;
        },
        once() {
          return this;
        },
        emit() {
          return true;
        },
      };

      try {
        app(req, res);
      } catch (err) {
        console.error("Worker express error:", err);
        resolve(
          new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
    });
  },
};
