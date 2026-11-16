import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../common/axiosClient";
import { toast } from "react-toastify";
import { t } from "i18next";

export const useDeleteProject = (id: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => axiosClient.delete(`/project/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupsData"] });
      queryClient.invalidateQueries({ queryKey: ["groupSelect"] });
      queryClient.invalidateQueries({ queryKey: ["groupData"] });
      toast.success(t("delete project success"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      navigate("/");
    },
    onError: (error) => {
      toast.error(t("delete project unseccess"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.log("Delete project error:", error);
    },
  });
};

export const useEditNotification = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, value }: { type: string; value: boolean }) =>
      axiosClient.put(`/project/${id}/notification`, { type, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupProjectData", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["groupProjectData"] });
    },
    onError: (error) => {
      toast.error(t("error_save"), {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Edit notification error:", error);
    },
  });
};
