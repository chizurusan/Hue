import crypto from "crypto";

// ─── Config ──────────────────────────────────────────────────────────────────
export function getVnpayConfig() {
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    tmnCode:    (process.env.VNPAY_TMN_CODE    || "DEMOVNPA").trim(),
    hashSecret: (process.env.VNPAY_HASH_SECRET || "SECRETDEMO").trim(),
    url:        (process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html").trim(),
    // Luôn tính từ APP_URL — dotenv KHÔNG interpolate ${VAR} trong .env
    returnUrl:  `${appUrl}/api/vnpay/return`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hmacSha512(key: string, data: string): string {
  return crypto.createHmac("sha512", key).update(Buffer.from(data, "utf-8")).digest("hex");
}

function formatVnDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  // VNPay dùng giờ Việt Nam UTC+7
  const vn = new Date(date.getTime() + 7 * 3600 * 1000);
  return (
    vn.getUTCFullYear() +
    pad(vn.getUTCMonth() + 1) +
    pad(vn.getUTCDate()) +
    pad(vn.getUTCHours()) +
    pad(vn.getUTCMinutes()) +
    pad(vn.getUTCSeconds())
  );
}

/**
 * Đúng theo official VNPay Node.js sample:
 *   1. encodeURIComponent mỗi key → sort → decode lại làm key thật
 *   2. encodeURIComponent mỗi value, replace %20 → "+"
 * Sau đó stringify với { encode: false } (qs) = join bằng &k=v không encode thêm
 */
function sortAndEncode(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const encodedKeys = Object.keys(obj).map((k) => encodeURIComponent(k));
  encodedKeys.sort();
  for (const ek of encodedKeys) {
    const k = decodeURIComponent(ek);
    sorted[k] = encodeURIComponent(obj[k]).replace(/%20/g, "+");
  }
  return sorted;
}

function toQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

// ─── Create Payment URL ───────────────────────────────────────────────────────
export interface CreatePaymentParams {
  orderId: string;
  amount: number;      // VND (function tự ×100)
  orderInfo: string;
  ipAddr: string;
  locale?: "vn" | "en";
  bankCode?: string;
}

export function createPaymentUrl(params: CreatePaymentParams): string {
  const cfg = getVnpayConfig();
  const now = new Date();
  const expire = new Date(now.getTime() + 15 * 60 * 1000);

  const raw: Record<string, string> = {
    vnp_Version:    "2.1.0",
    vnp_Command:    "pay",
    vnp_TmnCode:    cfg.tmnCode,
    vnp_Locale:     params.locale || "vn",
    vnp_CurrCode:   "VND",
    vnp_TxnRef:     params.orderId,
    vnp_OrderInfo:  params.orderInfo.substring(0, 255),
    vnp_OrderType:  "other",
    vnp_Amount:     String(Math.round(params.amount) * 100),
    vnp_ReturnUrl:  cfg.returnUrl,
    vnp_IpAddr:     params.ipAddr,
    vnp_CreateDate: formatVnDate(now),
    vnp_ExpireDate: formatVnDate(expire),
  };

  if (params.bankCode) raw.vnp_BankCode = params.bankCode;

  // Bước 1: sort + encode values (chuẩn VNPay official sample)
  const sorted = sortAndEncode(raw);

  // Bước 2: ký trên chuỗi đã encode
  const signData = toQueryString(sorted);
  const secureHash = hmacSha512(cfg.hashSecret, signData);

  // Bước 3: thêm chữ ký rồi build URL (không encode lại)
  const queryStr = toQueryString(sorted) + `&vnp_SecureHash=${secureHash}`;

  console.log("[VNPay CREATE] TmnCode  :", cfg.tmnCode);
  console.log("[VNPay CREATE] ReturnUrl:", cfg.returnUrl);
  console.log("[VNPay CREATE] SignData :", signData);
  console.log("[VNPay CREATE] Hash     :", secureHash);

  return `${cfg.url}?${queryStr}`;
}

// ─── Verify Return / IPN ─────────────────────────────────────────────────────
export interface VnpayReturnParams {
  vnp_Amount:             string;
  vnp_BankCode?:          string;
  vnp_BankTranNo?:        string;
  vnp_CardType?:          string;
  vnp_OrderInfo:          string;
  vnp_PayDate?:           string;
  vnp_ResponseCode:       string;
  vnp_TmnCode:            string;
  vnp_TransactionNo:      string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef:             string;
  vnp_SecureHash:         string;
  [key: string]: string | undefined;
}

export function verifyReturnUrl(query: VnpayReturnParams): {
  isValid: boolean;
  isSuccess: boolean;
} {
  const cfg = getVnpayConfig();
  const receivedHash = query.vnp_SecureHash;

  // Lấy params, bỏ vnp_SecureHash và vnp_SecureHashType
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (k === "vnp_SecureHash" || k === "vnp_SecureHashType") continue;
    if (v === undefined || v === "") continue;
    raw[k] = v;
  }

  // Cùng chuẩn sort+encode như khi tạo URL
  const sorted = sortAndEncode(raw);
  const signData = toQueryString(sorted);
  const expectedHash = hmacSha512(cfg.hashSecret, signData);

  console.log("[VNPay VERIFY] SignData :", signData);
  console.log("[VNPay VERIFY] Expected :", expectedHash);
  console.log("[VNPay VERIFY] Received :", receivedHash);

  const isValid = expectedHash === receivedHash;
  const isSuccess = isValid && query.vnp_ResponseCode === "00";
  return { isValid, isSuccess };
}

// ─── Response Code Map ───────────────────────────────────────────────────────
export const VNP_RESPONSE_CODES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Giao dịch bị nghi ngờ (lừa đảo)",
  "09": "Thẻ/Tài khoản chưa đăng ký InternetBanking",
  "10": "Xác thực sai quá 3 lần",
  "11": "Đã hết hạn chờ thanh toán",
  "12": "Thẻ/Tài khoản bị khóa",
  "13": "Sai mật khẩu OTP",
  "24": "Khách hàng hủy giao dịch",
  "51": "Tài khoản không đủ số dư",
  "65": "Vượt quá hạn mức giao dịch trong ngày",
  "75": "Ngân hàng đang bảo trì",
  "79": "Nhập sai mật khẩu quá số lần quy định",
  "99": "Lỗi không xác định",
};
