import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import annoncesRouter from "./routes/annonces.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

/**
 * FR: CORS pour le frontend (Vite/React).
 */
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

/**
 * FR: Routes
 */
app.use("/auth", authRouter);
app.use("/annonces", annoncesRouter);

/**
 * FR: Health check
 */
app.get("/health", (_req, res) => {
  res.json({ message: "Serveur OK." });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Backend démarré sur http://localhost:${port}`));