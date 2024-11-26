import { typeByExtension } from "https://deno.land/std@0.224.0/media_types/mod.ts";
import { extname } from "https://deno.land/std@0.224.0/path/mod.ts";

const VITE_SERVER = "http://localhost:5173"; // Your Vite server address

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const viteUrl = new URL(url.pathname + url.search, VITE_SERVER);

    console.log(`Received request: ${req.method} ${url.pathname}`);

    if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
        console.log("WebSocket upgrade request received");
        try {
            const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

            const viteWsUrl = viteUrl.toString().replace("http", "ws");
            console.log(`Connecting to Vite WebSocket: ${viteWsUrl}`);
            const viteSocket = new WebSocket(viteWsUrl);

            viteSocket.onopen = () => console.log("Connected to Vite WebSocket");
            viteSocket.onmessage = (e) => {
                console.log("Vite WS message:", e.data);
                clientSocket.send(e.data);
            };
            viteSocket.onclose = () => {
                console.log("Vite WebSocket closed");
                clientSocket.close();
            };
            viteSocket.onerror = (e) => console.error("Vite WebSocket error:", e);

            clientSocket.onmessage = (e) => {
                console.log("Client WS message:", e.data);
                viteSocket.send(e.data);
            };
            clientSocket.onclose = () => {
                console.log("Client WebSocket closed");
                viteSocket.close();
            };
            clientSocket.onerror = (e) => console.error("Client WebSocket error:", e);

            return response;
        } catch (error) {
            console.error("WebSocket upgrade failed:", error);
            return new Response("WebSocket upgrade failed", { status: 500 });
        }
    }

    const viteReq = new Request(viteUrl.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
    });

    try {
        const viteResponse = await fetch(viteReq);
        const responseBody = viteResponse.body;

        const newHeaders = new Headers(viteResponse.headers);
        newHeaders.delete("content-length");

        return new Response(responseBody, {
            status: viteResponse.status,
            headers: newHeaders,
        });
    } catch (ex) {
        console.error("Error forwarding request to Vite server:", ex);
        return new Response("Internal Server Error", { status: 500 });
    }
}


const cert = await Deno.readTextFile("./cert.pem");
const key = await Deno.readTextFile("./key.pem");
const port = 443;
const options = {
    hostname: "0.0.0.0",
    port: port,
    cert: cert,
    key: key,
};

console.log(`HTTPS server running. Access it at: https://localhost:${port}/`);
Deno.serve(options, handler);

// HTTP redirect
const redirectToHttps = (req: Request): Response => {
    const url = new URL(req.url);
    const httpsUrl = `https://${url.hostname}:${port}${url.pathname}${url.search}`;
    return new Response(null, {
        status: 301,
        headers: { "Location": httpsUrl },
    });
};

const httpPort = 80;
console.log(`HTTP server running. Redirecting all requests to HTTPS.`);
Deno.serve({ hostname: "0.0.0.0", port: httpPort }, redirectToHttps);