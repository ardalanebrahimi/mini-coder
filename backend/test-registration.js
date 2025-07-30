const fetch = require("node-fetch");

async function testRegistration() {
  const API_URL = "http://localhost:3000/api/auth";

  console.log("Testing simplified registration...\n");

  // Test Case 1: Registration with username and password only
  console.log("Test Case 1: Username + Password only");
  try {
    const response1 = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser" + Math.floor(Math.random() * 1000),
        password: "password123",
      }),
    });

    const data1 = await response1.json();

    if (response1.ok) {
      console.log("✅ SUCCESS:", data1);
    } else {
      console.log("❌ FAILED:", data1);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test Case 2: Registration with username, password, and email
  console.log("Test Case 2: Username + Password + Email");
  try {
    const randomNum = Math.floor(Math.random() * 1000);
    const response2 = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser" + randomNum,
        password: "password123",
        email: "testuser" + randomNum + "@example.com",
      }),
    });

    const data2 = await response2.json();

    if (response2.ok) {
      console.log("✅ SUCCESS:", data2);
    } else {
      console.log("❌ FAILED:", data2);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

testRegistration();
