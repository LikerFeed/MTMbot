import instanse from '../axios';
import { Status } from '../types/shared';
import { Task } from '../types/entities/Task';
import { Category } from '../types/entities/Category';

type TaskResponse = {
  status: number;
  statusText: string;
  data: Task;
};

export type TaskResult = {
  task: Task | null;
  status: Status;
  message?: string;
};

export type TasksResponse = {
  status: number;
  statusText: string;
  data: {
    tasks: (Task)[];
    totalPages: number;
    currentPage: number;
  };
};

interface EditTask {
  _id?: string;
  title?: string;
  description?: string;
  categories?: Category['_id'][];
  links?: string[];
  deadline?: string | null;
  isCompleted?: boolean;
}

interface AddTask {
  title: string;
  user: string;
  description: string;
  categories: Category['_id'][];
  deadline: string | null;
  isCompleted: boolean;
}

export interface getTask {
  page?: number;
  limit?: number;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
  description?: string;
  categories?: string[];
  deadline?: string | null;
  isCompleted?: boolean;
  searchPattern?: string;
}

class taskAPIClass {
  public async deleteTask(id: string): Promise<TaskResult> {
    try {
      const response: TaskResponse = await instanse.delete(`/task/${id}`);
      return { task: response.data, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        message: err?.response?.data?.message || 'Error',
        status: Status.ERROR,
        task: null,
      };
    }
  }

  public async addtask(params: AddTask): Promise<TaskResult> {
    const { title, description, categories, user, deadline, isCompleted } =
      params;
    try {
      const response: TaskResponse = await instanse.post('/task', {
        title,
        user,
        description,
        categories,
        deadline,
        isCompleted,
      });
      return { task: response.data, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        message: err?.response?.data?.message || 'Error',
        status: Status.ERROR,
        task: null,
      };
    }
  }

  public async edittask(params: EditTask): Promise<TaskResult> {
    try {
      const { _id, ...body } = params;
      const response: TaskResponse = await instanse.patch(`/task/${_id}`, body);
      return { task: response.data, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        message: err?.response?.data?.message || 'Error',
        status: Status.ERROR,
        task: null,
      };
    }
  }
}
const taskAPI = new taskAPIClass();
export default taskAPI;
