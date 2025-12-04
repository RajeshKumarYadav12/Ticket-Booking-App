require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const connectDB = require("../config/db");

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();

    // Create users
    const users = await User.create([
      {
        name: "Admin User",
        email: process.env.ADMIN_EMAIL || "admin@ticketing.com",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "admin",
      },
      {
        name: "Support Agent 1",
        email: "agent1@ticketing.com",
        password: "Agent@123",
        role: "agent",
      },
      {
        name: "Support Agent 2",
        email: "agent2@ticketing.com",
        password: "Agent@123",
        role: "agent",
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: "User@123",
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "User@123",
        role: "user",
      },
    ]);

    console.log("✅ Users seeded successfully");
    console.log("\n📋 Login Credentials:");
    console.log("\n👑 Admin:");
    console.log(`   Email: ${users[0].email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
    console.log("\n🎧 Agent 1:");
    console.log("   Email: agent1@ticketing.com");
    console.log("   Password: Agent@123");
    console.log("\n🎧 Agent 2:");
    console.log("   Email: agent2@ticketing.com");
    console.log("   Password: Agent@123");
    console.log("\n👤 User 1:");
    console.log("   Email: john@example.com");
    console.log("   Password: User@123");
    console.log("\n👤 User 2:");
    console.log("   Email: jane@example.com");
    console.log("   Password: User@123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
