import { Category } from "../entities/Category";

export type Task = {
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
