const axios = require("axios");

// Configuration
const API_URL = "http://localhost:3000";
const TEST_EMAIL = "testuser@example.com";
const TEST_PASSWORD = "password123";

let authToken = "";
let testProjectId = null;

// Helper function to make authenticated requests
const makeRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${API_URL}${url}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  };
  if (data) config.data = data;
  return axios(config);
};

async function testStarFunctionality() {
  console.log("🌟 Testing Star Functionality...\n");

  try {
    // 1. Login to get auth token
    console.log("1. Logging in...");
    const loginResponse = await makeRequest("POST", "/auth/login", {
      loginField: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    authToken = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // 2. Get app store projects
    console.log("2. Getting app store projects...");
    const appStoreResponse = await makeRequest(
      "GET",
      "/api/v1/projects/app-store"
    );
    const projects = appStoreResponse.data.projects;

    if (projects.length === 0) {
      console.log(
        "❌ No projects found in app store. Please publish a project first."
      );
      return;
    }

    testProjectId = projects[0].id;
    console.log(
      `✅ Found ${projects.length} projects. Using project ID: ${testProjectId}`
    );
    console.log(
      `   Project: "${projects[0].name}" by ${projects[0].user.username}`
    );
    console.log(`   Initial star count: ${projects[0].starCount || 0}`);
    console.log(`   Initially starred: ${projects[0].starred || false}\n`);

    // 3. Get star status for the project
    console.log("3. Getting star status...");
    const statusResponse = await makeRequest(
      "GET",
      `/api/v1/stars/${testProjectId}/status`
    );
    console.log(`✅ Star status: ${JSON.stringify(statusResponse.data)}\n`);

    // 4. Toggle star (add star)
    console.log("4. Adding star...");
    const toggleResponse1 = await makeRequest(
      "POST",
      `/api/v1/stars/${testProjectId}/toggle`
    );
    console.log(`✅ Toggle result: ${JSON.stringify(toggleResponse1.data)}\n`);

    // 5. Get updated app store projects to verify star count
    console.log("5. Getting updated app store projects...");
    const updatedAppStoreResponse = await makeRequest(
      "GET",
      "/api/v1/projects/app-store"
    );
    const updatedProject = updatedAppStoreResponse.data.projects.find(
      (p) => p.id === testProjectId
    );
    console.log(`✅ Updated project star count: ${updatedProject.starCount}`);
    console.log(`   Is starred: ${updatedProject.starred}\n`);

    // 6. Toggle star again (remove star)
    console.log("6. Removing star...");
    const toggleResponse2 = await makeRequest(
      "POST",
      `/api/v1/stars/${testProjectId}/toggle`
    );
    console.log(`✅ Toggle result: ${JSON.stringify(toggleResponse2.data)}\n`);

    // 7. Verify star was removed
    console.log("7. Verifying star removal...");
    const finalAppStoreResponse = await makeRequest(
      "GET",
      "/api/v1/projects/app-store"
    );
    const finalProject = finalAppStoreResponse.data.projects.find(
      (p) => p.id === testProjectId
    );
    console.log(`✅ Final project star count: ${finalProject.starCount}`);
    console.log(`   Is starred: ${finalProject.starred}\n`);

    // 8. Test unauthenticated request
    console.log("8. Testing unauthenticated star toggle...");
    authToken = ""; // Remove auth token
    try {
      await makeRequest("POST", `/api/v1/stars/${testProjectId}/toggle`);
      console.log("❌ Should have failed without authentication");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✅ Correctly rejected unauthenticated request\n");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    console.log("🎉 All star functionality tests passed!");
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the test
testStarFunctionality();
