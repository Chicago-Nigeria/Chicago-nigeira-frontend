import { Listing } from "@/app/services";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export interface ListingFilters {
  category?: string;
  search?: string;
  sort?: "recent" | "price_asc" | "price_desc" | "popular";
}

export const useListing = (filters?: ListingFilters) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["marketplace-posts", filters?.category, filters?.search, filters?.sort],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, unknown> = { page: pageParam ?? 1 };
      if (filters?.category && filters.category !== "All Categories") {
        params.category = filters.category;
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.sort && filters.sort !== "recent") {
        params.sort = filters.sort;
      }
      return await Listing.getAllListing(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.data?.meta;
      if (!meta) return undefined;

      return Number(meta.page) < Number(meta.totalPages)
        ? Number(meta.page) + 1
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
    refetch,
  };
};

export const useGetListingById = (id: string) => {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => await Listing.getListingById(id),
  });
};

export const useGetRelatedListings = (id: string) => {
  return useQuery({
    queryKey: ["related-listings", id],
    queryFn: async () => await Listing.getRelatedListings(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
