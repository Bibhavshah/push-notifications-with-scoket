const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Subscriber = require("./models/subscriber_schema");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.post("/api/subscribe", async (req, res) => {
  const { deviceId, socketId } = req.body;
  if (!deviceId || !socketId)
    return res.status(400).json({ message: "Invalid request" });
  try {
    let subscriber = await Subscriber.findOne({ deviceId });
    if (subscriber) {
      subscriber.socketId = socketId;
      await subscriber.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json({ message: "Already subscribed, socket ID updated" });
    } else {
      const newSubscriber = await Subscriber.create({
        deviceId,
        socketId,
      });
      res.status(201).json({ newSubscriber, message: "Subscribed" });
    }
  } catch (error) {
    res.status(400).json({ message: "Subscription failed" });
  }
});

app.post("/api/alert", async (req, res) => {
  const { message } = req.body;
  if (!message) message = "This is an alert message!";
  try {
    const subscribers = await Subscriber.find({});
    subscribers.forEach((subscriber) => {
      io.to(subscriber.socketId).emit("alert", message);
    });
    res.status(200).json({ message: "Alert sent to all subscribers" });
  } catch (error) {
    console.error("Error sending alert:", error);
    res.status(500).json({ message: "Failed to send alert" });
  }
});

app.post("/api/status", async (req, res) => {
  const { deviceId, socketId } = req.body;
  try {
    const subscriber = await Subscriber.findOne({ deviceId: deviceId });
    console.log(subscriber);
    if (!subscriber) {
      res.status(200).json({ isSubscribed: false, message: "Not subscribed" });
    }
    subscriber.socketId = socketId;
    await subscriber.save({ validateBeforeSave: false });
    return res.status(200).json({
      isSubscribed: true,
      message: "Already subscribed, socket ID updated",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get status" });
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
});

server.listen(PORT, () => {
  try {
    mongoose.connect(
      "mongodb+srv://user:user@cluster0.3lqhidr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed");
  }
  console.log(`Server is running on port ${PORT}`);
});
