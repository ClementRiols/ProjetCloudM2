import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, RESOURCE } from "../awsClients.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // 本地测试用

function userPk(email) {
  return `USER#${String(email).trim().toLowerCase()}`;
}

/**
 * POST /auth/register
 * body: { email, password }
 */
router.post("/register", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email) return res.status(400).json({ error: "Email requis." });
  if (!password || password.length < 6) return res.status(400).json({ error: "Mot de passe (min 6 caractères) requis." });

  const pk = userPk(email);

  try {
    const existing = await ddb.send(new GetCommand({ TableName: RESOURCE.usersTable, Key: { pk } }));
    if (existing.Item) return res.status(409).json({ error: "Compte déjà existant." });

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    await ddb.send(new PutCommand({
      TableName: RESOURCE.usersTable,
      Item: { pk, email, passwordHash, createdAt }
    }));

    return res.status(201).json({ message: "Compte créé." });
  } catch (e) {
    console.error("REGISTER error:", e);
    return res.status(500).json({ error: "Impossible de créer le compte." });
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email) return res.status(400).json({ error: "Email requis." });
  if (!password) return res.status(400).json({ error: "Mot de passe requis." });

  const pk = userPk(email);

  try {
    const out = await ddb.send(new GetCommand({ TableName: RESOURCE.usersTable, Key: { pk } }));
    const user = out.Item;
    if (!user) return res.status(401).json({ error: "Identifiants invalides." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides." });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token, user: { email } });
  } catch (e) {
    console.error("LOGIN error:", e);
    return res.status(500).json({ error: "Impossible de se connecter." });
  }
});

export default router;