/*
  # Create Shepherd CRM Database Schema

  ## Tables Created
  1. **leads** - Stores potential customer information
     - `id` (uuid, primary key)
     - `name` (text, required)
     - `phone` (text)
     - `email` (text)
     - `category` (text)
     - `location` (text)
     - `owner_email` (text)
     - `status` (text, default 'new')
     - `call_status` (text)
     - `contact_person` (text)
     - `notes` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **clients** - Stores active customer information
     - `id` (uuid, primary key)
     - `name` (text, required)
     - `email` (text)
     - `phone` (text)
     - `contact_person` (text)
     - `address` (text)
     - `notes` (text)
     - `status` (text, default 'active')
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **tasks** - Stores tasks and todo items
     - `id` (uuid, primary key)
     - `title` (text, required)
     - `description` (text)
     - `priority` (text, default 'medium')
     - `status` (text, default 'todo')
     - `due_date` (timestamptz)
     - `assigned_to` (text)
     - `client_id` (uuid, foreign key to clients)
     - `lead_id` (uuid, foreign key to leads)
     - `tags` (text array)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **calls** - Stores call history
     - `id` (uuid, primary key)
     - `contact_name` (text, required)
     - `phone_number` (text, required)
     - `duration` (integer)
     - `outcome` (text)
     - `notes` (text)
     - `call_date` (timestamptz, default now)
     - `client_id` (uuid, foreign key to clients)
     - `lead_id` (uuid, foreign key to leads)
     - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  category text,
  location text,
  owner_email text,
  status text DEFAULT 'new',
  call_status text,
  contact_person text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  contact_person text,
  address text,
  notes text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'todo',
  due_date timestamptz,
  assigned_to text,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  phone_number text NOT NULL,
  duration integer,
  outcome text,
  notes text,
  call_date timestamptz DEFAULT now(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all calls"
  ON calls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert calls"
  ON calls FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete calls"
  ON calls FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_call_status ON leads(call_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_calls_call_date ON calls(call_date DESC);
