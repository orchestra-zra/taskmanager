import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { taskApi } from "../../api/tasks";
import { toast } from "react-toastify";
import axiosClient from "../../../common/axiosClient";
import { t } from "i18next";

export const useCreateTask = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (data) => {
      navigate("/tasks/" + data.id, {replace: true});
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error(t("error_create_task"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useDeleteTask = (project_id?: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => taskApi.deleteTask(id),
    onSuccess: () => {
      toast.success("Success", {
        position: "top-right",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["tasksDate"] });
      queryClient.invalidateQueries({ queryKey: ["archiveTasks"] });
      if (project_id) {
        navigate(`/projects/${project_id}`, { replace: true });
      }
    },
    onError: () => {
      toast.error(t("error_delete_task"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useArchiveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isArchived, taskId }: { isArchived: boolean; taskId: number }) => {
      return axiosClient.put(`/task/${taskId}/archive`, {
        archive: isArchived,
      });
    },
    onSuccess: (_data, variables) => {
      const message = variables.isArchived
        ? t("success_message_archive")
        : t("success_message_unarchive");
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      queryClient.invalidateQueries({ queryKey: ["taskData"] });
      queryClient.invalidateQueries({ queryKey: ["archiveTasks"] });
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error(t("error_archive_task"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useUpdateParticipants = (
  taskId: number,
  onSuccessCallback: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedUsers: string[]) => {
      return axiosClient.put(`/task/${taskId}/participant`, {
        participant: selectedUsers,
      });
    },
    onSuccess: () => {
      onSuccessCallback();
      queryClient.invalidateQueries({ queryKey: ["taskData"] });
    },
    onError: (error) => {
      console.error("Error updating participants:", error);
      toast.error(t("error_update_participants"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useUpdateStatus = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (status) => axiosClient.put(`/task/${taskId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskData"] });
      queryClient.invalidateQueries({ queryKey: ["tasksDate"] });
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    onError: (error) => {
      console.log("Update status error:", error);
      toast.error(t("error_update_status"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useUpdatePriority = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priority: number) =>
      axiosClient.put(`/task/${taskId}/priority`, { priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskData"] });
    },
    onError: (error) => {
      console.error("Update priority error:", error);
      toast.error(t("error_update_priority"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useUpdateDeadline = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deadline: string | null) =>
      axiosClient.put(`/task/${taskId}/deadline`, { deadline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskData"] });
    },
    onError: (error) => {
      console.error("Update deadline error:", error);
      toast.error(t("error_update_deadline", "Failed to update deadline"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useGetTasks = () => {
  return useQuery({
    queryKey: ["Mytasks"],
    queryFn: taskApi.getTasks,
  });
};
