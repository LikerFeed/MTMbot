import { Category } from "../entities/Category";

export type Task = {
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  categories: Category[];
  links: string[];
  deadline: string | null;
  dateOfCompletion: string | null;
  type: "task";
};
