import { BotContext } from "../types/BotContext";
import { telegramRequest } from "./telegramRequest";
import { Category } from "../types/entities/Category";
import { Status } from "../types/shared";

type CategoryResponse = Category;

export type CategoryResult = {
  category: Category | null;
  status: Status;
  message?: string;
};

interface EditCategory {
  _id: string;
  title: string;
  color: string;
}

interface AddCategory {
  user: string;
  title: string;
  color: string;
}

export interface CategoriesParams {
  page?: number;
  limit?: number;
}

export interface CategoriesResponse {
  results: Category[];
  page: number;
  totalPages: number;
}

class CategoryTelegramAPI {
  public async getCategories(
    ctx: BotContext,
    params: CategoriesParams
  ): Promise<{
    data: CategoriesResponse | null;
    status: Status;
    message?: string;
  }> {
    try {
      const response = await telegramRequest<CategoriesResponse>(ctx, {
        method: "GET",
        url: "/category",
        params,
      });

      return {
        data: response,
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

  public async deleteCategory(
    ctx: BotContext,
    id: string
  ): Promise<CategoryResult> {
    try {
      const response = await telegramRequest<CategoryResponse>(ctx, {
        method: "DELETE",
        url: `/category/${id}`,
      });

      return { category: response, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        message: err?.response?.data?.message || "Error",
        status: Status.ERROR,
        category: null,
      };
    }
  }

  public async addCategory(
    ctx: BotContext,
    params: AddCategory
  ): Promise<CategoryResult> {
    try {
      const response = await telegramRequest<CategoryResponse>(ctx, {
        method: "POST",
        url: "/category",
        data: params,
      });

      return { category: response, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        message: err?.response?.data?.message || "Error",
        status: Status.ERROR,
        category: null,
      };
    }
  }

  public async editCategory(
    ctx: BotContext,
    params: EditCategory
  ): Promise<CategoryResult> {
    const { _id, ...data } = params;

    try {
      const response = await telegramRequest<CategoryResponse>(ctx, {
        method: "PATCH",
        url: `/category/${_id}`,
        data,
      });

      return { category: response, status: Status.SUCCESS };
    } catch (err: any) {
      return {
        message: err?.response?.data?.message || "Error",
        status: Status.ERROR,
        category: null,
      };
    }
  }
}

const categoryTelegramAPI = new CategoryTelegramAPI();
export default categoryTelegramAPI;
