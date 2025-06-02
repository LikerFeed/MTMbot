import { BotContext } from "../types/BotContext";
import { telegramRequest } from "./telegramRequest";
import { Task } from "../types/entities/Task";
import { Category } from "../types/entities/Category";
import { Status } from "../types/shared";

export interface AddTask {
  title: string;
  user: string;
  description: string;
  categories: Category["_id"][];
  deadline: string | null;
  isCompleted: boolean;
}

export interface GetTasksParams {
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

export interface EditTask {
  _id?: string;
  title?: string;
  description?: string;
  categories?: Category["_id"][];
  links?: string[];
  deadline?: string | null;
  isCompleted?: boolean;
}

export type TaskResult = {
  task: Task | null;
  status: Status;
  message?: string;
};

export type TasksResponse = {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
};

class TaskAPI {
  // Add a new task
  public async addTask(ctx: BotContext, params: AddTask): Promise<TaskResult> {
    try {
      const response = await telegramRequest<Task>(ctx, {
        method: "POST",
        url: "/task",
        data: params,
      });

      return { task: response, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        task: null,
        status: Status.ERROR,
        message: err?.response?.data?.message || "Error",
      };
    }
  }

  // Get tasks with pagination and filters
  public async getTasks(
    ctx: BotContext,
    params: GetTasksParams
  ): Promise<{
    data: TasksResponse | null;
    status: Status;
    message?: string;
  }> {
    try {
      const categories = params?.categories?.map((el) => `"${el}"`).join(",");
      const queryParams = categories
        ? { ...params, categories: `[${categories}]` }
        : params;

      const response = await telegramRequest<{
        results: Task[];
        page: number;
        totalPages: number;
      }>(ctx, {
        method: "GET",
        url: "/task",
        params: queryParams,
      });

      return {
        data: {
          tasks: response.results,
          currentPage: response.page,
          totalPages: response.totalPages,
        },
        status: Status.SUCCESS,
      };
    } catch (err: any) {
      return {
        data: null,
        status: Status.ERROR,
        message: err?.response?.data?.message || "Error",
      };
    }
  }

  // Edit an existing task
  public async editTask(
    ctx: BotContext,
    params: EditTask
  ): Promise<TaskResult> {
    try {
      const { _id, ...data } = params;
      const response = await telegramRequest<Task>(ctx, {
        method: "PATCH",
        url: `/task/${_id}`,
        data,
      });

      return { task: response, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        task: null,
        status: Status.ERROR,
        message: err?.response?.data?.message || "Error",
      };
    }
  }

  // Delete a task by ID
  public async deleteTask(ctx: BotContext, id: string): Promise<TaskResult> {
    try {
      const response = await telegramRequest<Task>(ctx, {
        method: "DELETE",
        url: `/task/${id}`,
      });

      return { task: response, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        task: null,
        status: Status.ERROR,
        message: err?.response?.data?.message || "Error",
      };
    }
  }
}

const taskAPI = new TaskAPI();
export default taskAPI;
