export function formatInr(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatPct(value: number, signed = true): string {
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function buildRecruitMessage(keyword: string, city = 'Rajahmundry'): string {
  return `We are receiving many ${keyword} requests in ${city}. Join NEXGEN as a verified service partner.`;
}

export function buildWhatsAppUrl(message: string, phone?: string): string {
  const text = encodeURIComponent(message);
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}
