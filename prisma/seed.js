const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Multi-tenant SaaS Database...");

  // Clean old data
  await prisma.apiUsageLog.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.store.deleteMany({});

  // 1. Tenant: TechStore Gadgets
  const techExpire = new Date();
  techExpire.setDate(techExpire.getDate() + 28); // 28 days left

  const techStore = await prisma.store.create({
    data: {
      subdomain: "techstore",
      name: "TechStore Gadgets & IT",
      description: "ศูนย์รวมแกดเจ็ต ไอที และอุปกรณ์อัจฉริยะ คุณภาพพรีเมียม",
      logoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      primaryColor: "#2563eb", // Blue
      promptpayNumber: "0819998877",
      promptpayName: "นายเทค สโตร์ (TechStore)",
      status: "ACTIVE",
      expireAt: techExpire,
      tokenBalance: 2,
      wallet: {
        create: {
          balance: 250.5,
          transactions: {
            create: [
              {
                amount: 300,
                type: "TOPUP",
                description: "เติมเงินกระเป๋าผ่าน PromptPay QR",
                reference: "TXN-TOPUP-001",
              },
              {
                amount: -49.5,
                type: "API_DEDUCTION",
                description: "ค่าบริการเรียกใช้งาน API (141 ครั้ง)",
                reference: "API-BATCH-001",
              },
            ],
          },
        },
      },
      apiKeys: {
        create: [
          {
            name: "Production App Key",
            keyPrefix: "sk_live_tech987",
            keyHash: "sk_live_tech9876543210abcdef123456",
            rateLimit: 60,
            isActive: true,
          },
        ],
      },
      products: {
        create: [
          {
            name: "Wireless ANC Pro Headphones",
            description: "หูฟังตัดเสียงรบกวนอัจฉริยะ เสียงเบสแน่น แบตเตอรี่อึด 40 ชั่วโมง รองรับ Bluetooth 5.3",
            price: 2490,
            stock: 18,
            category: "Audio",
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
          },
          {
            name: "Smart Watch Ultra 2 Titanium",
            description: "สมาร์ตวอทช์ตรวจวัดสุขภาพ GPS คู่ รองรับการดำน้ำ แบตเตอรี่ใช้งานได้ยาวนาน 7 วัน",
            price: 4890,
            stock: 9,
            category: "Wearables",
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
          },
          {
            name: "Mechanical Wireless Keyboard RGB",
            description: "คีย์บอร์ดแมคคานิคอลไร้สาย Hot-swappable Red Switch แสงไฟ RGB 16.8 ล้านสี",
            price: 1890,
            stock: 25,
            category: "Accessories",
            imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
          },
          {
            name: "Magnetic 15W Fast Wireless Charger",
            description: "แท่นชาร์จไร้สายแม่เหล็ก ชาร์จเร็ว ป้องกันความร้อนเกิน พกพาสะดวก",
            price: 690,
            stock: 40,
            category: "Accessories",
            imageUrl: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  // Sample order for TechStore
  const techProd1 = await prisma.product.findFirst({ where: { storeId: techStore.id } });
  if (techProd1) {
    await prisma.order.create({
      data: {
        storeId: techStore.id,
        orderNumber: "ORD-TECH-1001",
        customerName: "สมชาย วงศ์สวัสดิ์",
        customerPhone: "0891234567",
        customerAddress: "99/1 ถ.สุขุมวิท คลองเตย กทม. 10110",
        totalAmount: 2490,
        status: "PAID",
        paymentMethod: "PROMPTPAY",
        slipUrl: "https://placehold.co/400x600/2563eb/ffffff?text=PromptPay+Slip+2490THB",
        slipRef: "SLIP-202609-8812",
        items: {
          create: [
            {
              productId: techProd1.id,
              productName: techProd1.name,
              price: techProd1.price,
              quantity: 1,
            },
          ],
        },
      },
    });
  }

  // 2. Tenant: FashionHub Clothing
  const fashionExpire = new Date();
  fashionExpire.setDate(fashionExpire.getDate() + 15); // 15 days left

  const fashionStore = await prisma.store.create({
    data: {
      subdomain: "fashionhub",
      name: "FashionHub Minimal Style",
      description: "เสื้อผ้าแฟชั่นสไตล์มินิมอล ดีไซน์เรียบหรู ใส่สบายในทุกโอกาส",
      logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80",
      primaryColor: "#db2777", // Pink / Rose
      promptpayNumber: "0951112233",
      promptpayName: "นางสาวแฟชั่น ฮับ",
      status: "ACTIVE",
      expireAt: fashionExpire,
      tokenBalance: 1,
      wallet: {
        create: {
          balance: 85.0,
          transactions: {
            create: [
              {
                amount: 100,
                type: "TOPUP",
                description: "เปิดกระเป๋าเงินและทดลองใช้งาน API",
                reference: "TXN-TOPUP-FASHION",
              },
              {
                amount: -15.0,
                type: "API_DEDUCTION",
                description: "ค่าบริการเรียกใช้ AI Copywriting API",
                reference: "API-BATCH-FASHION",
              },
            ],
          },
        },
      },
      apiKeys: {
        create: [
          {
            name: "FashionHub Bot Key",
            keyPrefix: "sk_live_fash456",
            keyHash: "sk_live_fash4567890123abcdef987654",
            rateLimit: 30,
            isActive: true,
          },
        ],
      },
      products: {
        create: [
          {
            name: "Oversized Cotton Minimal T-Shirt",
            description: "เสื้อยืดทรงโอเวอร์ไซส์ ผลิตจากผ้าฝ้ายพรีเมียม 100% ระบายอากาศดีเลิศ ไม่ยับง่าย",
            price: 490,
            stock: 35,
            category: "Tops",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
          },
          {
            name: "Classic Linen Relaxed Pants",
            description: "กางเกงลินินขายาวทรงหลวม ใส่สบาย คล่องตัว เหมาะกับทั้งวันทำงานและวันพักผ่อน",
            price: 890,
            stock: 20,
            category: "Bottoms",
            imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
          },
          {
            name: "Vintage Canvas Crossbody Bag",
            description: "กระเป๋าสะพายข้างผ้าแคนวาสสไตล์วินเทจ จุของได้เยอะ ทนทาน",
            price: 590,
            stock: 15,
            category: "Bags",
            imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  // Seed sample API Logs for TechStore
  const techKey = await prisma.apiKey.findFirst({ where: { storeId: techStore.id } });
  if (techKey) {
    await prisma.apiUsageLog.createMany({
      data: [
        {
          storeId: techStore.id,
          apiKeyId: techKey.id,
          endpoint: "/api/v1/store/products",
          method: "GET",
          statusCode: 200,
          latencyMs: 38,
          cost: 0.35,
          ipAddress: "127.0.0.1",
        },
        {
          storeId: techStore.id,
          apiKeyId: techKey.id,
          endpoint: "/api/v1/tools/slip-verify",
          method: "POST",
          statusCode: 200,
          latencyMs: 142,
          cost: 0.35,
          ipAddress: "127.0.0.1",
        },
        {
          storeId: techStore.id,
          apiKeyId: techKey.id,
          endpoint: "/api/v1/tools/ai-copywriter",
          method: "POST",
          statusCode: 200,
          latencyMs: 285,
          cost: 0.35,
          ipAddress: "127.0.0.1",
        },
      ],
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`- TechStore: ID ${techStore.id}, Subdomain: techstore, API Key: sk_live_tech9876543210abcdef123456`);
  console.log(`- FashionHub: ID ${fashionStore.id}, Subdomain: fashionhub, API Key: sk_live_fash4567890123abcdef987654`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
