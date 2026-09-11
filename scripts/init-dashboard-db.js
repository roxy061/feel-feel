const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function initDashboardDb() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: "3nfm_saas",
    });

    console.log("Connected to 3nfm_saas database.");

    // 1. Create users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        tokens INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Seed mock user u-001
    await conn.query(`
      INSERT INTO users (id, name, email, tokens) 
      VALUES ('u-001', '3NFM Merchant Owner', 'owner@3nfm.shop', 10)
      ON DUPLICATE KEY UPDATE name = VALUES(name);
    `);
    console.log("User u-001 configured with 10 tokens.");

    // 2. Add columns to stores table
    try {
      await conn.query("ALTER TABLE stores ADD COLUMN user_id VARCHAR(64) DEFAULT 'u-001' AFTER subdomain;");
    } catch (e) {}

    try {
      await conn.query("ALTER TABLE stores ADD COLUMN store_key VARCHAR(64) DEFAULT 'store-3nfm' AFTER user_id;");
    } catch (e) {}

    try {
      await conn.query("ALTER TABLE stores ADD COLUMN expires_at DATETIME DEFAULT NULL AFTER truemoney_phone;");
    } catch (e) {}

    // Update existing stores with expires_at (30 days from now)
    await conn.query(`
      UPDATE stores 
      SET 
        user_id = 'u-001', 
        store_key = 'store-3nfm',
        expires_at = IFNULL(expires_at, DATE_ADD(NOW(), INTERVAL 30 DAY))
      WHERE id = 1 OR subdomain = 'apex';
    `);
    console.log("Store 3nfm/Apex updated with user_id 'u-001', store_key 'store-3nfm', and 30-day expiration.");

    // 3. Add columns to orders table
    try {
      await conn.query("ALTER TABLE orders ADD COLUMN slip_url VARCHAR(500) NULL AFTER voucher_amount;");
    } catch (e) {}

    try {
      await conn.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' AFTER slip_url;");
    } catch (e) {}

    console.log("Orders table updated with slip_url and payment_status.");

    // 4. Ensure directories exist
    const imagesDir = path.join(__dirname, "..", "public", "images");
    const slipsDir = path.join(__dirname, "..", "public", "uploads", "slips");

    fs.mkdirSync(imagesDir, { recursive: true });
    fs.mkdirSync(slipsDir, { recursive: true });

    // 5. Create a sample promptpay-qr.jpg if it doesn't exist
    const qrImagePath = path.join(imagesDir, "promptpay-qr.jpg");
    if (!fs.existsSync(qrImagePath)) {
      // Create a clean SVG QR code with PromptPay styling and write it or a buffer
      // As a fallback JPEG/SVG data
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="#010101"/>
        <rect x="15" y="15" width="270" height="270" rx="12" fill="#272835" stroke="#EEEFF2" stroke-opacity="0.2"/>
        <text x="150" y="45" fill="#EEEFF2" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">PROMPTPAY QR</text>
        <rect x="50" y="60" width="200" height="200" rx="8" fill="#FFFFFF"/>
        <rect x="65" y="75" width="50" height="50" fill="#010101"/>
        <rect x="75" y="85" width="30" height="30" fill="#FFFFFF"/>
        <rect x="83" y="93" width="14" height="14" fill="#010101"/>
        <rect x="185" y="75" width="50" height="50" fill="#010101"/>
        <rect x="195" y="85" width="30" height="30" fill="#FFFFFF"/>
        <rect x="203" y="93" width="14" height="14" fill="#010101"/>
        <rect x="65" y="195" width="50" height="50" fill="#010101"/>
        <rect x="75" y="205" width="30" height="30" fill="#FFFFFF"/>
        <rect x="83" y="213" width="14" height="14" fill="#010101"/>
        <rect x="130" y="130" width="40" height="40" rx="4" fill="#003D6B"/>
        <text x="150" y="155" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">TH</text>
        <text x="150" y="280" fill="#EEEFF2" font-family="monospace" font-size="11" opacity="0.6" text-anchor="middle">081-234-5678</text>
      </svg>`;
      fs.writeFileSync(qrImagePath, Buffer.from(svgContent));
      console.log("Created public/images/promptpay-qr.jpg mock asset.");
    }

    console.log("Dashboard database & storage initialization complete!");
  } catch (err) {
    console.error("Error during dashboard db setup:", err);
  } finally {
    if (conn) await conn.end();
  }
}

initDashboardDb();
