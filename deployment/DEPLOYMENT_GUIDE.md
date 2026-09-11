# คู่มือการนำขึ้นระบบจริง (Deployment Guide)

คู่มือนี้สรุปขั้นตอนการนำระบบ **FeelFeel Multi-tenant SaaS** ขึ้นสู่เซิร์ฟเวอร์จริง รองรับทั้ง **Cloud VPS (Oracle Cloud Always Free + Nginx + PM2)** และ **Serverless (Vercel + Neon DB PostgreSQL)**

---

## ตัวเลือกที่ 1: Deploy บน Oracle Cloud Always Free (Ubuntu + Nginx + PM2)

ตัวเลือกนี้เหมาะที่สุดสำหรับระบบ Multi-tenant ที่ต้องการจัดการ Wildcard Reverse Proxy และ Subdomain แบบเต็มประสิทธิภาพ โดยใช้สเปกฟรีสูงสุดถึง **4 OCPU, RAM 24 GB**

### ขั้นตอนที่ 1: สมัครและสร้าง Instance บน Oracle Cloud
1. สมัครบัญชี [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) (ยืนยันบัตรเดบิต/เครดิต)
2. ไปที่ **Compute > Instances > Create Instance**
3. เลือก Image: **Ubuntu 22.04 LTS** หรือ **24.04 LTS**
4. เลือก Shape: **Ampere (ARM) VM.Standard.A1.Flex** (เลือก 2-4 OCPU, RAM 12-24 GB)
5. ดาวน์โหลดไฟล์ SSH Key (`private.key`) เก็บไว้
6. ในส่วน **VCN Security List** เปิด Ingress Rules ให้พอร์ต:
   - `22` (SSH)
   - `80` (HTTP)
   - `443` (HTTPS)
   - `3000` (Optional / Next.js)

### ขั้นตอนที่ 2: ตั้งค่า DNS ชี้โดเมนแบบ Wildcard (เช่น บน Cloudflare)
1. เพิ่ม **A Record**:
   - Name: `@` -> Value: `[IP ของ Oracle Cloud]`
2. เพิ่ม **Wildcard A Record**:
   - Name: `*` -> Value: `[IP ของ Oracle Cloud]`
   *(หากใช้ Cloudflare ให้เปิดโหมด DNS Only สีเทาในช่วงแรกเพื่อขอ SSL)*

### ขั้นตอนที่ 3: ติดตั้ง Environment บน Ubuntu Server
เชื่อมต่อผ่าน SSH เข้าสู่เซิร์ฟเวอร์:
```bash
ssh -i private.key ubuntu@<YOUR_SERVER_IP>
```

รันคำสั่งอัปเดตระบบและติดตั้ง Node.js, Nginx, Git, PM2:
```bash
# 1. Update package lists
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 LTS & Build Essentials
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# 3. Install PM2 globally
sudo npm install -g pm2
```

### ขั้นตอนที่ 4: Clone โปรเจกต์และ Build
```bash
# Clone source code
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/roxy061/feel-feel.git feel-feel-saas
cd feel-feel-saas

# ติดตั้ง Dependencies & Setup DB
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js

# Build สำหรับ Production
npm run build
```

### ขั้นตอนที่ 5: ตั้งค่า PM2 ให้รันเบื้องหลังตลอดเวลา
```bash
# สั่งรันผ่าน ecosystem config
pm2 start deployment/ecosystem.config.js

# บันทึกสถานะให้เริ่มทำงานใหม่อัตโนมัติเมื่อเซิร์ฟเวอร์ Reboot
pm2 save
pm2 startup
# (คัดลอกคำสั่งที่ PM2 แนะนำมารัน 1 ครั้ง)
```

### ขั้นตอนที่ 6: ติดตั้ง Nginx และ Wildcard SSL
1. คัดลอกคอนฟิก Nginx:
```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/feel-feel-saas
# แก้ไข yourdomain.com เป็นโดเมนจริงของคุณ
sudo nano /etc/nginx/sites-available/feel-feel-saas
```
2. สั่ง Enable Site:
```bash
sudo ln -s /etc/nginx/sites-available/feel-feel-saas /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```
3. ขอ Wildcard SSL Certificate ด้วย Certbot:
```bash
sudo certbot certonly --manual --preferred-challenges dns -d "yourdomain.com" -d "*.yourdomain.com"
```
*(ทำตามคำแนะนำโดยเพิ่ม TXT Record บน Cloudflare/DNS provider จากนั้น Nginx จะโหลด SSL อัตโนมัติ)*

---

## ตัวเลือกที่ 2: Deploy บน Vercel + Neon DB (Serverless Flow)

ตัวเลือกนี้เหมาะสำหรับการเปิดตัวอย่างรวดเร็วโดยไม่ต้องดูแลรักษาเซิร์ฟเวอร์

### ขั้นตอนที่ 1: สร้างฐานข้อมูล PostgreSQL ออนไลน์ (Neon DB)
1. สมัครใช้งาน [Neon.tech](https://neon.tech)
2. สร้าง Project ใหม่ และคัดลอก **Connection String (Pooled)** เช่น:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. ในไฟล์ `prisma/schema.prisma` เปลี่ยน datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. รันคำสั่ง push schema ขึ้น Neon:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

### ขั้นตอนที่ 2: Push โค้ดขึ้น GitHub
```bash
git add .
git commit -m "feat: complete multi-tenant saas platform"
git push origin main
```

### ขั้นตอนที่ 3: เชื่อมต่อและ Deploy บน Vercel
1. ไปที่ [Vercel Dashboard](https://vercel.com)
2. กด **Add New Project** แล้วเลือก Repository `feel-feel`
3. ในหมวด **Environment Variables** เพิ่ม:
   - `DATABASE_URL`: `[Connection String จาก Neon DB]`
   - `NEXT_PUBLIC_ROOT_DOMAIN`: `yourdomain.com` (หรือ vercel.app domain)
4. กดปุ่ม **Deploy**
5. ในแท็บ **Settings > Domains**:
   - เพิ่ม `yourdomain.com`
   - เพิ่ม `*.yourdomain.com` (Wildcard Domain)

---

## ตัวอย่างการเรียกใช้งาน API Gateway แบบ Pay-per-Use (0.35฿)

เมื่อ Deploy เสร็จแล้ว ลูกค้าหรือร้านค้าสามารถเรียกใช้ API ผ่าน Header `x-api-key`:

```bash
# 1. ดึงรายการสินค้าของร้านค้า
curl -X GET https://yourdomain.com/api/v1/store/products \
  -H "x-api-key: sk_live_tech9876543210abcdef123456"

# 2. เรียกใช้ AI Copywriter ภาษาไทย
curl -X POST https://yourdomain.com/api/v1/tools/ai-copywriter \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_tech9876543210abcdef123456" \
  -d '{
    "productName": "กล้องแอคชั่น 4K กันน้ำ",
    "category": "Gadgets",
    "highlights": "กันน้ำ 30 เมตร ระบบกันสั่น 6 แกน แบตเตอรี่ถ่ายต่อเนื่อง 2 ชม."
  }'

# 3. เรียกตรวจสลิปโอนเงิน PromptPay
curl -X POST https://yourdomain.com/api/v1/tools/slip-verify \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_tech9876543210abcdef123456" \
  -d '{
    "slipUrl": "https://example.com/slip.jpg",
    "expectedAmount": 2490
  }'
```
