-- Create children table
CREATE TABLE IF NOT EXISTS fsyp_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create history table
CREATE TABLE IF NOT EXISTS fsyp_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES fsyp_children(id) ON DELETE CASCADE,
  task_id text NOT NULL,
  points integer NOT NULL,
  completed_date date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE fsyp_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE fsyp_history ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allowing anon access for simplicity since it's a personal app)
CREATE POLICY "Allow anon read access on fsyp_children" ON fsyp_children FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on fsyp_children" ON fsyp_children FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon delete access on fsyp_children" ON fsyp_children FOR DELETE USING (true);
CREATE POLICY "Allow anon update access on fsyp_children" ON fsyp_children FOR UPDATE USING (true);

CREATE POLICY "Allow anon read access on fsyp_history" ON fsyp_history FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on fsyp_history" ON fsyp_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon delete access on fsyp_history" ON fsyp_history FOR DELETE USING (true);

-- Insert initial children
INSERT INTO fsyp_children (name) VALUES 
('Mitko'),
('Freddie'),
('Rueben'),
('Harvey'),
('Dima');
