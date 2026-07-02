// Load environment variables
require("dotenv").config();

const { Log } = require("./index");

async function runTestSuite() {
    console.log("==================================================");
    console.log("     AFFORDMED LOGGER MIDDLEWARE TEST SUITE       ");
    console.log("==================================================\n");

    // --- TEST 1: Invalid Stack ---
    console.log("Test Case 1: Verification of Invalid Stack Reject");
    console.log("Description: Verifies that passing an unsupported stack (e.g., 'cloud') is rejected before API request.");
    const res1 = await Log("cloud", "info", "handler", "Successful validation test");
    console.log("Result:", JSON.stringify(res1, null, 2));
    console.log("--------------------------------------------------\n");

    // --- TEST 2: Invalid Level ---
    console.log("Test Case 2: Verification of Invalid Level Reject");
    console.log("Description: Verifies that passing an unsupported level (e.g., 'critical') is rejected before API request.");
    const res2 = await Log("backend", "critical", "handler", "Successful validation test");
    console.log("Result:", JSON.stringify(res2, null, 2));
    console.log("--------------------------------------------------\n");

    // --- TEST 3: Invalid Package ---
    console.log("Test Case 3: Verification of Invalid Stack-Package Combinations");
    console.log("Description: Verifies stack-specific validation by attempting to log a frontend package ('component') on a 'backend' stack.");
    const res3 = await Log("backend", "info", "component", "Successful validation test");
    console.log("Result:", JSON.stringify(res3, null, 2));
    console.log("--------------------------------------------------\n");

    // --- TEST 4: Empty Message ---
    console.log("Test Case 4: Verification of Empty Message Reject");
    console.log("Description: Verifies that empty or whitespace-only messages are rejected.");
    const res4 = await Log("backend", "info", "handler", "   ");
    console.log("Result:", JSON.stringify(res4, null, 2));
    console.log("--------------------------------------------------\n");

    // --- TEST 5: Missing Access Token ---
    console.log("Test Case 5: Verification of Missing Access Token Reject");
    console.log("Description: Verifies configuration check by temporarily deleting process.env.ACCESS_TOKEN.");
    const originalToken = process.env.ACCESS_TOKEN;
    delete process.env.ACCESS_TOKEN;
    const res5 = await Log("backend", "info", "handler", "Test message with missing token");
    console.log("Result:", JSON.stringify(res5, null, 2));
    process.env.ACCESS_TOKEN = originalToken; // Restore token for subsequent tests
    console.log("--------------------------------------------------\n");

    // --- TEST 6: Network Timeout ---
    console.log("Test Case 6: Verification of Network Timeout Handling");
    console.log("Description: Verifies grace and classification of timeout errors by setting request timeout to 1ms.");
    const res6 = await Log("backend", "info", "handler", "Test message for timeout", { timeout: 1 });
    console.log("Result:", JSON.stringify(res6, null, 2));
    console.log("--------------------------------------------------\n");

    // --- TEST 7: API/Authentication Failure ---
    console.log("Test Case 7: Verification of API Authentication Failure");
    console.log("Description: Verifies error categorization by using a deliberately invalid token.");
    process.env.ACCESS_TOKEN = "invalid_bearer_token";
    const res7 = await Log("backend", "info", "handler", "Test message with invalid token");
    console.log("Result:", JSON.stringify(res7, null, 2));
    process.env.ACCESS_TOKEN = originalToken; // Restore token
    console.log("--------------------------------------------------\n");

    // --- TEST 8: Successful Log Creation (API request validation) ---
    console.log("Test Case 8: Verification of Successful Log Structure");
    console.log("Description: Verifies that correct parameters build a valid payload and authorization header.");
    console.log("Note: If the configured token is valid, it returns success. If expired/invalid, it categorizes the API response.");
    const res8 = await Log("backend", "info", "handler", "Logger validation test successful");
    console.log("Result:", JSON.stringify(res8, null, 2));
    console.log("--------------------------------------------------\n");

    console.log("==================================================");
    console.log("              TEST SUITE COMPLETE                 ");
    console.log("==================================================");
}

runTestSuite();
