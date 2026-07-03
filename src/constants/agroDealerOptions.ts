export const BUSINESS_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Herbicides',
  'Veterinary Medicine',
  'Animal Feed',
  'Farm Tools',
  'Irrigation Equipment',
  'Greenhouse Supplies',
  'Organic Products',
  'Other',
];

export const PAYMENT_METHODS = [
  'Cash',
  'Mobile Money',
  'Bank Transfer',
  'Card Payment',
  'Credit Available',
];

export const LANGUAGES = [
  'Kinyarwanda',
  'English',
  'French',
  'Swahili',
];

export const RWANDA_PROVINCES = [
  'Kigali',
  'Eastern Province',
  'Northern Province',
  'Southern Province',
  'Western Province',
];

export const BUSINESS_TYPES = [
  'Retail Shop',
  'Wholesale',
  'Distributor',
  'Manufacturer',
  'Online Store',
  'Mobile Vendor',
  'Cooperative',
  'Other',
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_BUSINESS_HOURS = DAYS_OF_WEEK.map((day) => ({
  day,
  open: '08:00',
  close: '18:00',
  closed: day === 'Sunday',
}));
