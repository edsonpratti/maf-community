export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          role: 'USER' | 'ADMIN' | 'MOD'
          status_access: 'PENDING' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED'
          verified_badge: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          role?: 'USER' | 'ADMIN' | 'MOD'
          status_access?: 'PENDING' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED'
          verified_badge?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          role?: 'USER' | 'ADMIN' | 'MOD'
          status_access?: 'PENDING' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED'
          verified_badge?: boolean
          created_at?: string
        }
      }
      hotmart_customers: {
        Row: {
          id: string
          user_id: string
          hotmart_email: string
          hotmart_customer_id: string | null
          last_verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hotmart_email: string
          hotmart_customer_id?: string | null
          last_verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hotmart_email?: string
          hotmart_customer_id?: string | null
          last_verified_at?: string | null
          created_at?: string
        }
      }
      hotmart_orders: {
        Row: {
          id: string
          user_id: string
          order_id: string
          product_id: string
          purchase_status: 'APPROVED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' | 'PENDING'
          purchase_type: 'ONE_TIME' | 'SUBSCRIPTION'
          subscription_status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | null
          raw_payload: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          product_id: string
          purchase_status: 'APPROVED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' | 'PENDING'
          purchase_type: 'ONE_TIME' | 'SUBSCRIPTION'
          subscription_status?: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | null
          raw_payload?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string
          product_id?: string
          purchase_status?: 'APPROVED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' | 'PENDING'
          purchase_type?: 'ONE_TIME' | 'SUBSCRIPTION'
          subscription_status?: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | null
          raw_payload?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          file_path: string
          file_hash: string
          review_status: 'UPLOADED' | 'APPROVED' | 'REJECTED'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          file_hash: string
          review_status?: 'UPLOADED' | 'APPROVED' | 'REJECTED'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          file_hash?: string
          review_status?: 'UPLOADED' | 'APPROVED' | 'REJECTED'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          media: Json | null
          visibility: 'COMMUNITY_ONLY'
          status: 'PUBLISHED' | 'HIDDEN' | 'DELETED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          media?: Json | null
          visibility?: 'COMMUNITY_ONLY'
          status?: 'PUBLISHED' | 'HIDDEN' | 'DELETED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          media?: Json | null
          visibility?: 'COMMUNITY_ONLY'
          status?: 'PUBLISHED' | 'HIDDEN' | 'DELETED'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          status: 'PUBLISHED' | 'HIDDEN' | 'DELETED'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          status?: 'PUBLISHED' | 'HIDDEN' | 'DELETED'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          status?: 'PUBLISHED' | 'HIDDEN' | 'DELETED'
          created_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: 'LIKE' | 'LOVE' | 'CLAP'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          type: 'LIKE' | 'LOVE' | 'CLAP'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          type?: 'LIKE' | 'LOVE' | 'CLAP'
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_type: 'POST' | 'COMMENT' | 'USER'
          target_id: string
          reason: string
          status: 'OPEN' | 'IN_REVIEW' | 'CLOSED'
          created_at: string
          handled_by: string | null
          handled_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          target_type: 'POST' | 'COMMENT' | 'USER'
          target_id: string
          reason: string
          status?: 'OPEN' | 'IN_REVIEW' | 'CLOSED'
          created_at?: string
          handled_by?: string | null
          handled_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          target_type?: 'POST' | 'COMMENT' | 'USER'
          target_id?: string
          reason?: string
          status?: 'OPEN' | 'IN_REVIEW' | 'CLOSED'
          created_at?: string
          handled_by?: string | null
          handled_at?: string | null
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          description: string
          type: 'PDF' | 'VIDEO' | 'LINK' | 'DOC'
          path_or_url: string
          tags: string[]
          access_rule: 'ACTIVE_ONLY'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'PDF' | 'VIDEO' | 'LINK' | 'DOC'
          path_or_url: string
          tags?: string[]
          access_rule?: 'ACTIVE_ONLY'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'PDF' | 'VIDEO' | 'LINK' | 'DOC'
          path_or_url?: string
          tags?: string[]
          access_rule?: 'ACTIVE_ONLY'
          created_at?: string
        }
      }
    }
  }
}
