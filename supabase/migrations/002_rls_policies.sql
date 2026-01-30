-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotmart_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotmart_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view active profiles"
  ON profiles FOR SELECT
  USING (
    status_access = 'ACTIVE' OR
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

-- Hotmart customers policies
CREATE POLICY "Users can view their own hotmart data"
  ON hotmart_customers FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

CREATE POLICY "Users can insert their own hotmart data"
  ON hotmart_customers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Certificates policies
CREATE POLICY "Users can view their own certificates"
  ON certificates FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

CREATE POLICY "Users can insert their own certificates"
  ON certificates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update certificates"
  ON certificates FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD')));

-- Posts policies
CREATE POLICY "Active users can view published posts"
  ON posts FOR SELECT
  USING (
    status = 'PUBLISHED' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Active users can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

-- Comments policies
CREATE POLICY "Active users can view published comments"
  ON comments FOR SELECT
  USING (
    status = 'PUBLISHED' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Active users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

-- Reactions policies
CREATE POLICY "Active users can view reactions"
  ON reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE'));

CREATE POLICY "Active users can create reactions"
  ON reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Users can delete their own reactions"
  ON reactions FOR DELETE
  USING (user_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (
    reporter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
  );

CREATE POLICY "Active users can create reports"
  ON reports FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD')));

-- Materials policies
CREATE POLICY "Active users can view materials"
  ON materials FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE'));

CREATE POLICY "Admins can manage materials"
  ON materials FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
