export const formatDateTime = (date) => {
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date) => {
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}; 

export const parseTimeSafe = (dateStr, timeStr) => {
  if (!timeStr) return null;

  // Expect "HH:mm" or "HH:mm:ss"
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;

  const [_, hourStr, minuteStr] = match;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  return new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
};
