export const money = (value: number) =>
  `฿${Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const thaiDate = (value?: string) => {
  if (!value) return "–";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const thaiIntegerText = (value: number, isMillionRemainder = false): string => {
  const digitNames = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const placeNames = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  if (value === 0) return isMillionRemainder ? "" : digitNames[0];
  if (value >= 1_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const remainder = value % 1_000_000;
    return `${thaiIntegerText(millions)}ล้าน${thaiIntegerText(remainder, true)}`;
  }
  const digits = String(value).split("").map(Number);
  const len = digits.length;
  return digits
    .map((digit, index) => {
      if (digit === 0) return "";
      const place = len - index - 1;
      if (place === 1 && digit === 1) return "สิบ";
      if (place === 1 && digit === 2) return "ยี่สิบ";
      if (place === 0 && digit === 1 && len > 1 && digits[len - 2] !== 0) return "เอ็ด";
      return `${digitNames[digit]}${placeNames[place]}`;
    })
    .join("");
};

export const bahtText = (num: number): string => {
  if (isNaN(num)) return "–";
  if (num === 0) return "ศูนย์บาทถ้วน";

  const absolute = Math.abs(num);
  const baht = Math.floor(absolute);
  const satang = Math.round((absolute - baht) * 100);

  const prefix = num < 0 ? "ลบ" : "";
  const bahtPart = baht > 0 ? `${thaiIntegerText(baht)}บาท` : "";
  const satangPart = satang > 0 ? `${thaiIntegerText(satang)}สตางค์` : "ถ้วน";

  return `${prefix}${bahtPart}${satangPart}`;
};
