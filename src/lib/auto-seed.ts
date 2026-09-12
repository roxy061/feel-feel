import { db } from "@/lib/db";

let isSeeded = false;
let seedPromise: Promise<void> | null = null;

const APEX_PRODUCTS = [
  {
    name: "Carbon Fiber Aero GT Wing",
    description: "สปอยเลอร์คาร์บอนไฟเบอร์แท้ 100% เพิ่มแรงกดท้าย Downforce 45 กก. ที่ความเร็ว 200 กม./ชม. พร้อมขายึดไทเทเนียม CNC น้ำหนักเบาพิเศษ",
    price: 34900.0,
    stock: 5,
    category: "Aero & Carbon",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Forged Monoblock 6-Pot Calipers",
    description: "ชุดคาลิปเปอร์เบรกโมโนบล็อกอะลูมิเนียมฟอร์จ 6 ลูกสูบ พร้อมจานขยายเซาะร่อง 390mm ทนความร้อนสูง 800°C ตอบสนองระยะเบรกแม่นยำฉับไว",
    price: 54000.0,
    stock: 4,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "ECU Stage 2 Remap Tuning File",
    description: "ซอฟต์แวร์ปรับจูนแมพน้ำมันและไฟจุดระเบิด ปลดล็อคแรงม้าเพิ่มขึ้น +65 HP และแรงบิด +90 Nm สำหรับเชื้อเพลิง 95/E20",
    price: 19500.0,
    stock: 99,
    category: "Engine & Tuning",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Titanium Valvetronic Cat-Back Exhaust",
    description: "ระบบท่อไอเสียไทเทเนียมเกรดอากาศยานทั้งเส้นพร้อมวาล์วไฟฟ้าเปิด-ปิดเสียง ควบคุมด้วยรีโมทไร้สายและแอปพลิเคชัน",
    price: 46000.0,
    stock: 6,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Competition 2-Way Coilover Suspension",
    description: "โช้คอัพสตรัทปรับเกลียว 2-Way ปรับ Rebound และ Compression แยกอิสระ 32 ระดับ ซับแรงกระแทกและควบคุมเสถียรภาพตัวถังในโค้ง",
    price: 44500.0,
    stock: 8,
    category: "Aero & Carbon",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Forged Racing Monoblock Wheels 19-inch",
    description: "ล้อแม็กฟอร์จน้ำหนักเบาพิเศษ แข็งแกร่งทนทานรับแรงบิดมหาศาล สไตล์ Racing Concave Spec",
    price: 56000.0,
    stock: 4,
    category: "Aero & Carbon",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  },
];

const THREE_NFM_PRODUCTS = [
  {
    name: "Titanium Exhaust Downpipe",
    description: "ท่อระบายไอเสียไทเทเนียมเกรดอากาศยาน น้ำหนักเบาพิเศษ เพิ่มอัตราการไหลเวียนไอเสีย Flow สูงสุด 38% ทนความร้อนสูง",
    price: 38500.0,
    stock: 6,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Digital Telemetry Lap Timer",
    description: "จอแสดงผลข้อมูลการขับขี่และจับเวลารอบสนามแบบเรียลไทม์ พร้อมเซนเซอร์ GPS 10Hz และการเชื่อมต่อ CAN-Bus แม่นยำสูง",
    price: 21900.0,
    stock: 10,
    category: "Electronics & Telemetry",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "High-Flow Air Intake Box",
    description: "ชุดกรองอากาศคาร์บอนไฟเบอร์เกรดแห้งแบบ Dry Carbon เพิ่มปริมาณอากาศเข้าสู่ห้องเผาไหม้และกักเก็บความเย็น",
    price: 28000.0,
    stock: 8,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Quickshifter Controller Unit",
    description: "กล่องตัดรอบไฟเปลี่ยนเกียร์สมูทไม่ต้องยกคันเร่ง ความเร็วตัดไฟ 0.04 วินาที ยกระดับความเร็วอัตราเร่งทางตรง",
    price: 16500.0,
    stock: 12,
    category: "Electronics & Telemetry",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "3NFM Stage-3 Carbon Intake Plenum",
    description: "ท่อร่วมไอดีคาร์บอนไฟเบอร์เกรดแห้งแบบ Dry Carbon เพิ่มปริมาตรการไหลเวียนของไอดี 45% ทนความร้อนสูง",
    price: 36500.0,
    stock: 4,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ceramic-Carbon Monoblock Brake Rotor 380mm",
    description: "จานเบรกเซรามิกคาร์บอนน้ำหนักเบาพิเศษ ทนอุณหภูมิสนามแข่งได้ถึง 1,000°C โดยไม่มีอาการเบรกเฟด",
    price: 58000.0,
    stock: 3,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  },
];

async function runDatabaseSeed(): Promise<void> {
  // 1. Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      tokens INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 2. Create stores table
  await db.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subdomain VARCHAR(100) NOT NULL UNIQUE,
      user_id VARCHAR(64) DEFAULT 'u-001',
      store_key VARCHAR(64) DEFAULT 'store-3nfm',
      name VARCHAR(255) NOT NULL,
      description TEXT,
      tagline VARCHAR(255) DEFAULT 'DOMINATE EVERY CORNER WITH PRECISION',
      decorative_text VARCHAR(255) DEFAULT 'APEX PERFORMANCE',
      video_url VARCHAR(500) DEFAULT 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4',
      banner_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
      truemoney_phone VARCHAR(20) DEFAULT '0812345678',
      expires_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Safely ensure columns on stores table
  try {
    await db.query("ALTER TABLE stores ADD COLUMN user_id VARCHAR(64) DEFAULT 'u-001' AFTER subdomain;");
  } catch {}
  try {
    await db.query("ALTER TABLE stores ADD COLUMN store_key VARCHAR(64) DEFAULT 'store-3nfm' AFTER user_id;");
  } catch {}
  try {
    await db.query("ALTER TABLE stores ADD COLUMN promptpay_number VARCHAR(50) DEFAULT '0812345678' AFTER truemoney_phone;");
  } catch {}
  try {
    await db.query("ALTER TABLE stores ADD COLUMN expires_at DATETIME DEFAULT NULL AFTER promptpay_number;");
  } catch {}
  try {
    await db.query("ALTER TABLE stores ADD COLUMN status VARCHAR(30) DEFAULT 'active' AFTER expires_at;");
  } catch {}

  // 3. Create products table
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INT DEFAULT 10,
      image_url VARCHAR(500),
      category VARCHAR(100) DEFAULT 'Performance',
      is_available TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_store_available (store_id, is_available)
    ) ENGINE=InnoDB;
  `);

  // 4. Create orders table
  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(64) NOT NULL UNIQUE,
      store_id INT NOT NULL,
      product_id INT NOT NULL,
      customer_name VARCHAR(255),
      customer_contact VARCHAR(255) NOT NULL,
      customer_address TEXT,
      quantity INT DEFAULT 1,
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'truemoney',
      voucher_url VARCHAR(500),
      voucher_code VARCHAR(100),
      voucher_amount DECIMAL(10, 2) DEFAULT 0,
      slip_url MEDIUMTEXT NULL,
      payment_status VARCHAR(50) DEFAULT 'pending',
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_store_orders (store_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB;
  `);

  try {
    await db.query("ALTER TABLE orders ADD COLUMN slip_url MEDIUMTEXT NULL AFTER voucher_amount;");
  } catch {
    try {
      await db.query("ALTER TABLE orders MODIFY COLUMN slip_url MEDIUMTEXT NULL;");
    } catch {}
  }
  try {
    await db.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' AFTER slip_url;");
  } catch {}

  // 5. Create wallets table
  await db.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL UNIQUE,
      balance DECIMAL(10, 4) DEFAULT 150.0000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_wallet_store (store_id)
    ) ENGINE=InnoDB;
  `);

  // 6. Create wallet_transactions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      wallet_id INT NOT NULL,
      amount DECIMAL(10, 4) NOT NULL,
      type VARCHAR(50) NOT NULL,
      description VARCHAR(255) NOT NULL,
      reference_id VARCHAR(100),
      slip_url MEDIUMTEXT NULL,
      status VARCHAR(50) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_wt_wallet (wallet_id)
    ) ENGINE=InnoDB;
  `);

  try {
    await db.query("ALTER TABLE wallet_transactions ADD COLUMN slip_url MEDIUMTEXT NULL;");
  } catch {}
  try {
    await db.query("ALTER TABLE wallet_transactions ADD COLUMN status VARCHAR(50) DEFAULT 'completed';");
  } catch {}

  // 7. Create api_keys table
  await db.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      key_name VARCHAR(100) DEFAULT 'Production Master Key',
      api_key VARCHAR(128) NOT NULL UNIQUE,
      rate_limit INT DEFAULT 30,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_used_at TIMESTAMP NULL,
      INDEX idx_key_lookup (api_key, is_active)
    ) ENGINE=InnoDB;
  `);

  // 8. Create api_logs table
  await db.query(`
    CREATE TABLE IF NOT EXISTS api_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      api_key_id INT,
      store_id INT,
      endpoint VARCHAR(255) NOT NULL,
      method VARCHAR(10) NOT NULL,
      ip_address VARCHAR(45),
      status_code INT NOT NULL,
      cost DECIMAL(10, 4) DEFAULT 0.3500,
      response_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_log_rate_limit (api_key_id, created_at)
    ) ENGINE=InnoDB;
  `);

  // 9. Seed mock user u-001
  await db.query(`
    INSERT INTO users (id, name, email, tokens)
    VALUES ('u-001', '3NFM Merchant Owner', 'owner@3nfm.shop', 10)
    ON DUPLICATE KEY UPDATE name = VALUES(name);
  `);

  // 10. Seed store '3nfm'
  const [existing3nfm] = await db.query<any[]>(
    "SELECT id FROM stores WHERE subdomain = '3nfm' LIMIT 1"
  );
  let store3nfmId: number;
  if (!existing3nfm || existing3nfm.length === 0) {
    const [ins3nfm] = await db.query<any>(`
      INSERT INTO stores (
        subdomain, user_id, store_key, name, description, tagline, decorative_text, video_url, banner_url, truemoney_phone, expires_at
      ) VALUES (
        '3nfm',
        'u-001',
        'store-3nfm',
        '3NFM Motorsport Lab',
        'ศูนย์รวมนวัตกรรมชิ้นส่วนยานยนต์และแอโรไดนามิกส์ระดับการแข่งขัน ออกแบบเฉพาะทางเพื่อการขับขี่สมรรถนะสูงสุด',
        'ENGINEERED FOR SUPREMACY',
        '3NFM MOTORSPORT',
        'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80',
        '0812345678',
        DATE_ADD(NOW(), INTERVAL 30 DAY)
      )
    `);
    store3nfmId = ins3nfm.insertId;
  } else {
    store3nfmId = existing3nfm[0].id;
  }

  // 11. Seed store 'apex'
  const [existingApex] = await db.query<any[]>(
    "SELECT id FROM stores WHERE subdomain = 'apex' LIMIT 1"
  );
  let storeApexId: number;
  if (!existingApex || existingApex.length === 0) {
    const [insApex] = await db.query<any>(`
      INSERT INTO stores (
        subdomain, user_id, store_key, name, description, tagline, decorative_text, video_url, banner_url, truemoney_phone, expires_at
      ) VALUES (
        'apex',
        'u-001',
        'store-apex',
        'Apex Performance',
        'ผู้นำด้านอะไหล่และอุปกรณ์ยานยนต์สมรรถนะสูง ออกแบบด้วยมาตรฐานมอเตอร์สปอร์ตเพื่อความเร็วและความแม่นยำสูงสุดในทุกเส้นทาง',
        'DOMINATE EVERY CORNER WITH PRECISION',
        'APEX PERFORMANCE',
        'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
        '0812345678',
        DATE_ADD(NOW(), INTERVAL 30 DAY)
      )
    `);
    storeApexId = insApex.insertId;
  } else {
    storeApexId = existingApex[0].id;
  }

  // 12. Seed products for '3nfm' if empty
  const [prods3nfm] = await db.query<any[]>(
    "SELECT id FROM products WHERE store_id = ? LIMIT 1",
    [store3nfmId]
  );
  if (!prods3nfm || prods3nfm.length === 0) {
    for (const p of THREE_NFM_PRODUCTS) {
      await db.query(
        `INSERT INTO products (store_id, name, description, price, stock, category, is_available, image_url)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        [store3nfmId, p.name, p.description, p.price, p.stock, p.category, p.image_url]
      );
    }
  }

  // 13. Seed products for 'apex' if empty
  const [prodsApex] = await db.query<any[]>(
    "SELECT id FROM products WHERE store_id = ? LIMIT 1",
    [storeApexId]
  );
  if (!prodsApex || prodsApex.length === 0) {
    for (const p of APEX_PRODUCTS) {
      await db.query(
        `INSERT INTO products (store_id, name, description, price, stock, category, is_available, image_url)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        [storeApexId, p.name, p.description, p.price, p.stock, p.category, p.image_url]
      );
    }
  }

  // 14. Seed wallets for both stores if missing
  for (const sid of [store3nfmId, storeApexId]) {
    const [w] = await db.query<any[]>(
      "SELECT id FROM wallets WHERE store_id = ? LIMIT 1",
      [sid]
    );
    if (!w || w.length === 0) {
      await db.query(
        "INSERT INTO wallets (store_id, balance) VALUES (?, 150.0000)",
        [sid]
      );
    }
  }

  // 15. Seed API keys for both stores if missing
  const [key3nfm] = await db.query<any[]>(
    "SELECT id FROM api_keys WHERE store_id = ? LIMIT 1",
    [store3nfmId]
  );
  if (!key3nfm || key3nfm.length === 0) {
    await db.query(
      `INSERT INTO api_keys (store_id, key_name, api_key, rate_limit, is_active)
       VALUES (?, 'Master Production Key', 'sk_live_3nfm_master_key_998877665544332211', 30, 1)`,
      [store3nfmId]
    );
  }

  const [keyApex] = await db.query<any[]>(
    "SELECT id FROM api_keys WHERE store_id = ? LIMIT 1",
    [storeApexId]
  );
  if (!keyApex || keyApex.length === 0) {
    await db.query(
      `INSERT INTO api_keys (store_id, key_name, api_key, rate_limit, is_active)
       VALUES (?, 'Master Production Key', 'sk_live_apex_master_key_112233445566778899', 30, 1)`,
      [storeApexId]
    );
  }

  isSeeded = true;
}

export async function ensureDatabaseSeeded(): Promise<void> {
  if (isSeeded) return;

  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      await runDatabaseSeed();
    } catch (err) {
      console.error("[Auto-Seed Execution Error]:", err);
      seedPromise = null;
      throw err;
    }
  })();

  return seedPromise;
}