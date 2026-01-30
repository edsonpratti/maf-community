-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MOD')),
  status_access TEXT NOT NULL DEFAULT 'PENDING' CHECK (status_access IN ('PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REVOKED')),
  verified_badge BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hotmart customers table
CREATE TABLE hotmart_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hotmart_email TEXT NOT NULL,
  hotmart_customer_id TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hotmart orders table
CREATE TABLE hotmart_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  purchase_status TEXT NOT NULL CHECK (purchase_status IN ('APPROVED', 'CANCELLED', 'REFUNDED', 'CHARGEBACK', 'PENDING')),
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('ONE_TIME', 'SUBSCRIPTION')),
  subscription_status TEXT CHECK (subscription_status IN ('ACTIVE', 'CANCELLED', 'PAST_DUE')),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (review_status IN ('UPLOADED', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media JSONB,
  visibility TEXT NOT NULL DEFAULT 'COMMUNITY_ONLY' CHECK (visibility IN ('COMMUNITY_ONLY')),
  status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'HIDDEN', 'DELETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'HIDDEN', 'DELETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('LIKE', 'LOVE', 'CLAP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('POST', 'COMMENT', 'USER')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  handled_by UUID REFERENCES profiles(id),
  handled_at TIMESTAMPTZ
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PDF', 'VIDEO', 'LINK', 'DOC')),
  path_or_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  access_rule TEXT NOT NULL DEFAULT 'ACTIVE_ONLY' CHECK (access_rule IN ('ACTIVE_ONLY')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_hotmart_orders_user_id ON hotmart_orders(user_id);
CREATE INDEX idx_hotmart_orders_order_id ON hotmart_orders(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to posts table
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to hotmart_orders table
CREATE TRIGGER update_hotmart_orders_updated_at
  BEFORE UPDATE ON hotmart_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
