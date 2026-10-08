/**
 * Phone number utilities
 * Note: Per user requirement, country code 91 is ONLY added for WhatsApp redirection
 * (https://wa.me/91XXXXXXXXXX) and nowhere else!
 */

export function extractDigits(phone: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  // If already formatted with space or special chars, preserve original feel
  if (trimmed.includes(" ")) return trimmed;

  const digits = extractDigits(trimmed);
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return trimmed;
}

/**
 * Returns raw tel: url without adding any country code prefix
 */
export function getTelUrl(phone: string): string {
  if (!phone) return "#";
  const clean = phone.trim().replace(/[^\d+]/g, "");
  return `tel:${clean}`;
}

/**
 * Returns WhatsApp click-to-chat URL with mandatory 91 prefix
 */
export function getWhatsAppUrl(phone: string, text?: string): string {
  if (!phone) return "#";
  let digits = extractDigits(phone);
  // Strip leading 0 or 91 if already typed by user
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }

  const waNumber = `91${digits}`;
  const base = `https://wa.me/${waNumber}`;
  if (text) {
    return `${base}?text=${encodeURIComponent(text)}`;
  }
  return base;
}

export function isValidPhone(phone: string): boolean {
  const digits = extractDigits(phone);
  return digits.length >= 10;
}
