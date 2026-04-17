import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { createServerClient } from '@supabase/ssr'
import { text } from "stream/consumers";

const app = express();
app.use(cors());
app.use(express.json());

// create HTTP server manually
const server = http.createServer(app);

// attach websocket server
const wss = new WebSocketServer({ server });

// store connected clients
let clients: WebSocket[] = [];

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  clients.push(ws);

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter(client => client !== ws);
  });

  ws.on("message", (message: Buffer) => {
    const data = JSON.parse(message.toString());
    console.log("Received from client:", data);
  });

});

const sendTest = () => {
  clients.forEach((client, num)=>{
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(
        {
          type : "TEST_TYPE",
          message : `Hello client no. ${num}`
        } 
      ));
    }
  })
}

app.get("/start-send-test", (req, res) => {
  sendTest();
  res.send("send test started");
  console.log("send test started")
})


app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/test-connection", (req, res) => {
  res.json({ text : "Http request and connection valid"});
});

app.get("/earthquake-trigger", (req, res)=>{
  console.log("earthquake triggered")

  clients.forEach((client, num)=>{
    client.send(JSON.stringify(
      {
        type : "EARTHQUAKE",
        text : "server sent message : EARTHQUAKE"
      }
    ))
    console.log("earthquake sent to client number ", num)
  })

  res.json({text : "earthquake notification sent to everyone"})
})

server.listen(3000, () => console.log("Server running..."));

