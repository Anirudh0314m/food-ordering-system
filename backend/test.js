const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://Anirudh:user@cluster0.ecgsn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connection Successful");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed", err);
  });
