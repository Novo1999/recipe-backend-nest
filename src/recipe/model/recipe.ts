export type Recipe = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  labels: string[];
  chef_id: string;
  cooking_time: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
};
