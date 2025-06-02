import axios, { AxiosRequestConfig } from "axios";
import { BotContext } from "../types/BotContext";

const telegramAxios = axios.create({
  baseURL: process.env.API_URL || "http://localhost:5003",
});

export const telegramRequest = async <T>(
  ctx: BotContext,
  config: AxiosRequestConfig
): Promise<T> => {
  const token = ctx.session.token;
  if (!token) throw new Error("No token in session");

  const headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await telegramAxios.request<T>({
    ...config,
    headers,
  });

  return response.data;
};
