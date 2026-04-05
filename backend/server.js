require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes")
const questionRoutes = require("./routes/questionRoutes");
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplaination } = require("./controllers/aiController");

const app = express();

//Middleware to handle CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://interview-prep-ai-lemon.vercel.app",
  "https://interview-prep-ai-4v64.onrender.com", // ✅ add this
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB()

//Middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use('/api/sessions',sessionRoutes);
app.use('/api/questions', questionRoutes);

app.use('/api/ai/generate-questions',protect,generateInterviewQuestions);
app.use('/api/ai/generate-explanation',protect,generateConceptExplaination);

//Server uploads folder
app.use("/uploads",express.static(path.join(__dirname,"uploads"),{}));

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));