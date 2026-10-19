export type Role = "student" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
}

export interface Semester {
  id: string;
  branch_id: string;
  semester_number: number;
  name: string;
  slug: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  slug: string;
  subject_code: string | null;
  description: string | null;
  order_index: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
}

export interface Note {
  id: string;
  chapter_id: string;
  title: string;
  storage_path: string;
  file_size: number | null;
  version: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}
