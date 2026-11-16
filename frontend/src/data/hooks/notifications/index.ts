import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { t } from "i18next";
import { notificationApi } from "../../api/notifications";

export const useChangeNotificationAll = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, value }: { id: string | undefined; value: boolean }) =>
      notificationApi.changeNotification(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupProjectData"] });
    },
    onError: () => {
      toast.error(t("error_save"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  return { ...mutation };
};

export const useChangeNotificationStatusAll = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, value }: { id: string | undefined; value: boolean }) =>
      notificationApi.changeNotificationStatus(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupProjectData"] });
    },
    onError: () => {
      toast.error(t("error_save"), {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  return { ...mutation };
};
