const mysql = require("mysql2/promise");

async function initDb() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
    });

    console.log("Connected to MySQL server.");

    // Create database if not exists
    await conn.query("CREATE DATABASE IF NOT EXISTS `3nfm_saas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await conn.query("USE `3nfm_saas`;");

    // 1. Create/alter stores table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subdomain VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        tagline VARCHAR(255) DEFAULT 'DOMINATE EVERY CORNER WITH PRECISION',
        decorative_text VARCHAR(255) DEFAULT 'APEX PERFORMANCE',
        video_url VARCHAR(500) DEFAULT 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4',
        banner_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
        truemoney_phone VARCHAR(20) DEFAULT '0812345678',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Ensure truemoney_phone column exists if stores table was already created
    try {
      await conn.query("ALTER TABLE stores ADD COLUMN truemoney_phone VARCHAR(20) DEFAULT '0812345678' AFTER banner_url;");
    } catch (e) {
      // Column may already exist
    }

    // 2. Create products table
    await conn.query(`
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

    // 3. Create orders table
    await conn.query(`
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
        status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_store_orders (store_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB;
    `);

    // 4. Create wallets table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL UNIQUE,
        balance DECIMAL(10, 4) DEFAULT 100.0000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_wallet_store (store_id)
      ) ENGINE=InnoDB;
    `);

    // 5. Create wallet_transactions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_id INT NOT NULL,
        amount DECIMAL(10, 4) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description VARCHAR(255) NOT NULL,
        reference_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wt_wallet (wallet_id)
      ) ENGINE=InnoDB;
    `);

    // 6. Create api_keys table
    await conn.query(`
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

    // 7. Create api_logs table
    await conn.query(`
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

    // Seed Apex Performance store
    const [existingApex] = await conn.query("SELECT * FROM stores WHERE subdomain = ?", ["apex"]);
    let apexId;
    if (existingApex.length === 0) {
      const [res] = await conn.query(`
        INSERT INTO stores (subdomain, name, description, tagline, decorative_text, video_url, banner_url, truemoney_phone)
        VALUES (
          'apex',
          'Apex Performance',
          'ผู้นำด้านอะไหล่และอุปกรณ์ยานยนต์สมรรถนะสูง ออกแบบด้วยมาตรฐานมอเตอร์สปอร์ตเพื่อความเร็วและความแม่นยำสูงสุดในทุกเส้นทาง',
          'DOMINATE EVERY CORNER WITH PRECISION',
          'APEX MOTORSPORT',
          'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
          '0812345678'
        )
      `);
      apexId = res.insertId;
      console.log("Created Apex store with ID:", apexId);
    } else {
      apexId = existingApex[0].id;
      console.log("Apex store already exists with ID:", apexId);
    }

    // Seed Apex Wallet if none
    const [apexWallet] = await conn.query("SELECT * FROM wallets WHERE store_id = ?", [apexId]);
    let walletId;
    if (apexWallet.length === 0) {
      const [wRes] = await conn.query(`
        INSERT INTO wallets (store_id, balance) VALUES (${apexId}, 150.0000)
      `);
      walletId = wRes.insertId;
      console.log("Created wallet for Apex with 150.00 THB initial balance.");
    } else {
      walletId = apexWallet[0].id;
    }

    // Seed Apex API Key if none
    const [apexApiKey] = await conn.query("SELECT * FROM api_keys WHERE store_id = ?", [apexId]);
    if (apexApiKey.length === 0) {
      await conn.query(`
        INSERT INTO api_keys (store_id, key_name, api_key, rate_limit, is_active)
        VALUES (${apexId}, 'Master Production Key', 'sk_live_3nfm_apex_987654321', 30, 1)
      `);
      console.log("Created API Key for Apex: sk_live_3nfm_apex_987654321");
    }

    // Seed Apex products if empty
    const [apexProducts] = await conn.query("SELECT id FROM products WHERE store_id = ?", [apexId]);
    if (apexProducts.length === 0) {
      await conn.query(`
        INSERT INTO products (store_id, name, description, price, stock, category, is_available, image_url)
        VALUES
        (${apexId}, 'Apex Carbon Fiber Aero Wing V2', 'สปอยเลอร์คาร์บอนไฟเบอร์แท้ 100% เพิ่มแรงกด Downforce 35% พร้อมขายึดไทเทเนียม CNC น้ำหนักเบาพิเศษ', 24900.00, 5, 'Aerodynamics', 1, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'),
        (${apexId}, 'Monoblock 6-Pot Brake Caliper Set', 'ชุดเบรกคาลิปเปอร์อะลูมิเนียมหล่อชิ้นเดียว ทนความร้อนสูงพิเศษ 800°C ตอบสนองระยะเบรกแม่นยำฉับไว', 48500.00, 3, 'Braking System', 1, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80'),
        (${apexId}, 'Forged Titanium Exhaust System', 'ระบบท่อไอเสียไทเทเนียมเกรดอากาศยาน น้ำหนักเบากว่าของเดิม 60% เสียงกระหึ่มเร้าใจแบบมอเตอร์สปอร์ต', 38900.00, 8, 'Exhaust', 1, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'),
        (${apexId}, 'Full Adjustable Coilover Suspension', 'โช้คอัพสตรัทปรับเกลียว 32 ระดับ ซับแรงกระแทกและควบคุมเสถียรภาพตัวถังได้อย่างเฉียบคมในโค้ง', 32000.00, 12, 'Suspension', 1, 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'),
        (${apexId}, 'Forged Monoblock Wheels 19-inch', 'ล้อแม็กฟอร์จน้ำหนักเบาพิเศษ แข็งแกร่งทนทานรับแรงบิดมหาศาล สไตล์ Racing Concave', 56000.00, 4, 'Wheels', 1, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'),
        (${apexId}, 'Motorsport ECU Tuning Module', 'กล่องเพิ่มแรงม้าและแรงบิดระดับแข่งขัน ปรับจูนกราฟอัตราเร่งและรอบเครื่องอย่างมีประสิทธิภาพ', 18500.00, 15, 'Electronics', 1, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80')
      `);
      console.log("Seeded 6 high-performance automotive products for Apex!");
    }

    console.log("All tables (stores, products, orders, wallets, wallet_transactions, api_keys, api_logs) initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    if (conn) await conn.end();
  }
}

initDb();
