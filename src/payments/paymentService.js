// ---------------------------------------------------------------------------
// NexusStore payment engine (simulated)
//
// This module owns the entire card-processing contract. The UI only calls
//   processPayment(...)  /  confirmAction(...)
// so the implementation can be swapped for Stripe / PayPal later without
// touching the checkout components. It performs REAL validation:
//   • Luhn checksum + brand-specific length checks
//   • Expiry parsing & "is this card expired" checks
//   • CVC length checks per brand
// and returns deterministic outcomes for well-known test cards.
// ---------------------------------------------------------------------------

export const CARD_BRANDS = {
  visa: { key: "visa", name: "Visa", pattern: /^4/, lengths: [13, 16, 19], cvc: 3, gaps: [4, 8, 12], color: "#1434CB", bg: "#eef2ff" },
  mastercard: {
    key: "mastercard",
    name: "Mastercard",
    pattern: /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/,
    lengths: [16],
    cvc: 3,
    gaps: [4, 8, 12],
    color: "#EB001B",
    bg: "#fef2f2",
  },
  amex: { key: "amex", name: "American Express", pattern: /^3[47]/, lengths: [15], cvc: 4, gaps: [4, 10], color: "#2E77BC", bg: "#eff6ff" },
  discover: { key: "discover", name: "Discover", pattern: /^6(?:011|5|4[4-9])/, lengths: [16, 19], cvc: 3, gaps: [4, 8, 12], color: "#E77E22", bg: "#fff7ed" },
  jcb: { key: "jcb", name: "JCB", pattern: /^35(2[89]|[3-8]\d)/, lengths: [16, 19], cvc: 3, gaps: [4, 8, 12], color: "#0B4EA2", bg: "#eff6ff" },
  diners: { key: "diners", name: "Diners Club", pattern: /^3(?:0[0-5]|[68])/, lengths: [14, 16, 19], cvc: 3, gaps: [4, 10], color: "#0079BE", bg: "#eff6ff" },
  unionpay: { key: "unionpay", name: "UnionPay", pattern: /^62/, lengths: [16, 17, 18, 19], cvc: 3, gaps: [4, 8, 12], color: "#00447C", bg: "#eff6ff" },
};

const digitsOnly = (v) => (v || "").replace(/\D/g, "");

export function detectBrand(value) {
  const digits = digitsOnly(value);
  if (!digits) return null;
  return Object.values(CARD_BRANDS).find((b) => b.pattern.test(digits)) || null;
}

export function luhnCheck(value) {
  const digits = digitsOnly(value);
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function maxLengthFor(brand) {
  return brand ? Math.max(...brand.lengths) : 19;
}

// Insert spaces while typing according to the brand's grouping.
export function formatCardNumber(value) {
  const brand = detectBrand(value);
  const digits = digitsOnly(value).slice(0, maxLengthFor(brand));
  const gaps = brand ? brand.gaps : [4, 8, 12];
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && gaps.includes(i)) out += " ";
    out += digits[i];
  }
  return out;
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function parseExpiry(value) {
  const digits = digitsOnly(value);
  if (digits.length < 4) return null;
  const month = Number(digits.slice(0, 2));
  const year = Number(`20${digits.slice(2, 4)}`);
  return { month, year };
}

export function validateExpiry(value) {
  const parsed = parseExpiry(value);
  if (!parsed) return { valid: false, error: "Enter expiry as MM/YY" };
  const { month, year } = parsed;
  if (month < 1 || month > 12) return { valid: false, error: "Invalid month" };
  // last moment of the expiry month
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  if (end.getTime() < Date.now()) return { valid: false, error: "This card has expired" };
  if (year > new Date().getFullYear() + 20) return { valid: false, error: "Invalid year" };
  return { valid: true };
}

// Full validation of a card object -> { valid, errors, brand }
export function validateCard({ number, name, expiry, cvc }) {
  const errors = {};
  const brand = detectBrand(number);
  const digits = digitsOnly(number);

  if (!name || !name.trim()) errors.name = "Enter the name on the card";

  if (!digits) {
    errors.number = "Enter your card number";
  } else if (!brand) {
    errors.number = "Unsupported card brand";
  } else if (!brand.lengths.includes(digits.length)) {
    errors.number = `A ${brand.name} number has ${brand.lengths.join(" or ")} digits`;
  } else if (!luhnCheck(digits)) {
    errors.number = "This card number is invalid";
  }

  const exp = validateExpiry(expiry);
  if (!exp.valid) errors.expiry = exp.error;

  const cvcLen = brand ? brand.cvc : 3;
  if (!digitsOnly(cvc)) errors.cvc = "Enter the security code";
  else if (digitsOnly(cvc).length !== cvcLen) errors.cvc = `${cvcLen} digits`;

  return { valid: Object.keys(errors).length === 0, errors, brand };
}

// --------------------------------------------------------------------------
// Deterministic test-card scenarios (Stripe-style)
// --------------------------------------------------------------------------
export const TEST_CARDS = [
  { number: "4242 4242 4242 4242", label: "Visa — succeeds", outcome: "success" },
  { number: "5555 5555 5555 4444", label: "Mastercard — succeeds", outcome: "success" },
  { number: "3782 822463 10005", label: "Amex — succeeds", outcome: "success" },
  { number: "4000 0000 0000 0002", label: "Declined", outcome: "decline" },
  { number: "4000 0000 0000 9995", label: "Insufficient funds", outcome: "funds" },
  { number: "4000 0000 0000 0069", label: "Expired card", outcome: "expired" },
  { number: "4000 0000 0000 0127", label: "Wrong CVC", outcome: "cvc" },
  { number: "4000 0000 0000 3220", label: "Requires 3DS", outcome: "3ds" },
];

const SCENARIOS = {
  "4242424242424242": { status: "succeeded" },
  "5555555555554444": { status: "succeeded" },
  "378282246310005": { status: "succeeded" },
  "6011111111111117": { status: "succeeded" },
  "4000000000000002": { status: "failed", code: "card_declined", message: "Your card was declined. Please try a different payment method." },
  "4000000000009995": { status: "failed", code: "insufficient_funds", message: "Your card has insufficient funds." },
  "4000000000000069": { status: "failed", code: "expired_card", message: "Your card has expired." },
  "4000000000000127": { status: "failed", code: "incorrect_cvc", message: "Your card's security code is incorrect." },
  "4000000000003220": { status: "requires_action", message: "Your bank requires additional authentication." },
};

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const txnId = () => "txn_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);

/**
 * Process a payment.
 * @param {{ method:'card'|'paypal'|'apple', card?:object, amount:number, currency?:string }} params
 * @returns {Promise<{ id:string, status:'succeeded'|'failed'|'requires_action', code?:string, message?:string, brand?:string, last4?:string, method:string }>}
 */
export async function processPayment({ method = "card", card, amount, currency = "USD" }) {
  // Network / gateway latency
  await wait(1400 + Math.random() * 700);

  if (method !== "card") {
    // Wallet / redirect methods: simulate a round-trip authorization.
    return {
      id: txnId(),
      status: "succeeded",
      method,
      brand: method === "paypal" ? "PayPal" : "Apple Pay",
      last4: null,
      amount,
      currency,
    };
  }

  const digits = digitsOnly(card.number);
  const brand = detectBrand(digits);
  const last4 = digits.slice(-4);
  const scenario = SCENARIOS[digits];

  if (scenario) {
    return {
      id: txnId(),
      method: "card",
      brand: brand?.name || "Card",
      last4,
      amount,
      currency,
      ...scenario,
    };
  }

  // Default: any other card that passed validation succeeds.
  return {
    id: txnId(),
    status: "succeeded",
    method: "card",
    brand: brand?.name || "Card",
    last4,
    amount,
    currency,
  };
}

/**
 * Complete a 3D-Secure style challenge. The demo passcode is 123456.
 */
export async function confirmAction(paymentId, code) {
  await wait(1100);
  if (String(code).trim() === "123456") {
    return { id: paymentId, status: "succeeded" };
  }
  return {
    id: paymentId,
    status: "failed",
    code: "authentication_failed",
    message: "Authentication failed. The code was incorrect.",
  };
}
