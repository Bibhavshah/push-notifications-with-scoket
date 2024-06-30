import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// const socket = io.connect("http://localhost:5000");

function App() {
  const [deviceId, setDeviceId] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deviceIdEntered, setDeviceIdEntered] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    const socket = io.connect("http://localhost:5000");
    setSocketId(socket);

    socket.on("alert", (message) => {
      console.log("Alert received:", message);
      alert(`Alert received: ${message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubscribe = async () => {
    try {
      const body = { deviceId, socketId: socketId.id };
      console.log(body);
      const response = await fetch("http://localhost:5000/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setIsSubscribed(true);
      console.log("From Frontend: ", data);
    } catch (error) {
      console.log("Subscription failed");
    }
  };

  const handleAlert = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "This is an alert message!" }),
      });
      const data = await response.json();
    } catch (error) {
      console.log("Failed to send alert");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDeviceIdEntered(true);
    try {
      const response = await fetch("http://localhost:5000/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId, socketId: socketId.id }),
      });
      const data = await response.json();
      if (data.isSubscribed) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.log("Failed to send alert");
    }
  };

  return (
    <div>
      {!deviceIdEntered ? (
        <form
          style={{
            width: "100vw",
            display: "flex",
            gap: "10px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1>Enter your device Id</h1>
          <input
            type="text"
            placeholder="Enter device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
          <button
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </form>
      ) : (
        <div
          style={{
            width: "100vw",
            display: "flex",
            gap: "10px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1>Device ID: {deviceId}</h1>
          {!isSubscribed && (
            <button onClick={() => handleSubscribe()}>Subscribe</button>
          )}
          <button onClick={() => handleAlert()}>Alert</button>
        </div>
      )}
    </div>
  );
}

export default App;
