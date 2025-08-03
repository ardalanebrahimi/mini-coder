// Script to clear analytics localStorage to stop infinite loop
console.log("Clearing analytics localStorage...");

// Clear the analytics storage
localStorage.removeItem("minicoder_analytics");

// Clear any other potential analytics keys
Object.keys(localStorage).forEach((key) => {
  if (key.includes("analytics") || key.includes("session_")) {
    localStorage.removeItem(key);
    console.log("Removed:", key);
  }
});

console.log("✅ Analytics localStorage cleared!");
console.log("Please refresh the page to restart with clean analytics state.");
