import { Event } from "@/app/services";
import { useQuery } from "@tanstack/react-query";

export const useGetEventById = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => await Event.getEventById(id),
    enabled: !!id,
  });
};
