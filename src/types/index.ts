export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  category?: string;
  location?: string;
  owner_email?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  call_status?: 'pending' | 'no_answer' | 'appointment_scheduled' | 'agreed' | 'not_interested';
  contact_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
  assigned_to?: string;
  client_id?: string;
  lead_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  contact_name: string;
  phone_number: string;
  duration?: number;
  outcome?: string;
  notes?: string;
  call_date: string;
  client_id?: string;
  lead_id?: string;
  created_at: string;
}
