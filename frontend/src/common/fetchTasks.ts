import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axiosClient from "./axiosClient";
import type { IProjectTaskUser } from "../components/ProjectCaruselItem";
import type { ICommentIn } from "../components/Comment";
import type { UserInterface } from "../data/hooks/users/interface";

export interface ITaskQueryParams {
  status: number | string | null;
  user_ids: string;
}

export interface ITaskItem {
  id: number;
  status_id: number;
  taskUser: IProjectTaskUser[];
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  priority: number;
  taskComment: ICommentIn[];
  user: UserInterface;
}

async function getTasks(
  params: ITaskQueryParams,
  id: number,
): Promise<ITaskItem[]> {
  const response = await axiosClient.get(
    "/project/show/" + id + "/tasks",
    {
      params,
    },
  );
  return response.data;
}

async function getTaskHeader(id: number) {
  const response = await axiosClient.get("/project/show/" + id);
  return response.data;
}

export function useGetTasks(
  params: ITaskQueryParams,
  id: number,
) {
  return useQuery({
    queryKey: ["tasksDate", params, id],
    queryFn: () => getTasks(params, id),
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
}

export function useGetTaskHeader(id: number) {
  return useQuery({
    queryKey: ["taskHeaderData", id],
    queryFn: () => getTaskHeader(id),
  });
}
