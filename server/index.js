import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

import {
  translations,
  LANGUAGES,
} from "../shared/translations.js";

dotenv.config({ path: ".env.local" });
dotenv.config(); // also allow a plain .env

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "narxitop";

if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env.local");
  process.exit(1);
}

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
  })
);

app.use(express.json());

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

/* ------------------------------------------------------------------ */
/* Seed: copy every text from shared/translations.js into MongoDB.     */
/* Existing keys are overwritten, keys you added by hand are kept.     */
/* ------------------------------------------------------------------ */
async function seedTranslations() {
  const collection = db.collection("translations");

  for (const lang of LANGUAGES) {
    const set = { lang, updatedAt: new Date() };

    for (const [key, value] of Object.entries(translations[lang])) {
      // Mongo field names cannot contain "." — store keys with "|" instead.
      set[`messages.${key.replaceAll(".", "|")}`] = value;
    }

    await collection.updateOne(
      { _id: lang },
      { $set: set },
      { upsert: true }
    );
  }

  console.log(`✅ Translations seeded (${LANGUAGES.join(", ")})`);
}

/* ------------------------------ Routes ----------------------------- */

app.get("/api/health", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(503)
        .json({ success: false, message: "Database is not connected." });
    }

    await db.command({ ping: 1 });

    res.json({
      success: true,
      message: "NarxTop API and MongoDB are connected.",
      database: MONGODB_DB_NAME,
    });
  } catch (error) {
    console.error("Health check error:", error);
    res
      .status(500)
      .json({ success: false, message: "MongoDB connection check failed." });
  }
});

app.get("/api/translations", (req, res) => {
  res.json({ success: true, languages: LANGUAGES });
});

app.get("/api/translations/:lang", async (req, res) => {
  const { lang } = req.params;

  if (!LANGUAGES.includes(lang)) {
    return res
      .status(404)
      .json({ success: false, message: "Unsupported language." });
  }

  try {
    const doc = await db
      .collection("translations")
      .findOne({ _id: lang });

    // Convert "nav|home" back to "nav.home"
    const messages = {};
    for (const [key, value] of Object.entries(doc?.messages || {})) {
      messages[key.replaceAll("|", ".")] = value;
    }

    res.json({ success: true, lang, messages });
  } catch (error) {
    console.error("Translations error:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not load translations." });
  }
});

/* ------------------------------ Start ------------------------------ */

async function startServer() {
  try {
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    await db.command({ ping: 1 });

    console.log("✅ Connected to MongoDB");
    console.log(`✅ Database: ${MONGODB_DB_NAME}`);

    await seedTranslations();

    app.listen(PORT, () => {
      console.log(`✅ API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:");
    console.error(error.message);
    process.exit(1);
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await client.close();
    process.exit(0);
  });
}

startServer();
