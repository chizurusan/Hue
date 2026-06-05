import nodemailer from "nodemailer";
import type { Order } from "../src/types";

const BRAND_PURPLE = "#5C3B53";
const BRAND_GOLD   = "#B88A55";

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendMail(to: string, subject: string, html: string): Promise<{ success: boolean; reason?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Mail] SMTP_USER / SMTP_PASS not configured — skipping email.");
    return { success: false, reason: "SMTP not configured" };
  }
  try {
    const from = `"Huegifts ❀ Quà tặng Cố đô" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({ from, to, subject, html });
    return { success: true };
  } catch (err: any) {
    console.error("[Mail] Failed:", err.message);
    return { success: false, reason: err.message };
  }
}

// ─── Shared Layout ────────────────────────────────────────────────────────────
function layout(bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Huegifts</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F1EB;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F1EB;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#FEFCF8;border:1px solid #E2DCD5;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_PURPLE} 0%,#7B4F72 100%);padding:32px 24px;text-align:center;border-bottom:4px solid ${BRAND_GOLD};">
              <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:4px;font-family:Georgia,serif;">❀ HUEGIFTS ❀</h1>
              <p style="color:#E8DCC4;margin:6px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Mang một miền thương về nhà</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#1C1715;padding:20px 24px;text-align:center;border-top:1px solid #3A2F2B;">
              <p style="margin:0 0 6px;color:#B8A99A;font-size:12px;">© 2026 Huegifts — Sản vật cố đô xứ Huế</p>
              <p style="margin:0;color:#7A6B62;font-size:11px;">
                Zalo / ĐT: <a href="tel:0977047908" style="color:${BRAND_GOLD};text-decoration:none;">0977 047 908</a>
                &nbsp;|&nbsp;
                Email: <a href="mailto:huegifts@gmail.com" style="color:${BRAND_GOLD};text-decoration:none;">huegifts@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function fmt(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function statusBadge(status: Order["status"]): string {
  const map: Record<string, { label: string; color: string }> = {
    confirmed:       { label: "Đã xác nhận",        color: "#2C8E40" },
    pending_payment: { label: "Chờ thanh toán",      color: "#C07C2E" },
    packing:         { label: "Đang đóng gói",       color: BRAND_PURPLE },
    shipping:        { label: "Đang giao hàng",      color: "#1A6CB5" },
    delivered:       { label: "Đã giao thành công",  color: "#2C8E40" },
    cancelled:       { label: "Đã huỷ",              color: "#C0392B" },
  };
  const s = map[status] ?? { label: status, color: "#888" };
  return `<span style="display:inline-block;padding:4px 12px;background:${s.color};color:#fff;border-radius:20px;font-size:12px;font-weight:600;">${s.label}</span>`;
}

// ─── Order Items Table ────────────────────────────────────────────────────────
function itemsTable(items: Order["items"]): string {
  const rows = items
    .map(
      (it) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EBE3;">
        <span style="font-weight:600;color:#3A2D27;font-size:14px;">${it.name}</span><br/>
        <span style="font-size:12px;color:#888;">SL: ${it.quantity}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EBE3;text-align:right;font-weight:700;color:${BRAND_PURPLE};font-size:14px;">${fmt(it.price * it.quantity)}</td>
    </tr>`
    )
    .join("");
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background-color:#F6F3EE;">
        <th style="padding:10px 8px;text-align:left;font-size:12px;color:${BRAND_PURPLE};text-transform:uppercase;letter-spacing:1px;">Món quà</th>
        <th style="padding:10px 8px;text-align:right;font-size:12px;color:${BRAND_PURPLE};text-transform:uppercase;letter-spacing:1px;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ─── Email: Order Confirmation ─────────────────────────────────────────────
export function buildOrderConfirmEmail(order: Order): { subject: string; html: string } {
  const paymentLabel =
    order.paymentMethod === "cod"   ? "Thanh toán khi nhận hàng (COD)" :
    order.paymentMethod === "bank"  ? "Chuyển khoản ngân hàng" :
    order.paymentMethod === "vnpay" ? "Thanh toán qua VNPay" :
    order.paymentMethod === "momo"  ? "Ví điện tử MoMo" : order.paymentMethod;

  const body = `
    <p style="font-size:16px;color:${BRAND_PURPLE};font-family:Georgia,serif;margin:0 0 8px;">Kính thưa <strong>${order.customerName}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
      Đơn hàng của lữ khách đã được <strong style="color:${BRAND_PURPLE};">ghi nhận thành công</strong>.<br/>
      Đội ngũ Huegifts sẽ sớm xử lý và gửi bưu phẩm tới tận thềm nhà của bạn. 🎁
    </p>

    <!-- Order ID Badge -->
    <div style="background:linear-gradient(135deg,#FDF9F3,#F5EED8);border:1px solid ${BRAND_GOLD};border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Mã đơn hàng</p>
      <p style="margin:0;font-size:22px;font-weight:900;font-family:Georgia,serif;color:${BRAND_PURPLE};letter-spacing:2px;">${order.id}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#777;">Đặt lúc: ${new Date(order.createdAt).toLocaleString("vi-VN")}</p>
    </div>

    <!-- Status -->
    <p style="margin:0 0 8px;font-size:13px;color:#555;">Trạng thái: ${statusBadge(order.status)}</p>
    <p style="margin:0 0 20px;font-size:13px;color:#555;">Thanh toán: <strong>${paymentLabel}</strong></p>

    ${itemsTable(order.items)}

    <!-- Totals -->
    <table width="240" align="right" cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:2;">
      <tr><td>Tạm tính:</td><td align="right"><strong>${fmt(order.subtotal)}</strong></td></tr>
      ${order.discount > 0 ? `<tr><td style="color:#2C8E40;">Giảm giá:</td><td align="right" style="color:#2C8E40;">-${fmt(order.discount)}</td></tr>` : ""}
      <tr><td>Phí ship:</td><td align="right"><strong>${order.shippingFee > 0 ? fmt(order.shippingFee) : "Miễn phí"}</strong></td></tr>
      <tr>
        <td colspan="2" style="border-top:1px solid #ddd;padding-top:8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:15px;font-weight:900;color:${BRAND_PURPLE};">TỔNG CỘNG:</td>
              <td align="right" style="font-size:18px;font-weight:900;color:${BRAND_PURPLE};">${fmt(order.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <div style="clear:both;"></div>

    <!-- Address -->
    <div style="background:#F9F6F1;border-left:3px solid ${BRAND_GOLD};padding:12px 16px;border-radius:4px;margin:20px 0 0;font-size:13px;color:#555;line-height:1.7;">
      <strong style="color:${BRAND_PURPLE};">📦 Địa chỉ giao hàng:</strong><br/>
      ${order.addressDetail}, ${order.ward}, ${order.district}, ${order.province}<br/>
      📞 ${order.phone}
    </div>

    ${order.wrapAsGift ? `
    <div style="background:#FDF8EE;border:1px dashed ${BRAND_GOLD};padding:12px 16px;border-radius:8px;margin:12px 0 0;font-size:13px;color:#5C452F;">
      <strong>❀ Gói quà mộc mạc:</strong>
      <p style="margin:6px 0 0;font-style:italic;">"${order.giftMessage || "Huế gửi thương yêu..."}"</p>
    </div>` : ""}

    ${order.paymentMethod === "pending_payment" || order.paymentMethod === "bank" ? `
    <div style="background:#FFF8E6;border:1px solid #F0C040;padding:12px 16px;border-radius:8px;margin:16px 0 0;font-size:13px;color:#7B5B00;">
      ⚠️ <strong>Lưu ý:</strong> Đơn hàng sẽ được xử lý ngay sau khi nhận được thanh toán đầy đủ.
    </div>` : ""}
  `;

  return {
    subject: `[Huegifts] ❀ Xác nhận đơn hàng #${order.id}`,
    html: layout(body),
  };
}

// ─── Email: VNPay Payment Success ─────────────────────────────────────────────
export function buildVnpaySuccessEmail(order: Order, txnNo: string, bankCode: string): { subject: string; html: string } {
  const body = `
    <p style="font-size:16px;color:${BRAND_PURPLE};font-family:Georgia,serif;margin:0 0 8px;">Kính thưa <strong>${order.customerName}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
      🎉 Giao dịch VNPay cho đơn hàng <strong>#${order.id}</strong> đã <strong style="color:#2C8E40;">hoàn tất thành công!</strong><br/>
      Huegifts đã nhận được khoản thanh toán và sẽ tiến hành đóng gói bưu phẩm ngay.
    </p>

    <div style="background:linear-gradient(135deg,#F0FFF4,#DCFCE7);border:1px solid #86EFAC;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 10px;font-size:13px;color:#15803D;font-weight:700;">✅ THANH TOÁN THÀNH CÔNG QUA VNPAY</p>
      <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:2.2;">
        <tr><td style="min-width:150px;color:#888;">Mã đơn hàng:</td><td><strong style="color:${BRAND_PURPLE};">${order.id}</strong></td></tr>
        <tr><td style="color:#888;">Số tiền:</td><td><strong style="color:#15803D;font-size:16px;">${fmt(order.total)}</strong></td></tr>
        <tr><td style="color:#888;">Ngân hàng:</td><td><strong>${bankCode || "—"}</strong></td></tr>
        <tr><td style="color:#888;">Mã giao dịch:</td><td><code style="background:#F0FFF4;padding:2px 6px;border-radius:4px;">${txnNo}</code></td></tr>
      </table>
    </div>

    ${itemsTable(order.items)}

    <p style="font-size:13px;color:#777;margin:20px 0 0;line-height:1.7;">
      Cảm ơn lữ khách đã tin tưởng chọn lựa Huegifts! 🌸<br/>
      Nếu có bất kỳ thắc mắc nào, hãy liên hệ Zalo <strong>0977 047 908</strong> để được hỗ trợ tận tình.
    </p>
  `;

  return {
    subject: `[Huegifts] ✅ Thanh toán VNPay thành công - Đơn #${order.id}`,
    html: layout(body),
  };
}

// ─── Email: VNPay Payment Failed ──────────────────────────────────────────────
export function buildVnpayFailedEmail(order: Order, reason: string): { subject: string; html: string } {
  const body = `
    <p style="font-size:16px;color:${BRAND_PURPLE};font-family:Georgia,serif;margin:0 0 8px;">Kính thưa <strong>${order.customerName}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
      Rất tiếc, giao dịch thanh toán VNPay cho đơn hàng <strong>#${order.id}</strong> <strong style="color:#C0392B;">chưa thành công.</strong>
    </p>

    <div style="background:#FFF5F5;border:1px solid #FCA5A5;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#C0392B;font-weight:700;">❌ Lý do: ${reason}</p>
      <p style="margin:0;font-size:13px;color:#555;">Đơn hàng vẫn được lưu lại trong hệ thống. Bạn có thể thử thanh toán lại hoặc chọn hình thức khác.</p>
    </div>

    <p style="font-size:13px;color:#777;">Hãy liên hệ Zalo <strong>0977 047 908</strong> nếu cần hỗ trợ.</p>
  `;

  return {
    subject: `[Huegifts] ❌ Thanh toán VNPay thất bại - Đơn #${order.id}`,
    html: layout(body),
  };
}

// ─── Email: Admin New Order Notification ──────────────────────────────────────
export function buildAdminNewOrderEmail(order: Order): { subject: string; html: string } {
  const body = `
    <p style="font-size:16px;color:${BRAND_PURPLE};font-family:Georgia,serif;margin:0 0 8px;">🔔 Đơn hàng mới cần xử lý!</p>

    <div style="background:#F0EBF8;border:1px solid ${BRAND_PURPLE};border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:20px;font-weight:900;color:${BRAND_PURPLE};letter-spacing:2px;">#${order.id}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#777;">${new Date(order.createdAt).toLocaleString("vi-VN")}</p>
    </div>

    <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:2.2;margin:0 0 16px;">
      <tr><td style="min-width:130px;color:#888;">Khách hàng:</td><td><strong>${order.customerName}</strong></td></tr>
      <tr><td style="color:#888;">Điện thoại:</td><td><a href="tel:${order.phone}" style="color:${BRAND_PURPLE};">${order.phone}</a></td></tr>
      <tr><td style="color:#888;">Email:</td><td>${order.email || "—"}</td></tr>
      <tr><td style="color:#888;">Địa chỉ:</td><td>${order.addressDetail}, ${order.ward}, ${order.district}, ${order.province}</td></tr>
      <tr><td style="color:#888;">Thanh toán:</td><td><strong>${order.paymentMethod.toUpperCase()}</strong></td></tr>
      <tr><td style="color:#888;">Vận chuyển:</td><td>${order.shippingMethod === "express" ? "Hỏa tốc" : "Tiêu chuẩn"}</td></tr>
      <tr><td style="color:#888;">Trạng thái:</td><td>${statusBadge(order.status)}</td></tr>
    </table>

    ${itemsTable(order.items)}

    <div style="text-align:right;font-size:18px;font-weight:900;color:${BRAND_PURPLE};margin-top:8px;">
      Tổng: ${fmt(order.total)}
    </div>

    ${order.wrapAsGift ? `<p style="font-size:12px;color:#aa7939;margin-top:12px;">❀ Khách yêu cầu gói quà mộc mạc: <em>"${order.giftMessage}"</em></p>` : ""}
  `;

  return {
    subject: `[Huegifts Admin] 🛍 Đơn hàng mới #${order.id} - ${new Date().toLocaleString("vi-VN")}`,
    html: layout(body),
  };
}

// ─── Email: Contact Form ──────────────────────────────────────────────────────
export function buildAdminContactEmail(name: string, email: string, phone: string, subject: string, message: string): { subject: string; html: string } {
  const body = `
    <p style="font-size:16px;color:${BRAND_PURPLE};font-family:Georgia,serif;margin:0 0 8px;">📬 Liên hệ mới từ khách hàng</p>

    <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:2.2;margin:0 0 16px;">
      <tr><td style="min-width:100px;color:#888;">Tên:</td><td><strong>${name}</strong></td></tr>
      <tr><td style="color:#888;">Email:</td><td><a href="mailto:${email}" style="color:${BRAND_PURPLE};">${email}</a></td></tr>
      <tr><td style="color:#888;">Điện thoại:</td><td><a href="tel:${phone}" style="color:${BRAND_PURPLE};">${phone}</a></td></tr>
      <tr><td style="color:#888;">Chủ đề:</td><td>${subject || "—"}</td></tr>
    </table>

    <div style="background:#F9F6F1;border-left:3px solid ${BRAND_GOLD};padding:14px 16px;border-radius:4px;font-size:14px;color:#3A2D27;line-height:1.8;font-style:italic;">
      "${message}"
    </div>
  `;

  return {
    subject: `[Huegifts CRM] 📬 ${subject || "Liên hệ mới"} - từ ${name}`,
    html: layout(body),
  };
}

// ─── Email: Order Status Update ───────────────────────────────────────────────
export function buildOrderStatusUpdateEmail(order: Order, oldStatus: string): { subject: string; html: string } {
  const statusMessages: Partial<Record<Order["status"], string>> = {
    packing:   "Đơn hàng của bạn đang được đóng gói cẩn thận bởi đội ngũ Huegifts. 🎁",
    shipping:  "Bưu phẩm đã lên đường! Shipper đang trên đường giao tới bạn. 🚚",
    delivered: "Bưu phẩm đã được giao thành công! Cảm ơn lữ khách đã tin tưởng Huegifts. 🌸",
    cancelled: "Đơn hàng của bạn đã được huỷ. Nếu có vấn đề, vui lòng liên hệ 0977 047 908.",
  };

  const msg = statusMessages[order.status] ?? `Trạng thái đơn hàng đã được cập nhật.`;

  const body = `
    <p style="font-size:16px;color:${BRAND_PURPLE};font-family:Georgia,serif;margin:0 0 8px;">Kính thưa <strong>${order.customerName}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">${msg}</p>

    <div style="background:linear-gradient(135deg,#FDF9F3,#F5EED8);border:1px solid ${BRAND_GOLD};border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Đơn hàng</p>
      <p style="margin:0;font-size:20px;font-weight:900;color:${BRAND_PURPLE};letter-spacing:2px;">${order.id}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#555;">Trạng thái mới: ${statusBadge(order.status)}</p>
    </div>

    <p style="font-size:13px;color:#777;margin:0;line-height:1.7;">
      Theo dõi đơn hàng: Truy cập <strong>Huegifts.vn</strong> → Tra cứu đơn hàng → Nhập mã <strong>${order.id}</strong>
    </p>
  `;

  return {
    subject: `[Huegifts] Cập nhật đơn hàng #${order.id}`,
    html: layout(body),
  };
}
