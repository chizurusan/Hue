import Database from "better-sqlite3";
import path from "path";
import { Product, Order } from "../src/types";
import { PRODUCTS } from "../src/data/products";

const DB_PATH = path.join(process.cwd(), "huegifts.db");

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  read: number; // SQLite stores boolean as 0/1
  createdAt: string;
}

export interface VnpayTransaction {
  id: string;
  orderId: string;
  vnpTxnRef: string;
  amount: number;
  bankCode?: string;
  bankTranNo?: string;
  cardType?: string;
  responseCode: string;
  transactionNo?: string;
  payDate?: string;
  status: "pending" | "success" | "failed";
  rawResponse?: string;
  createdAt: string;
}

// Open / create the SQLite database
const db_raw = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db_raw.pragma("journal_mode = WAL");
db_raw.pragma("foreign_keys = ON");

// ─── Migrations ─────────────────────────────────────────────────────────────

db_raw.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    data        TEXT NOT NULL  -- full JSON blob
  );

  CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY,
    customerName    TEXT NOT NULL,
    phone           TEXT NOT NULL,
    email           TEXT,
    province        TEXT,
    district        TEXT,
    ward            TEXT,
    addressDetail   TEXT,
    notes           TEXT,
    subtotal        REAL DEFAULT 0,
    discount        REAL DEFAULT 0,
    shippingFee     REAL DEFAULT 0,
    total           REAL DEFAULT 0,
    paymentMethod   TEXT DEFAULT 'cod',
    shippingMethod  TEXT DEFAULT 'standard',
    wrapAsGift      INTEGER DEFAULT 0,
    giftMessage     TEXT,
    status          TEXT DEFAULT 'confirmed',
    createdAt       TEXT NOT NULL,
    data            TEXT NOT NULL  -- full JSON blob for items
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    email     TEXT NOT NULL,
    phone     TEXT NOT NULL,
    subject   TEXT,
    message   TEXT NOT NULL,
    read      INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vnpay_transactions (
    id            TEXT PRIMARY KEY,
    orderId       TEXT NOT NULL,
    vnpTxnRef     TEXT NOT NULL,
    amount        REAL NOT NULL,
    bankCode      TEXT,
    bankTranNo    TEXT,
    cardType      TEXT,
    responseCode  TEXT NOT NULL,
    transactionNo TEXT,
    payDate       TEXT,
    status        TEXT NOT NULL DEFAULT 'pending',
    rawResponse   TEXT,
    createdAt     TEXT NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created  ON orders(createdAt);
  CREATE INDEX IF NOT EXISTS idx_contacts_read   ON contacts(read);
  CREATE INDEX IF NOT EXISTS idx_vnpay_order     ON vnpay_transactions(orderId);
`);

// Seed products if table is empty
const productCount = (db_raw.prepare("SELECT COUNT(*) as cnt FROM products").get() as { cnt: number }).cnt;
if (productCount === 0) {
  const insert = db_raw.prepare("INSERT OR IGNORE INTO products (id, slug, data) VALUES (?, ?, ?)");
  const insertMany = db_raw.transaction((prods: Product[]) => {
    for (const p of prods) {
      insert.run(p.id, p.slug, JSON.stringify(p));
    }
  });
  insertMany(PRODUCTS);
  console.log(`[DB] Seeded ${PRODUCTS.length} products into SQLite.`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseOrder(row: any): Order {
  const base = JSON.parse(row.data);
  return {
    ...base,
    id: row.id,
    customerName: row.customerName,
    phone: row.phone,
    email: row.email ?? "",
    province: row.province ?? "",
    district: row.district ?? "",
    ward: row.ward ?? "",
    addressDetail: row.addressDetail ?? "",
    notes: row.notes ?? "",
    subtotal: row.subtotal,
    discount: row.discount,
    shippingFee: row.shippingFee,
    total: row.total,
    paymentMethod: row.paymentMethod,
    shippingMethod: row.shippingMethod,
    wrapAsGift: !!row.wrapAsGift,
    giftMessage: row.giftMessage ?? "",
    status: row.status,
    createdAt: row.createdAt,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const db = {
  // ── Products ────────────────────────────────────────────────────────────
  getProducts(): Product[] {
    const rows = db_raw.prepare("SELECT data FROM products").all() as { data: string }[];
    return rows.map(r => JSON.parse(r.data) as Product);
  },

  getProductById(id: string): Product | undefined {
    const row = db_raw.prepare("SELECT data FROM products WHERE id = ?").get(id) as { data: string } | undefined;
    return row ? (JSON.parse(row.data) as Product) : undefined;
  },

  getProductBySlug(slug: string): Product | undefined {
    const row = db_raw.prepare("SELECT data FROM products WHERE slug = ?").get(slug) as { data: string } | undefined;
    return row ? (JSON.parse(row.data) as Product) : undefined;
  },

  saveProduct(product: Product): Product {
    db_raw
      .prepare("INSERT OR REPLACE INTO products (id, slug, data) VALUES (?, ?, ?)")
      .run(product.id, product.slug, JSON.stringify(product));
    return product;
  },

  deleteProduct(id: string): boolean {
    const info = db_raw.prepare("DELETE FROM products WHERE id = ?").run(id);
    return info.changes > 0;
  },

  // ── Orders ──────────────────────────────────────────────────────────────
  getOrders(): Order[] {
    const rows = db_raw.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
    return rows.map(parseOrder);
  },

  getOrderById(id: string): Order | undefined {
    const row = db_raw.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    return row ? parseOrder(row) : undefined;
  },

  saveOrder(order: Order): Order {
    db_raw
      .prepare(`
        INSERT OR REPLACE INTO orders
          (id, customerName, phone, email, province, district, ward, addressDetail,
           notes, subtotal, discount, shippingFee, total, paymentMethod,
           shippingMethod, wrapAsGift, giftMessage, status, createdAt, data)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        order.id,
        order.customerName,
        order.phone,
        order.email ?? "",
        order.province ?? "",
        order.district ?? "",
        order.ward ?? "",
        order.addressDetail ?? "",
        order.notes ?? "",
        order.subtotal,
        order.discount,
        order.shippingFee,
        order.total,
        order.paymentMethod,
        order.shippingMethod,
        order.wrapAsGift ? 1 : 0,
        order.giftMessage ?? "",
        order.status,
        order.createdAt,
        JSON.stringify(order)
      );
    return order;
  },

  updateOrderStatus(orderId: string, status: Order["status"]): Order | undefined {
    db_raw.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
    const row = db_raw.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!row) return undefined;
    const order = parseOrder(row);
    // Keep the data blob in sync
    db_raw.prepare("UPDATE orders SET data = ? WHERE id = ?").run(JSON.stringify(order), orderId);
    return order;
  },

  // ── Contacts ────────────────────────────────────────────────────────────
  getContacts(): ContactMessage[] {
    return db_raw.prepare("SELECT * FROM contacts ORDER BY createdAt DESC").all() as ContactMessage[];
  },

  saveContact(contact: Omit<ContactMessage, "id" | "read" | "createdAt">): ContactMessage {
    const newContact: ContactMessage = {
      ...contact,
      id: "ct-" + Date.now() + Math.random().toString(36).substring(2, 5),
      read: 0,
      createdAt: new Date().toISOString(),
    };
    db_raw
      .prepare(
        "INSERT INTO contacts (id, name, email, phone, subject, message, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        newContact.id,
        newContact.name,
        newContact.email,
        newContact.phone,
        newContact.subject ?? "",
        newContact.message,
        0,
        newContact.createdAt
      );
    return newContact;
  },

  toggleContactRead(contactId: string, read?: boolean): ContactMessage | undefined {
    const row = db_raw.prepare("SELECT * FROM contacts WHERE id = ?").get(contactId) as ContactMessage | undefined;
    if (!row) return undefined;
    const newRead = read !== undefined ? (read ? 1 : 0) : row.read ? 0 : 1;
    db_raw.prepare("UPDATE contacts SET read = ? WHERE id = ?").run(newRead, contactId);
    return { ...row, read: newRead };
  },

  deleteContact(contactId: string): boolean {
    const info = db_raw.prepare("DELETE FROM contacts WHERE id = ?").run(contactId);
    return info.changes > 0;
  },

  // ── VNPay Transactions ────────────────────────────────────────────────
  saveVnpayTransaction(txn: Omit<VnpayTransaction, "id" | "createdAt">): VnpayTransaction {
    const newTxn: VnpayTransaction = {
      ...txn,
      id: "vnp-" + Date.now() + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
    };
    db_raw
      .prepare(`
        INSERT INTO vnpay_transactions
          (id, orderId, vnpTxnRef, amount, bankCode, bankTranNo, cardType,
           responseCode, transactionNo, payDate, status, rawResponse, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        newTxn.id,
        newTxn.orderId,
        newTxn.vnpTxnRef,
        newTxn.amount,
        newTxn.bankCode ?? null,
        newTxn.bankTranNo ?? null,
        newTxn.cardType ?? null,
        newTxn.responseCode,
        newTxn.transactionNo ?? null,
        newTxn.payDate ?? null,
        newTxn.status,
        newTxn.rawResponse ?? null,
        newTxn.createdAt
      );
    return newTxn;
  },

  getVnpayTransactionByOrderId(orderId: string): VnpayTransaction | undefined {
    return db_raw
      .prepare("SELECT * FROM vnpay_transactions WHERE orderId = ? ORDER BY createdAt DESC LIMIT 1")
      .get(orderId) as VnpayTransaction | undefined;
  },

  // ── Stats ────────────────────────────────────────────────────────────
  getStats() {
    const totalProducts = (db_raw.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }).c;
    const totalOrders = (db_raw.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c;
    const pendingOrders = (
      db_raw
        .prepare("SELECT COUNT(*) as c FROM orders WHERE status IN ('pending_payment','confirmed','packing')")
        .get() as { c: number }
    ).c;
    const unreadContacts = (db_raw.prepare("SELECT COUNT(*) as c FROM contacts WHERE read = 0").get() as { c: number }).c;
    const revenue = (
      db_raw
        .prepare("SELECT COALESCE(SUM(total),0) as r FROM orders WHERE status NOT IN ('cancelled','pending_payment')")
        .get() as { r: number }
    ).r;
    const vnpaySuccess = (
      db_raw
        .prepare("SELECT COUNT(*) as c FROM vnpay_transactions WHERE status = 'success'")
        .get() as { c: number }
    ).c;
    return { totalProducts, totalOrders, pendingOrders, unreadContacts, revenue, vnpaySuccess };
  },
};
