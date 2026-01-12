/* eslint-disable @typescript-eslint/no-namespace */
import { callApi } from "../libs/helper/callApi";
import { ApiResponse, IListing, PaginatedData } from "../types";

export namespace Listing {
  export const getAllListing = (params?: Record<string, unknown>) => {
    const queryString = params
      ? new URLSearchParams(
          params as unknown as Record<string, string>
        ).toString()
      : "";

    return callApi<ApiResponse<PaginatedData<IListing>>>(
      `/listing?${queryString}`
    );
  };

  export const getListingById = (id: string) => {
    return callApi<ApiResponse<IListing>>(`/listing/${id}`);
  };
}
