export class Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  labels: string[];
  chef_id: string;
  cooking_time: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    image_url: string,
    labels: string[],
    chefId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image_url = image_url;
    this.labels = labels;
    this.chef_id = chefId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
