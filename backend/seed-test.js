// Test script to seed departments and users
const API_BASE = "http://localhost:5000/api";

async function seedDepartments() {
  console.log("Seeding departments...");
  const response = await fetch(`${API_BASE}/departments/seed`, {
    method: "POST",
  });
  const data = await response.json();
  console.log("Departments seeded:", data);
  return data;
}

async function seedUsers() {
  console.log("\nSeeding users...");
  const response = await fetch(`${API_BASE}/auth/seed-users`, {
    method: "POST",
  });
  const data = await response.json();
  console.log("Users seeded:", data);
  return data;
}

async function testLogin() {
  console.log("\nTesting COO login...");
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "coo@hospital.com",
      password: "COO@2026",
    }),
  });
  const data = await response.json();
  console.log("COO login response:", data);
  return data;
}

async function main() {
  try {
    await seedDepartments();
    await seedUsers();
    await testLogin();
    console.log("\n✅ All setup complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
