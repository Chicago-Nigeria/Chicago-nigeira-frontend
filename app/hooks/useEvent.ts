import { Event } from "@/app/services";
import { useQuery } from "@tanstack/react-query";

export const useGetEventById = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => await Event.getEventById(id),
    enabled: !!id,
  });
};

export const useGetEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["event", "slug", slug],
    queryFn: async () => await Event.getEventBySlug(slug),
    enabled: !!slug,
  });
};
