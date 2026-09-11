import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { redeemVoucher, extractVoucherCode } from "@/lib/truemoney";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    // 1. รองรับทั้ง JSON และ FormData สำหรับ Vercel Serverless (บันทึกรูปเป็น Data URL ลงฐานข้อมูลโดยตรง)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body.store_id = formData.get("store_id");
      body.product_id = formData.get("product_id");
      body.customer_name = formData.get("customer_name") || "ลูกค้าทั่วไป";
      body.customer_contact = formData.get("customer_contact");
      body.customer_address = formData.get("customer_address") || "";
      body.quantity = formData.get("quantity") || 1;
      body.payment_method = formData.get("payment_method") || "bank_transfer";
      body.voucher_url = formData.get("voucher_url");

      // แปลงไฟล์สลิปจาก FormData เป็น Base64 Data URL โดยตรง (ไม่เขียนลงดิสก์)
      const file = formData.get("slip_file") as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "image/jpeg";
        body.slip_url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else {
        const slipString = formData.get("slip_image") || formData.get("slip_url");
        if (slipString && typeof slipString === "string") {
          body.slip_url = slipString;
        }
      }
    } else {
      body = await req.json().catch(() => ({}));
      
      // รองรับ Base64 Data URL จาก JSON โดยตรง
      if (body.slip_image && typeof body.slip_image === "string") {
        body.slip_url = body.slip_image.startsWith("data:image/")
          ? body.slip_image
          : `data:image/jpeg;base64,${body.slip_image}`;
      }
    }

    const {
      store_id,
      product_id,
      customer_contact,
      customer_name = "ลูกค้าทั่วไป",
      customer_address = "",
      quantity = 1,
      payment_method = "truemoney",
      voucher_url,
      slip_url,
    } = body;

    // 2. ตรวจสอบพารามิเตอร์ที่จำเป็น
    if (!store_id || !product_id || !customer_contact) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ store_id, product_id และข้อมูลติดต่อลูกค้า (customer_contact)",
        },
        { status: 400 }
      );
    }

    const orderQty = Math.max(1, parseInt(quantity, 10) || 1);

    // 3. ตรวจสอบร้านค้า (Store)
    const stores = await query<any[]>(
      "SELECT id, name, truemoney_phone FROM stores WHERE id = ? LIMIT 1",
      [store_id]
    );

    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลร้านค้าในระบบ" },
        { status: 404 }
      );
    }

    const store = stores[0];

    // 4. ตรวจสอบว่าสินค้ามีอยู่จริงและ stock > 0
    const products = await query<any[]>(
      "SELECT id, name, price, stock, is_available FROM products WHERE id = ? AND store_id = ? LIMIT 1",
      [product_id, store_id]
    );

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบสินค้าดังกล่าวในร้านค้านี้" },
        { status: 404 }
      );
    }

    const product = products[0];

    if (!product.is_available) {
      return NextResponse.json(
        { success: false, message: "สินค้านี้ถูกปิดการจำหน่ายชั่วคราว" },
        { status: 400 }
      );
    }

    if (product.stock < orderQty) {
      return NextResponse.json(
        {
          success: false,
          message: `สินค้าคงเหลือไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)`,
        },
        { status: 400 }
      );
    }

    const unitPrice = parseFloat(product.price);
    const totalAmount = unitPrice * orderQty;

    let voucherCode: string | null = null;
    let voucherAmount = 0;
    let orderStatus = "pending";
    let paymentStatus = "pending";

    // 5. กรณีเลือกชำระด้วยซองอั่งเปา TrueMoney
    if (payment_method === "truemoney" || payment_method === "angpao") {
      if (!voucher_url) {
        return NextResponse.json(
          { success: false, message: "กรุณาระบุลิงก์ซองของขวัญ TrueMoney สำหรับชำระเงิน" },
          { status: 400 }
        );
      }

      voucherCode = extractVoucherCode(voucher_url);
      if (!voucherCode) {
        return NextResponse.json(
          { success: false, message: "ลิงก์ซองของขวัญ TrueMoney ไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      // ตรวจสอบว่าซองนี้เคยถูกใช้งานในระบบไปแล้วหรือไม่
      const existingVouchers = await query<any[]>(
        "SELECT id, order_number FROM orders WHERE voucher_code = ? AND status != 'cancelled' LIMIT 1",
        [voucherCode]
      );

      if (existingVouchers && existingVouchers.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `ซองของขวัญนี้ถูกใช้ไปแล้วในคำสั่งซื้อเลขที่ ${existingVouchers[0].order_number}`,
          },
          { status: 400 }
        );
      }

      const targetPhone = store.truemoney_phone || process.env.DEFAULT_TRUEMONEY_PHONE || "0812345678";
      const redeemResult = await redeemVoucher(voucher_url, targetPhone);

      if (!redeemResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: `ชำระเงินไม่สำเร็จ: ${redeemResult.message}`,
            code: redeemResult.code,
          },
          { status: 400 }
        );
      }

      voucherAmount = redeemResult.amount || 0;

      if (voucherAmount >= totalAmount) {
        orderStatus = "paid";
        paymentStatus = "paid";
      } else {
        orderStatus = "pending";
        paymentStatus = "pending";
      }

      // ตัดสต็อกสินค้าทันทีสำหรับคำสั่งซื้อที่จ่ายสำเร็จแล้ว
      await query(
        "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
        [orderQty, product_id]
      );
    } 
    // 6. กรณีเลือกชำระด้วยการโอนเงิน PromptPay และอัปโหลดสลิป
    else if (payment_method === "bank_transfer" || payment_method === "promptpay") {
      if (!slip_url) {
        return NextResponse.json(
          { success: false, message: "กรุณาแนบสลิปหลักฐานการโอนเงินเพื่อยืนยันคำสั่งซื้อ" },
          { status: 400 }
        );
      }

      orderStatus = "pending";
      paymentStatus = "pending";
      // สำหรับสลิปโอนเงิน สต็อกจะถูกตัดเมื่อผู้ดูแลร้านกดยืนยันคำสั่งซื้อ (อนุมัติสลิป)
    }

    // 7. สร้าง Order Number สุ่มไม่ซ้ำ
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    // 8. บันทึกคำสั่งซื้อลงตาราง orders
    const insertSql = `
      INSERT INTO orders (
        order_number,
        store_id,
        product_id,
        customer_name,
        customer_contact,
        customer_address,
        quantity,
        total_amount,
        payment_method,
        voucher_url,
        voucher_code,
        voucher_amount,
        slip_url,
        payment_status,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertResult = await query<any>(insertSql, [
      orderNumber,
      store_id,
      product_id,
      customer_name,
      customer_contact,
      customer_address,
      orderQty,
      totalAmount,
      payment_method,
      voucher_url || null,
      voucherCode || null,
      voucherAmount,
      slip_url || null,
      paymentStatus,
      orderStatus,
    ]);

    return NextResponse.json(
      {
        success: true,
        message:
          payment_method === "bank_transfer" || payment_method === "promptpay"
            ? "แจ้งชำระเงินและบันทึกคำสั่งซื้อเรียบร้อยแล้ว เจ้าของร้านจะตรวจสอบสลิปของท่าน"
            : orderStatus === "paid"
            ? "ชำระเงินและสร้างคำสั่งซื้อสำเร็จ"
            : "สร้างคำสั่งซื้อเรียบร้อยแล้ว",
        order: {
          id: insertResult.insertId,
          order_number: orderNumber,
          store_id,
          product_id,
          product_name: product.name,
          quantity: orderQty,
          total_amount: totalAmount,
          payment_method,
          slip_url: slip_url || null,
          payment_status: paymentStatus,
          status: orderStatus,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Orders API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดภายในระบบ: ${error?.message || "Internal Server Error"}`,
      },
      { status: 500 }
    );
  }
}
