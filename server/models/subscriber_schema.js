const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  socketId: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Subscriber", SubscriberSchema);
