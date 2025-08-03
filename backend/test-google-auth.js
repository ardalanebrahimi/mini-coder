const fetch = require("node-fetch");

async function testGoogleAuth() {
  const API_URL = "http://localhost:3000/api/auth";

  console.log("Testing Google OAuth authentication...\n");

  // Test Case 1: Get Google Auth URL
  console.log("Test Case 1: Get Google Auth URL");
  try {
    const response1 = await fetch(`${API_URL}/google`, {
      method: "GET",
      redirect: "manual",
    });

    if (response1.status === 302) {
      const location = response1.headers.get("location");
      console.log("✅ SUCCESS: Redirect to Google OAuth");
      console.log("🔗 Redirect URL:", location);
      console.log("🔍 Contains client_id:", location.includes("client_id"));
      console.log(
        "🔍 Contains redirect_uri:",
        location.includes("redirect_uri")
      );
      console.log("🔍 Contains scope:", location.includes("scope"));
    } else {
      console.log("❌ FAILED: Expected 302 redirect, got", response1.status);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test Case 2: Test callback endpoint with mock data
  console.log("Test Case 2: Test Google Callback (Mock)");
  console.log("ℹ️  Note: This would normally require a valid Google JWT token");
  try {
    const response2 = await fetch(`${API_URL}/google/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "invalid_mock_token_for_testing",
      }),
    });

    const data2 = await response2.json();

    if (
      response2.status === 400 &&
      data2.error === "Google authentication failed"
    ) {
      console.log("✅ SUCCESS: Properly rejects invalid token");
      console.log("📝 Response:", data2);
    } else {
      console.log("❌ UNEXPECTED:", data2);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test Case 3: Check if user registration works with Google data
  console.log("Test Case 3: Test manual user creation with Google fields");
  try {
    const randomNum = Math.floor(Math.random() * 1000);
    const response3 = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "googleuser" + randomNum,
        email: "googleuser" + randomNum + "@gmail.com",
        name: "Google Test User",
        password: "", // No password for OAuth users
      }),
    });

    const data3 = await response3.json();

    if (response3.ok) {
      console.log("✅ SUCCESS: User registration with Google-style data");
      console.log("👤 User:", data3.user);
      console.log("🔑 Token received:", !!data3.token);
    } else {
      console.log("❌ FAILED:", data3);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n🏁 Google Auth tests completed!");
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000/api/health", {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  console.log("🔍 Checking if server is running...");
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running at http://localhost:3000");
    console.log("💡 Please start the server with: npm run dev");
    process.exit(1);
  }

  console.log("✅ Server is running!\n");
  await testGoogleAuth();
}

main().catch(console.error);
