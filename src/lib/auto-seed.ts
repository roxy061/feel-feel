import { db } from "@/lib/db";

let isSeeded = false;
let seedPromise: Promise<void> | null = null;

const APEX_PRODUCTS = [
  {
    name: "Apex Carbon Fiber Aero Wing V2",
    description: "สปอยเลอร์คาร์บอนไฟเบอร์แท้ 100% เพิ่มแรงกด Downforce 35% พร้อมขายึดไทเทเนียม CNC น้ำหนักเบาพิเศษ",
    price: 24900.0,
    stock: 5,
    category: "Aerodynamics",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Monoblock 6-Pot Brake Caliper Set",
    description: "ชุดเบรกคาลิปเปอร์อะลูมิเนียมหล่อชิ้นเดียว ทนความร้อนสูงพิเศษ 800°C ตอบสนองระยะเบรกแม่นยำฉับไว",
    price: 48500.0,
    stock: 3,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Forged Titanium Exhaust System",
    description: "ระบบท่อไอเสียไทเทเนียมเกรดอากาศยาน น้ำหนักเบากว่าของเดิม 60% เสียงกระหึ่มเร้าใจแบบมอเตอร์สปอร์ต",
    price: 38900.0,
    stock: 8,
    category: "Exhaust",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Full Adjustable Coilover Suspension",
    description: "โช้คอัพสตรัทปรับเกลียว 32 ระดับ ซับแรงกระแทกและควบคุมเสถียรภาพตัวถังได้อย่างเฉียบคมในโค้ง",
    price: 32000.0,
    stock: 12,
    category: "Suspension",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Forged Monoblock Wheels 19-inch",
    description: "ล้อแม็กฟอร์จน้ำหนักเบาพิเศษ แข็งแกร่งทนทานรับแรงบิดมหาศาล สไตล์ Racing Concave",
    price: 56000.0,
    stock: 4,
    category: "Wheels",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Motorsport ECU Tuning Module",
    description: "กล่องเพิ่มแรงม้าและแรงบิดระดับแข่งขัน ปรับจูนกราฟอัตราเร่งและรอบเครื่องอย่างมีประสิทธิภาพ",
    price: 18500.0,
    stock: 15,
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
  },
];

const THREE_NFM_PRODUCTS = [
  {
    name: "3NFM Stage-3 Carbon Intake Plenum",
    description: "ท่อร่วมไอดีคาร์บอนไฟเบอร์เกรดแห้งแบบ Dry Carbon เพิ่มปริมาตรการไหลเวียนของไอดี 45% ทนความร้อนสูง",
    price: 36500.0,
    stock: 6,
    category: "Intake System",
    image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "3NFM Titanium Valvetronic Race Exhaust",
    description: "ระบบท่อไอเสียไทเทเนียมพร้อมวาล์วไฟฟ้าเปิด-ปิดเสียงอัตโนมัติตามรอบเครื่องยนต์ ลดน้ำหนักตัวถังลง 14.5 กก.",
    price: 49000.0,
    stock: 4,
    category: "Exhaust System",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Forged Carbon GT Rear Wing 1600mm",
    description: "วิงหลังคาร์บอนลายฟอร์จแท้ ปรับมุมองศาการรับลมได้ 4 ระดับ ขาจับอะลูมิเนียมเกรดอากาศยาน 7075",
    price: 28500.0,
    stock: 8,
    category: "Aerodynamics",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "3NFM Competition Inverted Coilover Kit",
    description: "โช้คอัพหัวกลับระดับการแข่งขัน ปรับหนืด Bump/Rebound แยกอิสระ 2-Way สปริงนำเข้าจากเยอรมนี",
    price: 42000.0,
    stock: 10,
    category: "Suspension",
    image_url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ceramic-Carbon Monoblock Brake Rotor 380mm",
    description: "จานเบรกเซรามิกคาร์บอนน้ำหนักเบาพิเศษ ทนอุณหภูมิสนามแข่งได้ถึง 1,000°C โดยไม่มีอาการเบรกเฟด",
    price: 58000.0,
    stock: 3,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Full Standalone Motorsport ECU V3",
    description: "กล่องควบคุมเครื่องยนต์อัจฉริยะ รองรับระบบ Launch Control, Flat Shift, Anti-Lag และการเชื่อมต่อ CAN-Bus",
    price: 26000.0,
    stock: 12,
    category: "Engine Management",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
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
    await db.query("ALTER TABLE stores ADD COLUMN expires_at DATETIME DEFAULT NULL AFTER truemoney_phone;");
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