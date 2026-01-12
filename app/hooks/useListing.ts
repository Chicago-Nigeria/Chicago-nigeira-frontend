import { Listing } from "@/app/services";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useListing = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["marketplace-posts"],
    queryFn: async ({ pageParam }) =>
      await Listing.getAllListing({ page: pageParam ?? 1 } as any),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      console.log(lastPage);

      return Number(lastPage.data?.data.meta.page) <
        Number(lastPage.data?.data.meta.totalPages)
        ? Number(lastPage.data?.data.meta.page) + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  };
};

export const useGetListingById = (id: string) => {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => await Listing.getListingById(id),
  });
};
