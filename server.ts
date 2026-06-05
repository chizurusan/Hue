import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { db } from "./server/db";
import { createPaymentUrl, verifyReturnUrl, VNP_RESPONSE_CODES, VnpayReturnParams } from "./server/vnpay";
import {
  sendMail,
  buildOrderConfirmEmail,
  buildAdminNewOrderEmail,
  buildVnpaySuccessEmail,
  buildVnpayFailedEmail,
  buildOrderStatusUpdateEmail,
  buildAdminContactEmail,
} from "./server/email";
import { Product, Order } from "./src/types";

dotenv.config();

const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "HUEGIFTS-SECURE-ADMIN-SESSION-TOKEN-998877";

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.socket.remoteAddress || "127.0.0.1";
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── Auth Middleware ─────────────────────────────────────────────────────
  const adminAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = (req.headers["authorization"] || "").replace("Bearer ", "").trim();
    if (token !== ADMIN_SESSION_TOKEN) {
      return res.status(403).json({ error: "Quyền truy cập bị từ chối." });
    }
    next();
  };

  // ==================== PUBLIC PRODUCT ENDPOINTS ====================

  app.get("/api/products", (_req, res) => {
    try {
      res.json(db.getProducts());
    } catch {
      res.status(500).json({ error: "Lỗi nạp danh sách sản phẩm." });
    }
  });

  app.get("/api/products/:slugOrId", (req, res) => {
    try {
      const { slugOrId } = req.params;
      const product = db.getProductBySlug(slugOrId) ?? db.getProductById(slugOrId);
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
      res.json(product);
    } catch {
      res.status(500).json({ error: "Lỗi nạp chi tiết sản phẩm." });
    }
  });

  // ==================== ORDER ENDPOINTS ====================

  app.post("/api/orders", async (req, res) => {
    try {
      const {
        customerName, phone, email, province, district, ward, addressDetail,
        notes, items, wrapAsGift, giftMessage, paymentMethod, shippingMethod, discountCode,
      } = req.body;

      if (!customerName || !phone || !province || !district || !ward || !addressDetail) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin giao nhận." });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Giỏ hàng không được trống." });
      }

      const dbProducts = db.getProducts();
      const orderItems: Order["items"] = [];
      let subtotal = 0;

      for (const cartItem of items) {
        const prod = dbProducts.find((p) => p.id === cartItem.productId);
        if (!prod) return res.status(400).json({ error: `Không nhận diện được sản phẩm ${cartItem.productId}` });
        if (prod.stock < cartItem.quantity) {
          return res.status(400).json({ error: `"${prod.name}" chỉ còn ${prod.stock} chiếc.` });
        }
        const qty = Math.max(1, parseInt(cartItem.quantity) || 1);
        subtotal += prod.price * qty;
        orderItems.push({ productId: prod.id, name: prod.name, price: prod.price, quantity: qty, image: prod.images[0] });
        prod.stock -= qty;
        db.saveProduct(prod);
      }

      let discount = 0;
      if (discountCode?.toUpperCase() === "HUEGIFTS10") discount = Math.round(subtotal * 0.1);

      const shippingFee = shippingMethod === "express" ? 45000 : subtotal >= 500000 ? 0 : 30000;
      const total = subtotal - discount + shippingFee;

      const orderId = `HUEGIFTS${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: orderId,
        customerName, phone, email: email || "", province, district, ward, addressDetail,
        notes: notes || "",
        items: orderItems,
        subtotal, discount, shippingFee, total,
        paymentMethod: paymentMethod || "cod",
        shippingMethod: shippingMethod || "standard",
        wrapAsGift: !!wrapAsGift,
        giftMessage: giftMessage || "",
        status: paymentMethod === "bank" || paymentMethod === "vnpay" ? "pending_payment" : "confirmed",
        createdAt: new Date().toISOString(),
      };

      db.saveOrder(newOrder);

      // Fire-and-forget emails
      const emailTo = email || process.env.MAIL_TO;
      if (emailTo) {
        const { subject, html } = buildOrderConfirmEmail(newOrder);
        sendMail(emailTo, subject, html).catch(() => {});
      }
      const adminMail = process.env.MAIL_TO || process.env.SMTP_USER;
      if (adminMail) {
        const { subject, html } = buildAdminNewOrderEmail(newOrder);
        sendMail(adminMail, subject, html).catch(() => {});
      }

      // If VNPay: return payment URL for redirect
      if (paymentMethod === "vnpay") {
        const payUrl = createPaymentUrl({
          orderId,
          amount: total,
          orderInfo: `Thanh toan don hang ${orderId} - Huegifts`,
          ipAddr: getClientIp(req),
        });
        return res.json({ success: true, orderId, order: newOrder, vnpayUrl: payUrl });
      }

      res.json({ success: true, orderId, order: newOrder });
    } catch (err: any) {
      console.error("Order error:", err);
      res.status(500).json({ error: "Lỗi hệ thống khi tạo đơn hàng." });
    }
  });

  // ==================== VNPAY ENDPOINTS ====================

  // POST: Tạo payment URL cho đơn hàng đã tồn tại (retry thanh toán)
  app.post("/api/vnpay/create-payment", async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = db.getOrderById(orderId);
      if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
      if (order.status !== "pending_payment") {
        return res.status(400).json({ error: "Đơn hàng này không ở trạng thái chờ thanh toán." });
      }

      const payUrl = createPaymentUrl({
        orderId,
        amount: order.total,
        orderInfo: `Thanh toan don hang ${orderId} - Huegifts`,
        ipAddr: getClientIp(req),
      });

      res.json({ success: true, payUrl });
    } catch (err: any) {
      res.status(500).json({ error: "Lỗi tạo link VNPay." });
    }
  });

  // GET: VNPay Return URL — khách hàng redirect về sau khi thanh toán
  app.get("/api/vnpay/return", async (req, res) => {
    try {
      const query = req.query as unknown as VnpayReturnParams;
      const { isValid, isSuccess } = verifyReturnUrl(query);

      const orderId = query.vnp_TxnRef;
      const responseCode = query.vnp_ResponseCode;
      const amount = parseInt(query.vnp_Amount || "0") / 100;
      const txnNo = query.vnp_TransactionNo || "";
      const bankCode = query.vnp_BankCode || "";
      const bankTranNo = query.vnp_BankTranNo || "";
      const cardType = query.vnp_CardType || "";
      const payDate = query.vnp_PayDate || "";

      // Lưu transaction log
      db.saveVnpayTransaction({
        orderId,
        vnpTxnRef: orderId,
        amount,
        bankCode,
        bankTranNo,
        cardType,
        responseCode,
        transactionNo: txnNo,
        payDate,
        status: isSuccess ? "success" : "failed",
        rawResponse: JSON.stringify(query),
      });

      const order = db.getOrderById(orderId);

      if (isSuccess && order) {
        if (order.status === "pending_payment") {
          db.updateOrderStatus(orderId, "confirmed");
        }

        // Gửi email xác nhận VNPay thành công
        const emailTo = order.email || process.env.MAIL_TO;
        if (emailTo) {
          const updatedOrder = db.getOrderById(orderId) || order;
          const { subject, html } = buildVnpaySuccessEmail(updatedOrder, txnNo, bankCode);
          sendMail(emailTo, subject, html).catch(() => {});
        }

        // Redirect frontend đến trang thành công
        const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
        return res.redirect(`${appUrl}/?page=order-success&orderId=${orderId}&vnpay=success`);
      } else {
        const reason = VNP_RESPONSE_CODES[responseCode] || "Giao dịch không thành công";

        if (order) {
          const emailTo = order.email || process.env.MAIL_TO;
          if (emailTo) {
            const { subject, html } = buildVnpayFailedEmail(order, reason);
            sendMail(emailTo, subject, html).catch(() => {});
          }
        }

        const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
        return res.redirect(
          `${appUrl}/?page=vnpay-result&orderId=${orderId}&status=failed&reason=${encodeURIComponent(reason)}`
        );
      }
    } catch (err: any) {
      console.error("VNPay return error:", err);
      res.status(500).send("Lỗi xử lý kết quả thanh toán VNPay.");
    }
  });

  // POST: VNPay IPN — server-to-server notification (bắt buộc trả RspCode 00)
  app.post("/api/vnpay/ipn", (req, res) => {
    try {
      const query = req.body as VnpayReturnParams;
      const { isValid, isSuccess } = verifyReturnUrl(query);

      if (!isValid) {
        return res.json({ RspCode: "97", Message: "Checksum failed" });
      }

      const orderId = query.vnp_TxnRef;
      const amount = parseInt(query.vnp_Amount || "0") / 100;
      const order = db.getOrderById(orderId);

      if (!order) return res.json({ RspCode: "01", Message: "Order not found" });
      if (Math.abs(order.total - amount) > 1) return res.json({ RspCode: "04", Message: "Invalid amount" });
      if (order.status !== "pending_payment") return res.json({ RspCode: "02", Message: "Order already confirmed" });

      if (isSuccess) {
        db.updateOrderStatus(orderId, "confirmed");

        const emailTo = order.email || process.env.MAIL_TO;
        if (emailTo) {
          const updatedOrder = db.getOrderById(orderId) || order;
          const { subject, html } = buildVnpaySuccessEmail(
            updatedOrder,
            query.vnp_TransactionNo || "",
            query.vnp_BankCode || ""
          );
          sendMail(emailTo, subject, html).catch(() => {});
        }
      }

      res.json({ RspCode: "00", Message: "Confirm Success" });
    } catch (err: any) {
      console.error("VNPay IPN error:", err);
      res.json({ RspCode: "99", Message: "Unknown error" });
    }
  });

  // GET: Kiểm tra trạng thái thanh toán của đơn hàng
  app.get("/api/orders/:id/payment-status", (req, res) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
      const txn = db.getVnpayTransactionByOrderId(req.params.id);
      res.json({ status: order.status, vnpay: txn ?? null });
    } catch {
      res.status(500).json({ error: "Lỗi kiểm tra thanh toán." });
    }
  });

  // Track order
  app.get("/api/orders/track", (req, res) => {
    try {
      const { orderId, contact } = req.query;
      if (!orderId || !contact) {
        return res.status(400).json({ error: "Vui lòng cung cấp Mã đơn hàng và Số điện thoại / Email." });
      }
      const order = db.getOrders().find(
        (o) =>
          o.id === orderId &&
          (o.phone.trim() === String(contact).trim() || o.email.trim() === String(contact).trim())
      );
      if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
      res.json(order);
    } catch {
      res.status(500).json({ error: "Lỗi tra cứu đơn hàng." });
    }
  });

  // Universal payment webhook (SePay, Casso, PayOS, ...)
  app.post("/api/payment-webhook", (req, res) => {
    try {
      const bodyStr = JSON.stringify(req.body);
      let rawContent = "";
      let amount = 0;

      if (req.body.transactionContent) rawContent = req.body.transactionContent;
      if (req.body.amountIn) amount = Number(req.body.amountIn);

      if (req.body.data && Array.isArray(req.body.data)) {
        for (const log of req.body.data) {
          if (log.description) rawContent += " " + log.description;
          if (log.amount) amount = Number(log.amount);
        }
      }
      if (req.body.data && !Array.isArray(req.body.data)) {
        if (req.body.data.description) rawContent += " " + req.body.data.description;
        if (req.body.data.amount) amount = Number(req.body.data.amount);
      }
      if (!rawContent) rawContent = bodyStr;

      const match = rawContent.match(/HUEGIFTS\d+/i);
      if (!match) return res.json({ success: false, message: "Không tìm thấy mã đơn hàng." });

      const orderId = match[0].toUpperCase();
      const order = db.getOrderById(orderId);
      if (!order) return res.json({ success: false, message: `Đơn hàng ${orderId} không tồn tại.` });
      if (order.status !== "pending_payment") return res.json({ success: true, message: "Đơn đã xác nhận trước đó." });

      db.updateOrderStatus(orderId, "confirmed");
      const updatedOrder = db.getOrderById(orderId)!;

      const emailTo = updatedOrder.email || process.env.MAIL_TO;
      if (emailTo) {
        const { subject, html } = buildVnpaySuccessEmail(updatedOrder, "", "Bank Transfer");
        sendMail(emailTo, subject, html).catch(() => {});
      }

      res.json({ success: true, message: `Đơn hàng ${orderId} đã được xác nhận.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Contact form
  app.post("/api/send-contact-email", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc." });
      }

      const contact = db.saveContact({
        name: name.trim(), email: email.trim(), phone: phone.trim(),
        subject: subject?.trim() || "Không có chủ đề", message: message.trim(),
      });

      const adminMail = process.env.MAIL_TO || process.env.SMTP_USER;
      if (adminMail) {
        const { subject: sub, html } = buildAdminContactEmail(name, email, phone, subject, message);
        sendMail(adminMail, sub, html).catch(() => {});
      }

      res.json({ message: "Đã nhận liên hệ của bạn. Chúng tôi sẽ phản hồi sớm!", contact });
    } catch (err: any) {
      res.status(500).json({ error: "Lỗi gửi liên hệ." });
    }
  });

  // ==================== ADMIN ENDPOINTS ====================

  app.post("/api/admin/login", (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = (process.env.ADMIN_EMAIL || "nvanhue069@gmail.com").trim().toLowerCase();
      if (!email || email.trim().toLowerCase() !== adminEmail) {
        return res.status(401).json({ error: "Email không có quyền admin." });
      }
      res.json({ success: true, sessionToken: ADMIN_SESSION_TOKEN, email, role: "admin" });
    } catch {
      res.status(500).json({ error: "Lỗi đăng nhập." });
    }
  });

  app.get("/api/admin/stats", adminAuthMiddleware, (_req, res) => {
    try {
      res.json(db.getStats());
    } catch {
      res.status(500).json({ error: "Lỗi thống kê." });
    }
  });

  // Products CRUD
  app.get("/api/admin/products", adminAuthMiddleware, (_req, res) => res.json(db.getProducts()));

  app.post("/api/admin/products", adminAuthMiddleware, (req, res) => {
    try {
      const prod: Product = req.body;
      if (!prod.name || !prod.slug || !prod.price) {
        return res.status(400).json({ error: "Thiếu thông tin sản phẩm." });
      }
      if (!prod.id) prod.id = "sp-" + Date.now();
      db.saveProduct(prod);
      res.json({ success: true, product: prod });
    } catch {
      res.status(500).json({ error: "Lỗi tạo sản phẩm." });
    }
  });

  app.put("/api/admin/products/:id", adminAuthMiddleware, (req, res) => {
    try {
      const existing = db.getProductById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
      const updated = { ...existing, ...req.body, id: req.params.id };
      db.saveProduct(updated);
      res.json({ success: true, product: updated });
    } catch {
      res.status(500).json({ error: "Lỗi cập nhật sản phẩm." });
    }
  });

  app.delete("/api/admin/products/:id", adminAuthMiddleware, (req, res) => {
    try {
      const ok = db.deleteProduct(req.params.id);
      if (!ok) return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Lỗi xóa sản phẩm." });
    }
  });

  // Orders
  app.get("/api/admin/orders", adminAuthMiddleware, (_req, res) => {
    try {
      res.json(db.getOrders());
    } catch {
      res.status(500).json({ error: "Lỗi tải đơn hàng." });
    }
  });

  app.put("/api/admin/orders/:id/status", adminAuthMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Thiếu trạng thái." });

      const oldOrder = db.getOrderById(req.params.id);
      const updated = db.updateOrderStatus(req.params.id, status as Order["status"]);
      if (!updated) return res.status(404).json({ error: "Không tìm thấy đơn hàng." });

      if (updated.email && oldOrder?.status !== status) {
        const { subject, html } = buildOrderStatusUpdateEmail(updated, oldOrder?.status || "");
        sendMail(updated.email, subject, html).catch(() => {});
      }

      res.json({ success: true, order: updated });
    } catch {
      res.status(500).json({ error: "Lỗi cập nhật trạng thái." });
    }
  });

  // Admin VNPay transaction for an order
  app.get("/api/admin/orders/:id/vnpay", adminAuthMiddleware, (req, res) => {
    try {
      const txn = db.getVnpayTransactionByOrderId(req.params.id);
      res.json({ transaction: txn ?? null });
    } catch {
      res.status(500).json({ error: "Lỗi tải thông tin VNPay." });
    }
  });

  // Contacts
  app.get("/api/admin/contacts", adminAuthMiddleware, (_req, res) => res.json(db.getContacts()));

  app.put("/api/admin/contacts/:id/read", adminAuthMiddleware, (req, res) => {
    try {
      const updated = db.toggleContactRead(req.params.id, req.body.read);
      if (!updated) return res.status(404).json({ error: "Không tìm thấy liên hệ." });
      res.json({ success: true, contact: updated });
    } catch {
      res.status(500).json({ error: "Lỗi cập nhật." });
    }
  });

  app.delete("/api/admin/contacts/:id", adminAuthMiddleware, (req, res) => {
    try {
      const ok = db.deleteContact(req.params.id);
      if (!ok) return res.status(404).json({ error: "Không tìm thấy liên hệ." });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Lỗi xóa." });
    }
  });

  // ==================== VITE DEV / STATIC PROD ====================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: express.Request, _res: express.Response) => {
      _res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Huegifts] Server running on port ${PORT} 🌸`);
    console.log(`[Huegifts] SQLite database: huegifts.db`);
  });
}

startServer();
