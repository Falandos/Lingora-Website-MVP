export interface User {
  id: number;
  email: string;
  role: 'provider' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: number;
  userId: number;
  businessName: string;
  slug: string;
  kvkNumber: string;
  btwNumber: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  bio: Record<string, string>; // Multilingual bio
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  trialStartDate: string;
  subscriptionStatus: 'trial' | 'active' | 'frozen';
  subscriptionEndDate?: string;
  openingHours?: OpeningHours;
  gallery: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  providerId: number;
  categoryId: number;
  title: string;
  description: Record<string, string>; // Multilingual description
  priceRangeMin?: number;
  priceRangeMax?: number;
  priceCurrency: string;
  mode: 'in_person' | 'online' | 'both';
  contactStaffId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: number;
  providerId: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  photo?: string;
  languages: StaffLanguage[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffLanguage {
  languageCode: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface ProviderLanguage {
  providerId: number;
  languageCode: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface Category {
  id: number;
  slug: string;
  name: Record<string, string>; // Multilingual name
  description?: Record<string, string>; // Multilingual description
  parentId?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  code: string; // ISO 639-1 code
  name: Record<string, string>; // Native and English names
  isActive: boolean;
  sortOrder: number;
}

export interface Message {
  id: number;
  providerId: number;
  senderName: string;
  senderEmail: string;
  preferredLanguage: string;
  subject: string;
  message: string;
  consentGiven: boolean;
  ipAddress: string;
  userAgent?: string;
  status: 'new' | 'read' | 'responded';
  createdAt: string;
  readAt?: string;
}

export interface Report {
  id: number;
  providerId: number;
  reporterName?: string;
  reporterEmail?: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  reviewedBy?: number;
  reviewedAt?: string;
  actionTaken?: string;
  createdAt: string;
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // HH:mm format
  closeTime?: string; // HH:mm format
  breakStart?: string;
  breakEnd?: string;
}

export interface SearchFilters {
  languages?: string[];
  categories?: number[];
  city?: string;
  radius?: number; // in kilometers
  mode?: 'in_person' | 'online' | 'both';
  keyword?: string;
  lat?: number;
  lng?: number;
}

export interface SearchResult {
  provider: Provider;
  services: Service[];
  staff: Staff[];
  languages: ProviderLanguage[];
  category: Category;
  distance?: number; // in kilometers
  matchScore: number;
}

export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  postalCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  preferredLanguage: string;
  subject: string;
  message: string;
  consentGiven: boolean;
  captchaToken: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  businessName: string;
  kvkNumber: string;
  btwNumber: string;
  captchaToken: string;
}