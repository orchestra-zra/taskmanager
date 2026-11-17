import { t } from "i18next";

export const STATUS_KEY_MAP: Record<string, string> = {
  // English
  "To do": "to_do",
  "In Progress": "in_progress",
  "Testing": "testing",
  "Completed": "completed",
  "Cancelled": "cancelled",

  // Russian
  "К выполнению": "to_do",
  "В процессе": "in_progress",
  "На проверке": "testing",
  "Завершено": "completed",
  "Завершенные": "completed",
  "Отменено": "cancelled",

  // Uzbek
  "Qilish kerak": "to_do",
  "Bajarilmoqda": "in_progress",
  "Bajarish kerak": "to_do",
  "Sinov": "testing",
  "Tugallangan": "completed",
  "Bekor qilingan": "cancelled",
};

export const getStatusLabel = (name?: string): string => {
  if (!name) return "";
  const key = STATUS_KEY_MAP[name];
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return name;
};

export const getStatusColorClasses = (name?: string, order?: number): { [key: string]: boolean } => {
  if (!name) return {};
  const isProgress = order === 2 || ["In Progress", "В процессе", "Bajarilmoqda"].includes(name);
  const isTesting = order === 3 || ["Testing", "На проверке", "Sinov"].includes(name);
  const isCompleted = order === 4 || ["Completed", "Завершено", "Завершенные", "Tugallangan"].includes(name);
  
  return {
    "bg-customBlueLight": isProgress,
    "bg-customRedLight": isTesting,
    "bg-customGreen": isCompleted,
  };
};
