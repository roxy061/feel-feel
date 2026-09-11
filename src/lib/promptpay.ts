import QRCode from "qrcode";

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const hex = crc.toString(16).toUpperCase();
  return hex.padStart(4, "0");
}

function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean target: phone or citizen ID
  const cleaned = target.replace(/[^0-9]/g, "");
  let formattedTarget = "";

  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    // Phone number: convert 08x to 00668x
    formattedTarget = "0066" + cleaned.substring(1);
    formattedTarget = formattedTarget.padStart(13, "0");
  } else if (cleaned.length === 13) {
    // Thai National ID
    formattedTarget = cleaned;
  } else {
    // Fallback or e-wallet
    formattedTarget = cleaned;
  }

  // Tag 29: Merchant Account Info
  const sub00 = formatTag("00", "A000000677010111");
  const sub01 = formatTag("01", formattedTarget);
  const tag29 = formatTag("29", `${sub00}${sub01}`);

  let payload = "";
  payload += formatTag("00", "01"); // Format indicator
  payload += formatTag("01", amount ? "12" : "11"); // 12 = Dynamic with amount, 11 = Static
  payload += tag29;
  payload += formatTag("53", "764"); // Currency THB
  if (amount !== undefined && amount > 0) {
    payload += formatTag("54", amount.toFixed(2));
  }
  payload += formatTag("58", "TH"); // Country Code

  // Tag 63: Checksum placeholder
  const rawDataForChecksum = `${payload}6304`;
  const checksum = crc16(rawDataForChecksum);

  return `${rawDataForChecksum}${checksum}`;
}

export async function generatePromptPayQR(target: string, amount?: number): Promise<string> {
  const payload = generatePromptPayPayload(target, amount);
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
