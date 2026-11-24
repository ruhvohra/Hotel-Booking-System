/**
 * Run this script from the ROOT hotel-booking/ folder:
 * node scripts/createAdmin.js
 */

const path = require("path");
require(path.join(__dirname, "../backend/node_modules/dotenv")).config({
  path: path.join(__dirname, "../backend/.env"),
});

const mongoose = require(
  path.join(__dirname, "../backend/node_modules/mongoose"),
);
const bcrypt = require(
  path.join(__dirname, "../backend/node_modules/bcryptjs"),
);

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hotel_booking";

// Define schema inline to avoid import issues
const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const existing = await User.findOne({ email: "admin@luxestay.com" });

    if (existing) {
      existing.role = "admin";
      await existing.save();
      console.log("✅ Existing user updated to admin role.");
    } else {
      const hashed = await bcrypt.hash("admin123", 12);
      await User.create({
        name: "Admin User",
        email: "admin@luxestay.com",
        password: hashed,
        role: "admin",
      });
      console.log("✅ Admin user created!");
    }

    console.log("\n📋 Admin Credentials:");
    console.log("   Email   : admin@luxestay.com");
    console.log("   Password: admin123");
    console.log("\n⚠️  Change the password after first login!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    console.error("\nMake sure:");
    console.error('  1. You ran "npm install" inside the backend/ folder');
    console.error(
      '  2. MongoDB is running (run "mongod" in a separate terminal)',
    );
    console.error(
      "  3. backend/.env exists (copy from backend/.env.example)\n",
    );
    process.exit(1);
  }
}

createAdmin();
