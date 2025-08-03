// Test script to verify analytics endpoint with proper payload
// Using Node.js built-in fetch (available in Node 18+)

async function testAnalytics() {
  const url = "http://localhost:3000/api/analytics/events";
  const payload = {
    events: [
      {
        eventType: "test_event",
        sessionId: "test-session-" + Date.now(),
        language: "en",
        timestamp: new Date().toISOString(),
        details: {
          source: "payload_size_test",
          testData: "This is a test to verify the payload size fix",
        },
      },
    ],
  };

  try {
    console.log("Testing analytics endpoint...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.text();
    console.log("Response status:", response.status);
    console.log("Response:", result);

    if (response.ok) {
      console.log("✅ Analytics test successful!");
    } else {
      console.log("❌ Analytics test failed");
    }
  } catch (error) {
    console.error("Error testing analytics:", error);
  }
}

testAnalytics();
