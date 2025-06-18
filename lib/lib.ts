function setUTCHoursStart(date?: Date): Date {
  if (!date) date = new Date();
  let lDate = new Date(date);
  lDate.setUTCHours(3, 0, 0, 0);
  return lDate;
}

function setUTCHoursEnd(date?: Date): Date {
  if (!date) date = new Date();
  let lDate = new Date(date);
  lDate.setUTCHours(23, 59, 59, 998);
  return lDate;
}

function dateToBr() {
  // Get current date for Brazil timezone (GMT-3)
  const now = new Date();
  const brasilDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brasilDate;
}

/**
 * Formats a date to ISO string format (YYYY-MM-DD) for input[type="date"]
 */
const formatDateForInput = (date: Date): string => {
  date.setUTCHours(3, 0, 0, 0); // Set time to start of the day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const round = function (value: number): number {
  return Math.round(value * 100) / 100;
};

export const lib = {
  round,
  setUTCHoursStart,
  setUTCHoursEnd,
  dateToBr,
  formatDateForInput,
};
