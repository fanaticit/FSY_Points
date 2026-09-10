export type Child = {
  id: string;
  name: string;
  sweets_image_url?: string;
};

export type HistoryRecord = {
  id: string;
  child_id: string;
  task_id: string;
  points: number;
  completed_date: string;
  created_at: string;
};

export type Task = {
  id: string;
  name: string;
  sweets_image_url?: string;
  points: number;
};
