export const PAYMENT_METHODS = [
  { id: "jazzcash", name: "JazzCash", icon: "💳" },
  { id: "easypaisa", name: "EasyPaisa", icon: "💰" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "Weekdays", label: "Weekdays" },
  { value: "Weekends", label: "Weekends" },
  { value: "Mornings", label: "Mornings" },
  { value: "Afternoons", label: "Afternoons" },
  { value: "Evenings", label: "Evenings" },
];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const BUDGET_RANGES = [
  { value: "", label: "Any Budget" },
  { value: "10-20", label: "$10-$20/hr" },
  { value: "20-30", label: "$20-$30/hr" },
  { value: "30-50", label: "$30-$50/hr" },
  { value: "50+", label: "$50+/hr" },
];

export const PROGRAMS = [
  { value: "", label: "All Programs" },
  { value: "Undergraduate", label: "Undergraduate" },
  { value: "Graduate", label: "Graduate" },
  { value: "PhD", label: "PhD" },
];

export const SEMESTERS = [
  { value: "", label: "All Semesters" },
  { value: "Semester 1", label: "Semester 1" },
  { value: "Semester 2", label: "Semester 2" },
  { value: "Semester 3", label: "Semester 3" },
  { value: "Semester 4", label: "Semester 4" },
  { value: "Semester 5", label: "Semester 5" },
  { value: "Semester 6", label: "Semester 6" },
  { value: "Semester 7", label: "Semester 7" },
  { value: "Semester 8", label: "Semester 8" },
];

export const RATINGS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
];

export const BOOKING_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUSES = {
  UNPAID: "unpaid",
  PAID: "paid",
};

export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
