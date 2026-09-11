export interface RedeemResult {
  success: boolean;
  voucherCode: string;
  amount?: number;
  ownerName?: string;
  targetPhone?: string;
  message: string;
  code?: string;
  raw?: any;
}

/**
 * สกัด Voucher Code จาก URL ซองของขวัญ TrueMoney หรือข้อความ
 * ตัวอย่าง URL: https://gift.truemoney.com/campaign/?v=abcdef1234567890
 */
export function extractVoucherCode(input: string): string | null {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();

  // 1. ตรวจสอบกรณีเป็น URL เต็ม เช่น https://gift.truemoney.com/campaign/?v=xxxx
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      const v = url.searchParams.get("v");
      if (v) return v.trim();
    }
  } catch {
    // Continue regex matching if URL parsing fails
  }

  // 2. Regex matching สำหรับ parameter ?v= หรือ &v=
  const matchParam = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
  if (matchParam && matchParam[1]) {
    return matchParam[1].trim();
  }

  // 3. Regex matching สำหรับรหัสซอง (alphanumeric ความยาวตั้งแต่ 10 ตัวอักษรขึ้นไป)
  const matchCode = trimmed.match(/^[a-zA-Z0-9_-]{10,60}$/);
  if (matchCode) {
    return matchCode[0].trim();
  }

  // 4. รองรับรหัส Mock / Test ในการทดสอบระบบ
  if (trimmed.toLowerCase().includes("test") || trimmed.toLowerCase().includes("demo") || trimmed.toLowerCase().includes("mock")) {
    return trimmed;
  }

  return null;
}

/**
 * ทำความสะอาดเบอร์โทรศัพท์ให้เหลือเฉพาะตัวเลข 10 หลัก
 */
export function sanitizePhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  return digits;
}

/**
 * ยิงคำขอไปยัง Endpoint ของ TrueMoney เพื่อดึงเงินจากซองอั่งเปาเข้าเบอร์เป้าหมาย
 * Endpoint: https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem
 */
export async function redeemVoucher(
  voucherUrlOrCode: string,
  targetPhone: string
): Promise<RedeemResult> {
  const voucherCode = extractVoucherCode(voucherUrlOrCode);

  if (!voucherCode) {
    return {
      success: false,
      voucherCode: "",
      message: "ลิงก์ซองของขวัญ TrueMoney หรือรหัสซองไม่ถูกต้อง",
      code: "INVALID_VOUCHER_URL",
    };
  }

  const cleanPhone = sanitizePhone(targetPhone);
  if (!cleanPhone || cleanPhone.length !== 10 || !cleanPhone.startsWith("0")) {
    return {
      success: false,
      voucherCode,
      message: "เบอร์โทรศัพท์เป้าหมายไม่ถูกต้อง ต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)",
      code: "INVALID_MOBILE",
    };
  }

  // รองรับ Mock/Sandbox Mode สำหรับการทดสอบ (เมื่อรหัสขึ้นต้นด้วย test_, demo_ หรือมี TEST)
  if (
    voucherCode.toLowerCase().startsWith("test_") ||
    voucherCode.toLowerCase().startsWith("demo_") ||
    voucherCode.toLowerCase().startsWith("mock_") ||
    process.env.MOCK_TRUEMONEY === "true"
  ) {
    // สกัดยอดเงินจำลองถ้ามี เช่น test_voucher_500 หรือ default 100 บาท
    const matchNumber = voucherCode.match(/\d+(\.\d+)?/);
    const mockAmount = matchNumber ? parseFloat(matchNumber[0]) : 100.0;

    return {
      success: true,
      voucherCode,
      amount: mockAmount,
      ownerName: "ผู้ส่งของขวัญ (Sandbox Mode)",
      targetPhone: cleanPhone,
      message: `รับซองของขวัญสำเร็จ (Sandbox): ยอดเงิน ${mockAmount.toFixed(2)} บาท`,
      code: "SUCCESS",
      raw: { is_mock: true },
    };
  }

  try {
    const endpoint = `https://gift.truemoney.com/campaign/vouchers/${encodeURIComponent(voucherCode)}/redeem`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        mobile: cleanPhone,
        voucher_hash: voucherCode,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!data || !data.status) {
      return {
        success: false,
        voucherCode,
        message: "ระบบ TrueMoney ไม่ตอบสนองหรือส่งข้อมูลผิดพลาด",
        code: "TRUE_MONEY_API_ERROR",
        raw: data,
      };
    }

    const statusCode = data.status.code;

    if (statusCode === "SUCCESS") {
      // คำนวณยอดเงินที่ได้รับ
      let receivedAmount = 0;
      if (data.data?.my_ticket?.amount_baht) {
        receivedAmount = parseFloat(data.data.my_ticket.amount_baht);
      } else if (data.data?.voucher?.redeemed_amount_baht) {
        receivedAmount = parseFloat(data.data.voucher.redeemed_amount_baht);
      } else if (data.data?.voucher?.amount_baht) {
        receivedAmount = parseFloat(data.data.voucher.amount_baht);
      }

      const ownerName =
        data.data?.owner_profile?.full_name ||
        data.data?.owner_profile?.name ||
        "ผู้สร้างซองของขวัญ";

      return {
        success: true,
        voucherCode,
        amount: receivedAmount,
        ownerName,
        targetPhone: cleanPhone,
        message: `รับซองของขวัญสำเร็จ ได้รับเงินจำนวน ${receivedAmount.toFixed(2)} บาท`,
        code: "SUCCESS",
        raw: data,
      };
    }

    // จัดการข้อผิดพลาดตาม Code ของ TrueMoney
    const errorMap: Record<string, string> = {
      VOUCHER_OUT_OF_STOCK: "ซองของขวัญนี้ถูกรับเงินไปครบแล้ว (ซองหมด)",
      VOUCHER_EXPIRED: "ซองของขวัญนี้หมดอายุการใช้งานแล้ว (เกิน 72 ชั่วโมง)",
      VOUCHER_NOT_FOUND: "ไม่พบรหัสซองของขวัญนี้ หรือซองอาจถูกยกเลิกแล้ว",
      CANNOT_GET_OWN_VOUCHER: "เบอร์โทรศัพท์เป้าหมายเป็นผู้สร้างซองนี้เอง ไม่สามารถรับซองตนเองได้",
      TARGET_USER_NOT_FOUND: "ไม่พบบัญชี TrueMoney Wallet ของเบอร์โทรศัพท์เป้าหมาย",
      INVALID_MOBILE: "เบอร์โทรศัพท์เป้าหมายไม่ถูกต้องตามเงื่อนไขของ TrueMoney",
      INTERNAL_ERROR: "ระบบ TrueMoney ขัดข้องชั่วคราว โปรดลองใหม่ในภายหลัง",
    };

    const errorMessage = errorMap[statusCode] || data.status.message || "ไม่สามารถรับเงินจากซองของขวัญได้";

    return {
      success: false,
      voucherCode,
      message: errorMessage,
      code: statusCode,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      voucherCode,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ TrueMoney: ${err?.message || "Connection Error"}`,
      code: "NETWORK_ERROR",
    };
  }
}
