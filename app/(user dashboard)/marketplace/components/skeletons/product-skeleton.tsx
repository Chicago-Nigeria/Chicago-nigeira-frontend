import { PostCardSkeleton } from "../client/postCard";

export default function MarketplaceProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {[...Array(4)].map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}
