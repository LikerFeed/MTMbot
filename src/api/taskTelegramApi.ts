import { BotContext } from "../types/BotContext";
import { telegramRequest } from "./telegramRequest";
import { Task } from "../types/entities/Task";
import { Category } from "../types/entities/Category";
import { Status } from "../types/shared";

type TaskResponse = Task;

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

interface EditTask {
  _id?: string;
  title?: string;
  description?: string;
  categories?: Category["_id"][];
  links?: string[];
  deadline?: string | null;
  isCompleted?: boolean;
}

interface AddTask {
  title: string;
  user: string;
  description: string;
  categories: Category["_id"][];
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

class TaskTelegramAPI {
  public async deleteTask(ctx: BotContext, id: string): Promise<TaskResult> {
    try {
      const response = await telegramRequest<TaskResponse>(ctx, {
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

  public async addTask(ctx: BotContext, params: AddTask): Promise<TaskResult> {
    try {
      const response = await telegramRequest<TaskResponse>(ctx, {
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

  public async editTask(ctx: BotContext, params: EditTask): Promise<TaskResult> {
    try {
      const { _id, ...body } = params;
      const response = await telegramRequest<TaskResponse>(ctx, {
        method: "PATCH",
        url: `/task/${_id}`,
        data: body,
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

  public async getTasks(
    ctx: BotContext,
    params: getTask
  ): Promise<{
    data: TasksResponse | null;
    status: Status;
    message?: string;
  }> {
    try {
      let newParams: any = params;
      const categories = params?.categories?.map((el) => `"${el}"`).join(",");
      if (categories) {
        newParams = { ...params, categories: `[${categories}]` };
      }
  
      const response = await telegramRequest<{
        results: Task[];
        page: number;
        totalPages: number;
      }>(ctx, {
        method: "GET",
        url: "/task",
        params: newParams,
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
}

const taskTelegramAPI = new TaskTelegramAPI();
export default taskTelegramAPI;