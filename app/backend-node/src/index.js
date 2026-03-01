import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import annoncesRouter from "./routes/annonces.js";

dotenv.config();

const app = express();

/**
 * FR: CORS pour le frontend (Vite/React).
 * CN: 允许前端跨域访问后端。
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
 * CN: 路由入口
 */
app.use("/annonces", annoncesRouter);

/**
 * FR: Health check
 * CN: 健康检查
 */
app.get("/health", (_req, res) => {
  res.json({ message: "Serveur OK." });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Backend démarré sur http://localhost:${port}`));