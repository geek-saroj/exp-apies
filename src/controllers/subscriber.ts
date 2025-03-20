import Redis from "ioredis";

// Create a Redis client for subscribing
const redis = new Redis(); // Defaults to localhost:6379

// Subscribe to the SEGMENT_TRACKING channel
redis.subscribe("SEGMENT_TRACKING", (err, count) => {
  if (err) {
    console.error("Error subscribing to channel:", err);
  } else {
    console.log(`Subscribed to ${count} channel(s)`);
  }
});

// Handle incoming messages on the SEGMENT_TRACKING channel
redis.on("message", (channel, message) => {
  if (channel === "SEGMENT_TRACKING") {
    const eventData = JSON.parse(message); // Parse the event data
    console.log("Received event:", eventData);

    // Process the event (e.g., send to Segment, log, store in DB)
    sendToSegment(eventData);
  }
});

// Function to simulate sending the event to Segment or any other service
const sendToSegment = (eventData: any) => {
  console.log("Sending event to Segment (simulated):", eventData);
};
