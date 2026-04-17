import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { createClient } from "@supabase/supabase-js";

// database configuration
const supabaseUrl = 'https://yzkjrlscuhvefezrybch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a2pybHNjdWh2ZWZlenJ5YmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjY0MDQsImV4cCI6MjA4MTkwMjQwNH0.bWSNEiGuZenO4mP3aTJYPToq1tZgf4xK34uE9c4Clrk';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());

// create http manually for ws integration
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients: WebSocket[] = [];

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to WebSocket");
  clients.push(ws);

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter(client => client !== ws);
  });

  ws.on("message", (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received from client:", data);
    } catch (e) {
      console.error("Error parsing WS message");
    }
  });
});
app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // queries the custom table from your database diagram
    const { data: user, error } = await supabase
      .from('users') 
      .select('*')
      .eq('user_email', email)
      .eq('set_password', password)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // return specific user details back to the frontend
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.user_id,
        email: user.user_email,
        name: user.user_name,
        privilege: user.admin_privilege
      }
    });
  } catch (err) {
    console.error("Login internal error:", err);
    res.status(500).json({ error: "Server authentication failed" });
  }
});

//disas trig broadcasts to all connected wb clients

app.get("/earthquake-trigger", (req, res) => {
  console.log("Earthquake triggered - notifying clients");

  clients.forEach((client, num) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "EARTHQUAKE",
        text: "ALERT: Earthquake detected. Follow evacuation protocols."
      }));
    }
  });

  res.json({ text: "Earthquake notification sent to everyone" });
});

// helper routes
app.get("/", (req, res) => res.send("Cyntra Backend is running"));
app.get("/test-connection", (req, res) => res.json({ text: "Valid connection" }));

server.listen(3000, () => console.log("Server running on http://localhost:3000"));