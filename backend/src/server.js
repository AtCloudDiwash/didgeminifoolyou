import 'dotenv/config';
import express from 'express';
import http from "http";
import cors from "cors";
import lobbiesRouter from './routes/lobbies.js';
import wss from "./ws/wss.js"

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const serverCode = url.searchParams.get("serverCode");
  const age = url.searchParams.get("age");

  if (!serverCode || !age) {
    socket.destroy();
    console.log("Invalid Request");
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request, serverCode, { age });
  });
});

// Use the lobby routes
app.use("/lobbies", lobbiesRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0',() => console.log(`Server running on port ${PORT}`));
