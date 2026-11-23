const path = require("path");
require(path.join(__dirname, "../backend/node_modules/dotenv")).config({
  path: path.join(__dirname, "../backend/.env"),
});
const mongoose = require(path.join(__dirname, "../backend/node_modules/mongoose"));
const bcrypt = require(path.join(__dirname, "../backend/node_modules/bcryptjs"));

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const hashed = await bcrypt.hash("admin123", 12);
    const res = await mongoose.connection.collection("users").updateOne(
        { email: "admin@luxestay.com" },
        { $set: { password: hashed } }
    );
    console.log("Updated user password:", res);
    process.exit(0);
}).catch(console.error);
