import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoute";
import profileRoutes from "./routes/profileRoute";
import personalRoutes from "./routes/personalRoute"; 

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(express.json());
app.use(cookieParser());

// 📁 Folder upload static
app.use("/uploads", express.static("uploads"));

// 🧩 Register routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/personal", personalRoutes);

// 🚀 Jalankan server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
