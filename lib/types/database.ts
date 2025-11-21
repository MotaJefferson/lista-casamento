export interface Gift {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  gift_id: string;
  guest_email: string;
  guest_name: string | null;
  amount: number;
  payment_id: string | null;
  payment_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface GuestSession {
  id: string;
  email: string;
  otp_code: string;
  expires_at: string;
  attempts: number;
  created_at: string;
}

export interface SiteConfig {
  id: number;
  couple_name: string | null;
  wedding_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_latitude: number | null;
  venue_longitude: number | null;
  ceremony_time: string | null;
  reception_time: string | null;
  dress_code: string | null;
  mercadopago_access_token: string | null;
  notification_email: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_password: string | null;
  primary_color: string;
  main_page_photos: string[] | null;
  footer_email: string | null;
  footer_phone: string | null;
  footer_text: string | null;
  updated_at: string;
}

export interface Attraction {
  id: string;
  title: string;
  time: string;
  description: string;
}

export interface SiteConfig {
  id: number;
  couple_name: string | null;
  wedding_date: string | null;
  // ... mantenha os outros campos existentes ...
  venue_name: string | null;
  venue_address: string | null;
  venue_latitude: number | null;
  venue_longitude: number | null;
  // ...
  hero_images: string[] | null; // NOVO
  attractions: Attraction[] | null; // NOVO
  // ...
  updated_at: string;
}

export interface Attraction {
  id: string;
  title: string;
  time: string;
  description: string;
}

export interface Gift {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  gift_id: string;
  guest_email: string;
  guest_name: string | null;
  amount: number;
  payment_id: string | null;
  payment_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface GuestSession {
  id: string;
  email: string;
  otp_code: string;
  expires_at: string;
  attempts: number;
  created_at: string;
}

export interface RSVPGuest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  guests_count: number;
  message: string | null;
  created_at: string;
}

export interface SiteConfig {
  id: number;
  // Configs Gerais
  site_name: string | null;
  couple_name: string | null;
  wedding_date: string | null;
  
  // CTA Home
  cta_title: string | null;
  cta_text: string | null;

  // Configs Local
  venue_name: string | null;
  venue_address: string | null;
  venue_latitude: number | null;
  venue_longitude: number | null;
  ceremony_time: string | null;
  reception_time: string | null;
  dress_code: string | null;
  guests_arrival_time: string | null;
  couple_arrival_time: string | null;

  // Pagamento e Sistema
  mercadopago_access_token: string | null;
  notification_email: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_password: string | null;
  primary_color: string;
  
  // Imagens
  main_page_photos: string[] | null;
  hero_images: string[] | null;
  hero_interval: number | null;
  
  // Dados Complexos
  attractions: Attraction[] | null;
  
  // Rodapé
  footer_email: string | null;
  footer_phone: string | null;
  footer_text: string | null;
  
  // E-mails Personalizados
  email_otp_subject: string | null;
  email_otp_content: string | null;
  email_confirmation_subject: string | null;
  email_confirmation_content: string | null;

  updated_at: string;
}