import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { t } from "i18next";
import axiosClient from "../../../common/axiosClient";
import { fetchData } from "../../../common/fetchData";

export const useSaveSelectedGroups = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (selectedGroups: Record<string, boolean>) => {
      const formattedGroups = Object.entries(selectedGroups).map(
        ([group_id, is_selected]) => ({
          group_id: Number(group_id),
          is_selected,
        }),
      );
      return axiosClient.post("/group/selector", formattedGroups);
    },
    onSuccess: () => {
      navigate("/");
      queryClient.invalidateQueries({ queryKey: ["groupsData"] });
      queryClient.invalidateQueries({ queryKey: ["groupSelect"] });
    },
    onError: (error) => {
      console.error("Error saving groups:", error);
      toast.error(t("error_save"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};

export const useGroups = () => {
  const fetchGroups = async () => {
    return await fetchData("/user/groups", {});
  };

  return useQuery({
    queryKey: ["groupsData"],
    queryFn: fetchGroups,
  });
};

export const useSuperGroups = (id: number) => {
  const fetchSuperGroups = async () => {
    return await fetchData(`/group/${id}`, {});
  };

  return useQuery({
    queryKey: ["groupData", id],
    queryFn: () => fetchSuperGroups(),
    refetchOnReconnect: true,
  });
};
