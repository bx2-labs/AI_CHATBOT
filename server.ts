import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

// Structure of our mock DB with added fields to support Algerian Dialect and dynamic pricing
interface DBStructure {
  merchants: Array<{
    id: string;
    name: string;
    email: string;
    plan: string;
    status: 'active' | 'suspended' | 'pending';
    messageCount: number;
    createdAt: string;
    botIdentity?: string;
    facebookPageId?: string;
    verifyToken?: string;
    password?: string;
    faqs?: Array<{ id: string; question: string; answer: string }>;
    
    // Step 4: Algerian dialect and payments
    algerianDialect?: boolean;
    trialExpiresAt?: string;
    paymentStatus?: 'none' | 'pending' | 'approved';
    paymentTxRef?: string;
    paymentMethod?: 'ccp' | 'baridimob';
    paymentAmount?: number;
  }>;
  plans: Array<{
    id: string;
    name: string;
    priceDZD: number;
    messageLimit: number;
    features: string[];
  }>;
}

// Initial default state with pre-configured bot personas
const DEFAULT_DB: DBStructure = {
  plans: [
    {
      id: "plan-basic",
      name: "Basic",
      priceDZD: 2000,
      messageLimit: 500,
      features: ["500 Messages", "Algerian Dialect Bot Mode", "Meta Webhook Integration", "Email Support"]
    },
    {
      id: "plan-pro",
      name: "Pro",
      priceDZD: 5000,
      messageLimit: 2000,
      features: ["2,000 Messages", "Algerian Dialect Bot Mode", "Custom FAQ Database", "Priority Response Speeds", "Standard Support"]
    },
    {
      id: "plan-premium",
      name: "Premium",
      priceDZD: 10000,
      messageLimit: 999999,
      features: ["Unlimited Messages", "Algerian Dialect Bot Mode", "Unlimited Custom FAQs", "Personal Account Manager", "Premium Tonality Guards"]
    }
  ],
  merchants: [
    {
      id: "merchant-1",
      name: "Bella Boutique",
      email: "bella@boutique.com",
      plan: "Basic",
      status: "active",
      messageCount: 42,
      createdAt: new Date().toISOString(),
      botIdentity: "You are an automated chatbot for Bella Boutique, a chic apparel store in Paris. Be polite, suggest elegant floral dresses ($80) and silk blouses ($120). Answer in 1-2 friendly sentences limit to 30 words.",
      facebookPageId: "bella_page_101",
      verifyToken: "azertyuiopA123",
      password: "password123",
      algerianDialect: true,
      faqs: [
        { id: "faq-1", question: "What is your return policy?", answer: "We accept returns within 14 days of purchase in original condition with tags attached. Sale items are final sale." },
        { id: "faq-2", question: "Where are you located?", answer: "Our boutique is located in the beautiful central district of Paris. Drop by and see us!" }
      ]
    }
  ]
};

// --- PostgreSQL Database Pool Setup ---
let pool: pg.Pool | null = null;
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  try {
    pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log("[PostgreSQL] Connection pool created with URL.");
  } catch (err) {
    console.error("[PostgreSQL] Failed to create connection pool:", err);
  }
} else {
  console.log("[PostgreSQL] DATABASE_URL is not provided, using filesystem fallback (db.json).");
}

// Validation function to ensure DB tables are set up
async function ensurePostgresSchema() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB NOT NULL
        )
      `);
      console.log("[PostgreSQL] Table 'app_state' verified/created successfully.");
      
      // Initialize state from local db.json or DEFAULT_DB if empty
      const res = await client.query("SELECT value FROM app_state WHERE key = 'db_structure'");
      if (res.rows.length === 0) {
        let initialData: DBStructure = DEFAULT_DB;
        try {
          const fileData = await fs.readFile(DB_PATH, "utf-8");
          initialData = JSON.parse(fileData);
        } catch (e) {
          // Fallback to DEFAULT_DB
        }
        await client.query(
          "INSERT INTO app_state (key, value) VALUES ('db_structure', $1)",
          [JSON.stringify(initialData)]
        );
        console.log("[PostgreSQL] Loaded initial db_structure into Neon Database.");
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[PostgreSQL] Failed ensuring Postgres tables schema:", err);
  }
}

// Safe database helpers
async function readDB(): Promise<DBStructure> {
  if (pool) {
    try {
      const res = await pool.query("SELECT value FROM app_state WHERE key = 'db_structure'");
      if (res.rows.length > 0) {
        const parsed = res.rows[0].value as DBStructure;
        
        // Auto migrations and compatibility checks
        let modified = false;
        if (!parsed.plans) {
          parsed.plans = DEFAULT_DB.plans;
          modified = true;
        }
        if (!parsed.merchants) {
          parsed.merchants = DEFAULT_DB.merchants;
          modified = true;
        }
        parsed.merchants.forEach((m: any) => {
          if (m.algerianDialect === undefined) {
            m.algerianDialect = true;
            modified = true;
          }
        });
        
        if (modified) {
          await pool.query(
            "INSERT INTO app_state (key, value) VALUES ('db_structure', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
            [JSON.stringify(parsed)]
          );
        }
        
        // Populate/update local fallback file
        try {
          await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
        } catch (err) {
          // ignore cache errors
        }
        
        return parsed;
      }
    } catch (err) {
      console.error("[PostgreSQL] Error fetching from Neon database, falling back to db.json", err);
    }
  }

  // Filesystem fallback
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    let modified = false;
    if (!parsed.plans) {
      parsed.plans = DEFAULT_DB.plans;
      modified = true;
    }
    parsed.merchants.forEach((m: any) => {
      if (m.algerianDialect === undefined) {
        m.algerianDialect = true;
        modified = true;
      }
    });
    if (modified) {
      await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (error) {
    // If files do not exist, write DEFAULT_DB
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
    return DEFAULT_DB;
  }
}

async function writeDB(db: DBStructure): Promise<void> {
  // Sync filesystem cache
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[FileSystem] Cache sync failed:", err);
  }

  // Sync Neon PostgreSQL
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO app_state (key, value) VALUES ('db_structure', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [JSON.stringify(db)]
      );
    } catch (err) {
      console.error("[PostgreSQL] State persistence update error:", err);
    }
  }
}

// Initialize and Retrieve Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  // Ensure we connect to PostgreSQL and validate schema
  await ensurePostgresSchema();

  const app = express();
  app.use(express.json());

  // --- API MIDDLEWARE & CORS HEADERS ---
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // --- API ENDPOINTS ---

  // Simple Hello Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", backend: "Express (Node.js)", hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // PostgreSQL Connection Status Helper Endpoint
  app.get("/api/db-status", async (req, res) => {
    if (!pool) {
      return res.json({
        success: false,
        connected: false,
        message: "No DATABASE_URL configured or pool is inactive"
      });
    }
    try {
      const dbRes = await pool.query("SELECT key, length(value::text) as size FROM app_state");
      res.json({
        success: true,
        connected: true,
        database: "Neon PostgreSQL",
        records: dbRes.rows,
        message: "Successfully queried Neon database. Integration is fully ready and successful!"
      });
    } catch (err: any) {
      res.json({
        success: false,
        connected: true,
        error: err.message,
        message: "Failed to query database table. Schema may need verification."
      });
    }
  });

  // 1. Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    
    // Simple authentication
    if (email === "admin@chatbot.com" && password === "admin123") {
      res.json({
        success: true,
        token: "mock-jwt-token-express",
        admin: { email: "admin@chatbot.com" }
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });

  // 1b. Merchant Login (Customer Gateway)
  app.post("/api/merchant/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const db = await readDB();
    const merchant = db.merchants.find(m => m.email.toLowerCase() === email.toLowerCase());

    if (!merchant) {
      res.status(401).json({ error: "No merchant found with this email" });
      return;
    }

    if (merchant.status !== "active") {
      res.status(403).json({ error: "This merchant profile is currently suspended or pending. Contact platform administration." });
      return;
    }

    // Default password check
    const mPassword = merchant.password || "password123";
    if (password === mPassword || password === merchant.verifyToken) {
      // Secure returned payload
      res.json({
        success: true,
        token: `mock-merchant-token-${merchant.id}`,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          plan: merchant.plan,
          status: merchant.status,
          messageCount: merchant.messageCount,
          createdAt: merchant.createdAt,
          botIdentity: merchant.botIdentity,
          facebookPageId: merchant.facebookPageId,
          verifyToken: merchant.verifyToken
        }
      });
    } else {
      res.status(401).json({ error: "Incorrect password or security token." });
    }
  });

  // 1c. Merchant SignUp
  app.post("/api/merchant/signup", async (req, res) => {
    const { name, email, password, plan } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required fields" });
      return;
    }

    const db = await readDB();
    const exists = db.merchants.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      res.status(400).json({ error: "A merchant profile with this email already exists" });
      return;
    }

    const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, "");
    const slugName = cleanName.toLowerCase().split(" ").join("_") || "brand";
    
    const newMerchant = {
      id: "merchant-" + Date.now(),
      name,
      email,
      plan: plan || "Basic",
      status: "active" as const,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      botIdentity: `You are a professional assistant for ${name}. Answer customers warmly and keep replies to 30 words.`,
      facebookPageId: `page_${slugName}_${Math.floor(Math.random() * 900 + 100)}`,
      verifyToken: `token_${slugName}_secret`,
      password: password,
      faqs: []
    };

    db.merchants.push(newMerchant);
    await writeDB(db);

    res.status(201).json({
      success: true,
      message: "Merchant account registered successfully",
      merchant: {
        id: newMerchant.id,
        name: newMerchant.name,
        email: newMerchant.email,
        plan: newMerchant.plan,
        status: newMerchant.status,
        messageCount: newMerchant.messageCount,
        createdAt: newMerchant.createdAt,
        botIdentity: newMerchant.botIdentity,
        facebookPageId: newMerchant.facebookPageId,
        verifyToken: newMerchant.verifyToken
      }
    });
  });

  // 2. View all merchants (Status and stats included)
  app.get("/api/admin/merchants", async (req, res) => {
    const db = await readDB();
    res.json(db.merchants);
  });

  // 3. Add a new merchant
  app.post("/api/admin/merchants", async (req, res) => {
    const { name, email, plan } = req.body;
    
    if (!name || !email) {
      res.status(400).json({ error: "Name and Email are required fields" });
      return;
    }

    const db = await readDB();
    
    // Check duplication
    const exists = db.merchants.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      res.status(400).json({ error: "A merchant with this email already exists" });
      return;
    }

    const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, "");
    const slugName = cleanName.toLowerCase().split(" ").join("_");

    const newMerchant = {
      id: "merchant-" + Date.now(),
      name,
      email,
      plan: plan || "Basic",
      status: "active" as const,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      botIdentity: `You are a professional assistant for ${name}. Answer customers warmly and keep replies to 30 words.`,
      facebookPageId: `page_${slugName}_${Math.floor(Math.random() * 900 + 100)}`,
      verifyToken: `token_${slugName}_secret`,
      password: "password123"
    };

    db.merchants.push(newMerchant);
    await writeDB(db);

    res.status(201).json(newMerchant);
  });

  // 4. Assign a plan to a merchant (Dynamic plans are allowed)
  app.put("/api/admin/merchants/:id/plan", async (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;

    const db = await readDB();
    const planObj = db.plans.find(p => p.name.toLowerCase() === plan.toLowerCase() || p.id === plan);
    if (!planObj && !["Basic", "Pro", "Premium"].includes(plan)) {
      res.status(400).json({ error: `Selected plan level '${plan}' is not defined in dynamic pricing records.` });
      return;
    }

    const merchantIndex = db.merchants.findIndex(m => m.id === id);
    if (merchantIndex === -1) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    db.merchants[merchantIndex].plan = planObj ? planObj.name : plan;
    await writeDB(db);

    res.json(db.merchants[merchantIndex]);
  });

  // 5. Update Merchant Status (Bonus helper for suspensions/activations)
  app.put("/api/admin/merchants/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "pending"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const db = await readDB();
    const merchantIndex = db.merchants.findIndex(m => m.id === id);

    if (merchantIndex === -1) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    db.merchants[merchantIndex].status = status;
    await writeDB(db);

    res.json(db.merchants[merchantIndex]);
  });

  // 6. Update Bot Configuration (Identity/Verify Token/Page ID/Algerian Dialect Toggle)
  app.put("/api/admin/merchants/:id/config", async (req, res) => {
    const { id } = req.params;
    const { botIdentity, facebookPageId, verifyToken, algerianDialect } = req.body;

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    if (botIdentity !== undefined) db.merchants[idx].botIdentity = botIdentity;
    if (facebookPageId !== undefined) db.merchants[idx].facebookPageId = facebookPageId;
    if (verifyToken !== undefined) db.merchants[idx].verifyToken = verifyToken;
    if (algerianDialect !== undefined) db.merchants[idx].algerianDialect = !!algerianDialect;

    await writeDB(db);
    res.json(db.merchants[idx]);
  });

  // 6b. Secure Merchant Portal Config Update Endpoint (hides other store configs, updates password as well + Dialect Toggle)
  app.put("/api/merchant/:id/config", async (req, res) => {
    const { id } = req.params;
    const { botIdentity, facebookPageId, verifyToken, password, algerianDialect } = req.body;

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    if (db.merchants[idx].status !== "active") {
      res.status(403).json({ error: "Your account is currently suspended/pending and cannot be updated." });
      return;
    }

    if (botIdentity !== undefined) db.merchants[idx].botIdentity = botIdentity;
    if (facebookPageId !== undefined) db.merchants[idx].facebookPageId = facebookPageId;
    if (verifyToken !== undefined) db.merchants[idx].verifyToken = verifyToken;
    if (password !== undefined) db.merchants[idx].password = password;
    if (algerianDialect !== undefined) db.merchants[idx].algerianDialect = !!algerianDialect;

    await writeDB(db);

    res.json({
      success: true,
      merchant: {
        id: db.merchants[idx].id,
        name: db.merchants[idx].name,
        email: db.merchants[idx].email,
        plan: db.merchants[idx].plan,
        status: db.merchants[idx].status,
        messageCount: db.merchants[idx].messageCount,
        createdAt: db.merchants[idx].createdAt,
        botIdentity: db.merchants[idx].botIdentity,
        facebookPageId: db.merchants[idx].facebookPageId,
        verifyToken: db.merchants[idx].verifyToken,
        algerianDialect: db.merchants[idx].algerianDialect
      }
    });
  });

  // 6c. Get all dynamic pricing plans
  app.get("/api/admin/plans", async (req, res) => {
    const db = await readDB();
    res.json(db.plans || []);
  });

  // 6d. Add a new dynamic plan
  app.post("/api/admin/plans", async (req, res) => {
    const { name, priceDZD, messageLimit, features } = req.body;
    if (!name || priceDZD === undefined || messageLimit === undefined) {
      res.status(400).json({ error: "Name, Price in DZD, and Message limit are required." });
      return;
    }

    const db = await readDB();
    
    // Check duplication
    const exists = db.plans.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      res.status(400).json({ error: "A plan with this name already exists" });
      return;
    }

    const newPlan = {
      id: "plan-" + Date.now(),
      name,
      priceDZD: Number(priceDZD),
      messageLimit: Number(messageLimit),
      features: features || []
    };

    db.plans.push(newPlan);
    await writeDB(db);

    res.status(201).json(newPlan);
  });

  // 6e. Update a dynamic plan
  app.put("/api/admin/plans/:id", async (req, res) => {
    const { id } = req.params;
    const { name, priceDZD, messageLimit, features } = req.body;

    const db = await readDB();
    const idx = db.plans.findIndex(p => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    if (name) db.plans[idx].name = name;
    if (priceDZD !== undefined) db.plans[idx].priceDZD = Number(priceDZD);
    if (messageLimit !== undefined) db.plans[idx].messageLimit = Number(messageLimit);
    if (features !== undefined) db.plans[idx].features = features;

    await writeDB(db);
    res.json(db.plans[idx]);
  });

  // 6f. Delete a plan
  app.delete("/api/admin/plans/:id", async (req, res) => {
    const { id } = req.params;
    const db = await readDB();
    
    const initialLen = db.plans.length;
    db.plans = db.plans.filter(p => p.id !== id);
    
    if (db.plans.length === initialLen) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    await writeDB(db);
    res.json({ success: true, message: "Plan successfully deleted" });
  });

  // 6g. Grant trial period (7 days, 30 days, or reset/0 days)
  app.put("/api/admin/merchants/:id/trial", async (req, res) => {
    const { id } = req.params;
    const { days } = req.body; // e.g. 7 or 30 or 0 (ends trial)

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    if (Number(days) === 0) {
      db.merchants[idx].trialExpiresAt = undefined;
    } else {
      const expires = new Date();
      expires.setDate(expires.getDate() + Number(days));
      db.merchants[idx].trialExpiresAt = expires.toISOString();
      db.merchants[idx].status = "active"; // Auto-activate trial account!
    }

    await writeDB(db);
    res.json(db.merchants[idx]);
  });

  // 6h. Merchant submits CCP or Baridimob payment claim
  app.post("/api/merchant/:id/payment", async (req, res) => {
    const { id } = req.params;
    const { paymentMethod, paymentTxRef, paymentAmount } = req.body;

    if (!paymentMethod || !paymentTxRef) {
      res.status(400).json({ error: "Payment method (CCP/Baridimob) and transaction description are required" });
      return;
    }

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    db.merchants[idx].paymentStatus = "pending";
    db.merchants[idx].paymentMethod = paymentMethod;
    db.merchants[idx].paymentTxRef = paymentTxRef;
    db.merchants[idx].paymentAmount = paymentAmount ? Number(paymentAmount) : 2000;
    
    await writeDB(db);
    res.json({ success: true, merchant: db.merchants[idx] });
  });

  // 6i. Admin manual payment action (approves / rejects payment claim)
  app.put("/api/admin/merchants/:id/confirm-payment", async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    if (action === "approve") {
      db.merchants[idx].paymentStatus = "approved";
      db.merchants[idx].status = "active";
    } else {
      db.merchants[idx].paymentStatus = "none";
      db.merchants[idx].paymentTxRef = undefined;
      db.merchants[idx].paymentMethod = undefined;
    }

    await writeDB(db);
    res.json(db.merchants[idx]);
  });

  // --- MERCHANT FAQ SYSTEM ENDPOINTS ---
  
  // 6c. Get FAQs of authenticated merchant
  app.get("/api/merchant/:id/faqs", async (req, res) => {
    const { id } = req.params;
    const db = await readDB();
    const merchant = db.merchants.find(m => m.id === id);

    if (!merchant) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    res.json(merchant.faqs || []);
  });

  // 6d. Add standard FAQ question and answer
  app.post("/api/merchant/:id/faqs", async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: "FAQ Question and Answer are required fields" });
      return;
    }

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    const newFaq = {
      id: "faq-" + Date.now(),
      question: question.trim(),
      answer: answer.trim()
    };

    if (!db.merchants[idx].faqs) {
      db.merchants[idx].faqs = [];
    }

    db.merchants[idx].faqs!.push(newFaq);
    await writeDB(db);

    res.status(201).json(newFaq);
  });

  // 6e. Delete specific FAQ
  app.delete("/api/merchant/:id/faqs/:faqId", async (req, res) => {
    const { id, faqId } = req.params;

    const db = await readDB();
    const idx = db.merchants.findIndex(m => m.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    if (!db.merchants[idx].faqs) {
      db.merchants[idx].faqs = [];
    }

    const originalLength = db.merchants[idx].faqs!.length;
    db.merchants[idx].faqs = db.merchants[idx].faqs!.filter(item => item.id !== faqId);

    if (db.merchants[idx].faqs!.length === originalLength) {
      res.status(404).json({ error: "FAQ item not found" });
      return;
    }

    await writeDB(db);
    res.json({ success: true, message: "FAQ successfully deleted" });
  });

  // 7. Simulate message count incrementation (Simulate customer talking to Bot)
  app.post("/api/admin/merchants/:id/simulate_message", async (req, res) => {
    const { id } = req.params;

    const db = await readDB();
    const merchantIndex = db.merchants.findIndex(m => m.id === id);

    if (merchantIndex === -1) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    db.merchants[merchantIndex].messageCount += 1;
    await writeDB(db);

    res.json(db.merchants[merchantIndex]);
  });

  // ==========================================
  // --- STEP 2: META WEBHOOK ENDPOINTS -------
  // ==========================================

  // A. Webhook Verification Endpoint (GET)
  // Used by Meta to register the webhook. Verification protocol.
  app.get(["/webhook", "/api/webhook"], async (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      // Loop through merchants to find if any verifyToken matches.
      const db = await readDB();
      const matchedMerchant = db.merchants.find(m => m.verifyToken === token);
      
      if (mode === "subscribe" && matchedMerchant) {
        console.log(`[Webhook Verified] Successfully verified webhook for merchant: ${matchedMerchant.name}`);
        res.status(200).send(challenge);
      } else {
        console.warn(`[Webhook Verification Failed] Token mismatch or mode mismatch: ${token}`);
        res.status(403).send("Verification token mismatch or mode unsupported");
      }
    } else {
      res.status(400).send("Bad request parameters");
    }
  });

  // B. Facebook/Instagram Webhook Event Endpoint (POST)
  // Receives customer message events, triggers free Google Gemini AI, sends response
  app.post(["/webhook", "/api/webhook"], async (req, res) => {
    const body = req.body;

    // Confirm this is an event from a page subscription
    if (body.object === "page") {
      const db = await readDB();

      // Iterate over each entry - there may be multiple if batched
      for (const entry of body.entry) {
        const pageId = entry.id; // Facebook Page ID corresponding to custom merchant profile
        const messaging = entry.messaging || [];

        // Match merchant profile using page ID
        const merchant = db.merchants.find(m => m.facebookPageId === pageId);
        
        if (!merchant) {
          console.warn(`[Webhook Error] Page ID ${pageId} matches no registered merchants.`);
          continue;
        }

        if (merchant.status !== "active") {
          console.warn(`[Webhook Blocked] Merchant ${merchant.name} is currently suspended.`);
          continue;
        }

        // Get Plan Limit dynamically based on pricing plans
        const planObj = db.plans.find(p => p.name.toLowerCase() === merchant.plan.toLowerCase())
                        || db.plans.find(p => p.id === merchant.plan)
                        || db.plans[0];
        const limit = planObj ? planObj.messageLimit : 500;

        if (merchant.messageCount >= limit) {
          console.warn(`[Webhook Blocked] Merchant ${merchant.name} reached message count limit: ${merchant.messageCount}/${limit}`);
          continue;
        }

        for (const event of messaging) {
          if (event.message && event.message.text) {
            const senderId = event.sender.id;
            const messageText = event.message.text;

            console.log(`[Incoming Message] Merchant "${merchant.name}" received message: "${messageText}" from Sender: ${senderId}`);

            let botReply = "";
            let isFaqMatch = false;

            // 1. Check merchant's custom FAQs first
            const cleanText = (str: string) => str.toLowerCase().replace(/[?.,!\u061f()]/g, "").trim();
            const msgClean = cleanText(messageText);
            const matchedFaq = (merchant.faqs || []).find(faq => {
              const qClean = cleanText(faq.question);
              return msgClean === qClean || msgClean.includes(qClean) || qClean.includes(msgClean);
            });

            if (matchedFaq) {
              botReply = matchedFaq.answer;
              isFaqMatch = true;
              console.log(`[FAQ Match Found] Responding with FAQ answer for question: "${matchedFaq.question}"`);
            } else {
              // 2. Process via Google Gemini AI (Free Model gemini-3.5-flash) with Algerian Dialect support
              let systemPrompt = merchant.botIdentity || `You are an AI assistant for ${merchant.name}. Answer customers inquiries warmly and limit responses to 35 words.`;
              if (merchant.algerianDialect) {
                systemPrompt += " DIRECTIVE: You MUST respond in Algerian Dialect (Darja), mixing Arabic letters and French words/phrases naturally (e.g., 'واش راك؟ كيفاش نقدر نعاونك؟', 'مرحبا! أنا هنا باش نخدمك'). If the customer writes in French, reply in French mixed with Darja. If the customer writes in Arabic, reply in Darja. Keep replies ultra-short, friendly, natural and authentic, simulating a real Algerian retail agent. Limit to 25 words.";
              }
              const gemini = getGeminiClient();

              if (gemini) {
                try {
                  const response = await gemini.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: messageText,
                    config: {
                      systemInstruction: systemPrompt
                    }
                  });
                  botReply = response.text || "Sorry, I am having trouble understanding that right now.";
                } catch (gemError: any) {
                  console.error("[Gemini AI Error]", gemError);
                  if (merchant.algerianDialect) {
                    botReply = `يعطيك الصحة لي كونتاكتيتنا! كاين شوية ضغط، دوك نرجعو ليك في أقرب وقت. شكرا ليك!`;
                  } else {
                    botReply = `[AI System Busy] Thanks for reaching out to ${merchant.name}! We will get back to you shortly.`;
                  }
                }
              } else {
                // High-quality offline fallback simulator for seamless testing (with Algerian Darja Support)
                if (merchant.algerianDialect) {
                  const isFrench = messageText.toLowerCase().includes("bonjour") || messageText.toLowerCase().includes("prix") || messageText.toLowerCase().includes("adresse");
                  if (isFrench) {
                    botReply = `Bonjour! Bienvenue chez ${merchant.name}. واش راك؟ كيفاش نقدر نعاونك اليوم خو؟`;
                  } else {
                    botReply = `مرحبا بيك في ${merchant.name}! أنا هنا باش نخدمك ونعاونك. قولي، واش راك تحوس؟`;
                  }
                } else {
                  botReply = `Offline fallback reply for ${merchant.name} (Configure process.env.GEMINI_API_KEY in Secrets for real-time generative answers): "Regarding your query '${messageText}', we would be delighted to assist! Our boutique is fully open today!"`;
                }
              }
            }

            // 3. Increment active messageCount for merchant
            merchant.messageCount += 1;
            
            // Log outgoing reply simulation
            console.log(`[Outgoing Auto-Reply via Meta API] Send back to ${senderId}: "${botReply}" (FAQ match: ${isFaqMatch})`);
            
            // Dispatch message via Meta Facebook Graph Send API if credentials are hypothetically available
            try {
              const fetchUrl = `https://graph.facebook.com/v19.0/me/messages`;
              // Try to perform a physical post if there's an accessToken or verifyToken loaded (sandbox helper)
              if (process.env.META_PAGE_ACCESS_TOKEN) {
                await fetch(`${fetchUrl}?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    recipient: { id: senderId },
                    message: { text: botReply }
                  })
                });
                console.log(`[Graph API Dispatched SUCCESS] Messaged ${senderId}`);
              }
            } catch (graphError) {
              console.error("[Facebook Graph API Delivery Fail]", graphError);
            }
          }
        }
      }

      await writeDB(db);
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  });

  // C. Local Sandbox Simulator Endpoint (POST)
  // Highly interactive loop built for the frontend playground. Shows exact trace.
  app.post("/api/webhook/simulate", async (req, res) => {
    const { merchantId, messageText, senderId } = req.body;

    if (!merchantId || !messageText) {
      res.status(400).json({ error: "merchantId and messageText are required" });
      return;
    }

    const db = await readDB();
    const merchant = db.merchants.find(m => m.id === merchantId);

    if (!merchant) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    const trace: string[] = [];
    trace.push(`[1] Simulation started for merchant: "${merchant.name}" (ID: ${merchant.id})`);
    trace.push(`[2] Page ID identified: ${merchant.facebookPageId || "Undefined (Default generated)"}`);
    trace.push(`[3] Verify Token configuration: "${merchant.verifyToken || "Default generated"}"`);

    if (merchant.status !== "active") {
      trace.push(`[BLOCKED] Merchant status is "${merchant.status}". Simulation terminated.`);
      res.status(400).json({
        success: false,
        error: "Merchant is not active.",
        trace
      });
      return;
    }

    // Checking message count limit dynamically based on pricing plans
    const planObj = db.plans.find(p => p.name.toLowerCase() === merchant.plan.toLowerCase())
                    || db.plans.find(p => p.id === merchant.plan)
                    || db.plans[0];
    const limit = planObj ? planObj.messageLimit : 500;
    trace.push(`[4] Verifying usage counts: currently ${merchant.messageCount}/${limit} messages consumed.`);
    
    if (merchant.messageCount >= limit) {
      trace.push(`[BLOCKED] Quota reached! Consumed ${merchant.messageCount} of ${limit} monthly responses under plan '${merchant.plan}'. Bot response halted!`);
      res.status(400).json({
        success: false,
        error: `Bot has reached the ${limit} messages monthly limit for subscription plan '${merchant.plan}'. Please upgrade in the Platform Controls!`,
        trace
      });
      return;
    }

    let botReply = "";
    let isRealAI = false;
    let isFaqMatch = false;

    // A. Check merchant's custom FAQs first
    const cleanText = (str: string) => str.toLowerCase().replace(/[?.,!\u061f()]/g, "").trim();
    const msgClean = cleanText(messageText);
    const matchedFaq = (merchant.faqs || []).find(faq => {
      const qClean = cleanText(faq.question);
      return msgClean === qClean || msgClean.includes(qClean) || qClean.includes(msgClean);
    });

    if (matchedFaq) {
      botReply = matchedFaq.answer;
      isFaqMatch = true;
      trace.push(`[FAQ MATCH FOUND] Customer query matched custom FAQ question: "${matchedFaq.question}". Answer returned: "${botReply}" (Gemini GenAI bypassed)`);
    } else {
      trace.push(`[FAQ MISSED] No custom FAQ question matches message: "${messageText}". Delegating to Gemini AI...`);
      
      let systemPrompt = merchant.botIdentity || `You are an AI assistant for ${merchant.name}. Answer customers inquiries warmly and limit responses to 30 words.`;
      if (merchant.algerianDialect) {
        systemPrompt += " DIRECTIVE: You MUST respond in Algerian Dialect (Darja), mixing Arabic letters and French words/phrases naturally (e.g., 'واش راك؟ كيفاش نقدر نعاونك؟', 'مرحبا! أنا هنا باش نخدمك'). If the customer writes in French, reply in French mixed with Darja. If the customer writes in Arabic, reply in Darja. Keep replies ultra-short, friendly, natural and authentic, simulating a real Algerian retail agent. Limit to 25 words.";
      }
      trace.push(`[Gemini Setup] System instructions payload: "${systemPrompt}"`);

      const gemini = getGeminiClient();

      if (gemini) {
        try {
          trace.push(`[Gemini API] Requesting generative answer from Google Gemini 3.5 Flash...`);
          const response = await gemini.models.generateContent({
            model: "gemini-3.5-flash",
            contents: messageText,
            config: {
              systemInstruction: systemPrompt
            }
          });
          botReply = response.text || "I apologize, I could not generate a clear response.";
          isRealAI = true;
          trace.push(`[Gemini API Response] Generative model reply generated successfully.`);
        } catch (gemError: any) {
          trace.push(`[ERROR] Gemini call failed: ${gemError.message || gemError}`);
          if (merchant.algerianDialect) {
            botReply = `سمحلي خويا العزيز، كاين بروبليم تكنيك. عاود ابعثلنا ميساج من بعد شوية ونجاوبوك!`;
          } else {
            botReply = `Thanks for messaging ${merchant.name}! We will get back to you soon. [Live AI Engine Offline]`;
          }
          trace.push(`[Emergency Fallback] Default emergency response assigned.`);
        }
      } else {
        trace.push(`[No Gemini API Key] Triggering offline local smart classifier for playgound...`);
        const msgLower = messageText.toLowerCase();
        if (merchant.algerianDialect) {
          if (msgLower.includes("prix") || msgLower.includes("price") || msgLower.includes("how much") || msgLower.includes("شحال") || msgLower.includes("بشحال")) {
            botReply = `أهلا بيك! Les prix يبداو من 2,000 DZD و l'article لي يعجبك نقدر نديرولك réduction. واش رايك؟`;
          } else if (msgLower.includes("adresse") || msgLower.includes("where") || msgLower.includes("location") || msgLower.includes("بلاصة") || msgLower.includes("وين")) {
            botReply = `المحل تاعنا جاي في وسط الدزاير العاصمة، مرحبا بيك في أي وقت باش تشوف la collection!`;
          } else if (msgLower.includes("bonjour") || msgLower.includes("salut") || messageText.includes("سلام")) {
            botReply = `واش راك خو؟ مرحبا بيك! كيفاش نقدر نعاونك اليوم في ${merchant.name}؟`;
          } else {
            botReply = `يعطيك الصحة لي كونتاكتيتنا! الميساج تاعك: "${messageText}" لحقنا وسيتم الرد عليك حالا!`;
          }
        } else {
          if (msgLower.includes("price") || msgLower.includes("cost") || msgLower.includes("how much")) {
            botReply = `Hello! Thanks for asking about cost. Our prices are competitive, and products start at around 2,000 DZD. Let us know if we can help you order!`;
          } else if (msgLower.includes("address") || msgLower.includes("where") || msgLower.includes("location")) {
            botReply = `We are conveniently located in the primary shopping district. Map coordinates are available in our header!`;
          } else {
            botReply = `Hi there! Thank you for messaging ${merchant.name}. We have received your query: "${messageText}". How can we help you on Messenger?`;
          }
        }
        trace.push(`[Local Fallback Output] Static text response generated successfully.`);
      }
    }

    // Increment message count
    merchant.messageCount += 1;
    await writeDB(db);
    trace.push(`[Database Synced] Incremented message counter. Total messages consumed: ${merchant.messageCount}`);
    trace.push(`[Dispatch Hub] Dispatched auto-response package to Facebook Graph User ID: ${senderId}`);

    res.json({
      success: true,
      botReply,
      isRealAI,
      isFaqMatch,
      trace,
      merchant
    });
  });


  // --- VITE INTERACTION LAYER ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // --- START DEPLOY ---
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Admin server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
