export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Used';
export type ListingStatus = 'active' | 'sold' | 'removed';
export type UserRole = 'user' | 'admin';
export type ReportReason = 
  | 'Scam' 
  | 'Fake listing' 
  | 'Wrong information' 
  | 'Duplicate listing' 
  | 'Inappropriate content' 
  | 'Other';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  itemCount?: number;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  position: number;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  condition: ListingCondition;
  category_id: string;
  location: string;
  contact_preference: string;
  status: ListingStatus;
  views_count: number;
  likes_count?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  seller?: Profile;
  category?: Category;
  images?: ListingImage[];
  is_favorite?: boolean;
}

export interface ListingView {
  id: string;
  listing_id: string;
  viewer_id: string;
  created_at: string;
}

export interface ListingLike {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface ConversationUserSettings {
  id: string;
  conversation_id: string;
  user_id: string;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
  last_message?: Message;
  unread_count?: number;
  is_pinned?: boolean;
  is_hidden?: boolean;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  user?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url?: string | null;
  is_read: boolean;
  is_edited?: boolean;
  edited_at?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at: string;
  sender?: Profile;
  reactions?: MessageReaction[];
  reply_to_message_id?: string | null;
  reply_to?: Message | null;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export type UserReportReason = 
  | 'Scam / Fraud' 
  | 'Harassment' 
  | 'Prohibited item' 
  | 'Spam' 
  | 'Other';

export interface UserReport {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  conversation_id?: string | null;
  reason: UserReportReason;
  description?: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  listing?: Listing;
  reporter?: Profile;
}

export type NotificationType = 
  | 'new_listing' 
  | 'new_message' 
  | 'listing_sold' 
  | 'price_change' 
  | 'system';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  push_sent_at?: string | null;
}

export interface PushSubscriptionItem {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}
