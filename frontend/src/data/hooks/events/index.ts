import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../../api/events";

export const useGetEventsNew = () => {
  return useQuery({
    queryKey: ["events", "new"],
    queryFn: eventsApi.getEvntsNew
  });
};

export const useGetEvents = () => {
  return useQuery({
    queryKey: ["events", "viewed"],
    queryFn: eventsApi.getEvents
  });
};