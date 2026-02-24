import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import annoncesRouter from "./routes/annonces.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "backend-node", time: new Date().toISOString() });
});

app.use("/annonces", annoncesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
