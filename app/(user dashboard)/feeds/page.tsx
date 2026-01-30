"use client";
import { useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import {
  BriefcaseConveyorBelt,
  ChartNoAxesColumnIncreasing,
  Filter,
  MapPin,
  UsersRound,
  Loader2,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePosts, usePromotedContent, useFeaturedBlogPosts, useCommunityStats, FeedFilter } from "@/app/hooks/usePost";
import PostCard from "./components/PostCard";
import PromotedEventCard from "./components/PromotedEventCard";
import BlogPostCard from "./components/BlogPostCard";
import CreatePostForm from "./components/CreatePostForm";
import NewPostsBanner from "./components/NewPostsBanner";
import { IPromotedContent, IPost } from "@/app/types";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";

// Show promoted content or blog post every 4 posts
const POSTS_BETWEEN_INTERLEAVED = 4;

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const { user } = useSession((state) => state);
  const { openSignIn } = useAuthModal((state) => state.actions);

  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    newPostsCount,
    loadNewPosts,
  } = usePosts(activeFilter);

  const { data: promotedContent = [] } = usePromotedContent();
  const { data: featuredBlogPosts = [] } = useFeaturedBlogPosts();
  const { data: communityStats } = useCommunityStats();

  const { ref, inView } = useInView();

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Interleave posts with promoted content and blog posts
  // Algorithm:
  // - Shows interleaved content every 4 posts (or after all posts if fewer than 4)
  // - Alternates between promoted events and blog posts
  // - Shows on both "all" and "following" tabs (but not "blogs" tab)
  const interleavedFeed = useMemo(() => {
    if (activeFilter === 'blogs') {
      // Don't show interleaved content in blogs filter - it's already showing blog posts
      return posts.map(post => ({ type: 'post' as const, data: post }));
    }

    const result: Array<{ type: 'post' | 'promoted' | 'blog'; data: IPost | IPromotedContent }> = [];
    let promotedIndex = 0;
    let blogIndex = 0;
    let interleavedCount = 0; // Tracks which type to show next (even = promoted, odd = blog)

    // Get the post IDs that are regular posts (to exclude from blog interleaving)
    const postIds = new Set(posts.map(p => p.id));
    // Filter blog posts to exclude ones already in the feed
    const availableBlogPosts = featuredBlogPosts.filter(bp => !postIds.has(bp.id));

    // Helper to get next interleaved content
    const getNextInterleavedContent = () => {
      // Alternate between promoted and blog posts
      if (interleavedCount % 2 === 0) {
        // Try promoted first
        if (promotedContent[promotedIndex]) {
          interleavedCount++;
          return { type: 'promoted' as const, data: promotedContent[promotedIndex++] };
        }
        // Fall back to blog if no promoted
        if (availableBlogPosts[blogIndex]) {
          interleavedCount++;
          return { type: 'blog' as const, data: availableBlogPosts[blogIndex++] };
        }
      } else {
        // Try blog first
        if (availableBlogPosts[blogIndex]) {
          interleavedCount++;
          return { type: 'blog' as const, data: availableBlogPosts[blogIndex++] };
        }
        // Fall back to promoted if no blog
        if (promotedContent[promotedIndex]) {
          interleavedCount++;
          return { type: 'promoted' as const, data: promotedContent[promotedIndex++] };
        }
      }
      return null;
    };

    // If we have posts, interleave content every POSTS_BETWEEN_INTERLEAVED posts
    if (posts.length > 0) {
      posts.forEach((post, i) => {
        result.push({ type: 'post', data: post });

        // Insert interleaved content every POSTS_BETWEEN_INTERLEAVED posts
        if ((i + 1) % POSTS_BETWEEN_INTERLEAVED === 0) {
          const interleaved = getNextInterleavedContent();
          if (interleaved) {
            result.push(interleaved);
          }
        }
      });

      // If we have fewer than POSTS_BETWEEN_INTERLEAVED posts but have interleaved content,
      // show one at the end
      if (posts.length < POSTS_BETWEEN_INTERLEAVED && posts.length > 0) {
        const interleaved = getNextInterleavedContent();
        if (interleaved) {
          result.push(interleaved);
        }
      }
    }

    return result;
  }, [posts, promotedContent, featuredBlogPosts, activeFilter]);

  const handleFilterChange = (filter: FeedFilter) => {
    // Check auth for 'following' filter
    if (filter === 'following' && !user) {
      openSignIn('view posts from people you follow');
      return;
    }
    setActiveFilter(filter);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <section className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 items-stretch bg-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-gray-200 shadow-sm user-page-top button-hover-effect scrollbar-hide">
          <button
            onClick={() => handleFilterChange('all')}
            className={`whitespace-nowrap shrink-0 ${activeFilter === 'all' ? 'text-white bg-[var(--primary-color)]' : ''}`}
          >
            All Posts
          </button>
          <button
            onClick={() => handleFilterChange('following')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeFilter === 'following' ? 'text-white bg-[var(--primary-color)]' : ''}`}
          >
            <Users className="w-3.5 h-3.5" />
            Following
          </button>
          <button
            onClick={() => handleFilterChange('blogs')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeFilter === 'blogs' ? 'text-white bg-[var(--primary-color)]' : ''}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Blog Posts
          </button>
          <button className="whitespace-nowrap shrink-0">My Networks</button>
          <button className="ml-auto px-3 py-1.5 whitespace-nowrap shrink-0">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Create Post Form - Only show for 'all' filter */}
        {activeFilter === 'all' && <CreatePostForm />}

        {/* New Posts Banner */}
        {newPostsCount > 0 && (
          <NewPostsBanner count={newPostsCount} onLoad={loadNewPosts} />
        )}

        {/* Posts List with Interleaved Promoted Content */}
        <div className="space-y-4">
          {status === "pending" ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            </div>
          ) : status === "error" ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p>Failed to load posts</p>
              <button
                onClick={() => loadNewPosts()}
                className="mt-2 text-[var(--primary-color)] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="font-medium">
                {activeFilter === 'blogs'
                  ? 'No blog posts yet'
                  : activeFilter === 'following'
                  ? 'No posts from people you follow'
                  : 'No posts yet'}
              </p>
              <p className="text-sm mt-1">
                {activeFilter === 'blogs'
                  ? 'Check back later for official updates!'
                  : activeFilter === 'following'
                  ? 'Follow some people to see their posts here!'
                  : 'Be the first to share something!'}
              </p>
            </div>
          ) : (
            interleavedFeed.map((item) => {
              if (item.type === 'post') {
                return <PostCard key={`post-${item.data.id}`} post={item.data as IPost} />;
              } else if (item.type === 'promoted') {
                return (
                  <PromotedEventCard
                    key={`promoted-${(item.data as IPromotedContent).id}`}
                    promotedContent={item.data as IPromotedContent}
                  />
                );
              } else if (item.type === 'blog') {
                return (
                  <BlogPostCard
                    key={`blog-${(item.data as IPost).id}`}
                    post={item.data as IPost}
                  />
                );
              }
              return null;
            })
          )}

          {/* Infinite scroll trigger */}
          <div ref={ref} className="h-10 flex justify-center items-center">
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)]" />
            )}
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <aside className="sticky top-24 h-fit hidden lg:block space-y-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
            <span>Community Stats</span>
            <ChartNoAxesColumnIncreasing className="w-5 h-5 text-[var(--primary-color)]" />
          </h2>
          <div className="space-y-3 community-stats-items">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-sm font-semibold text-gray-900">
                {communityStats?.activeMembers?.toLocaleString() ?? '-'}
              </p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">Posts Today</p>
              <p className="text-sm font-semibold text-gray-900">
                {communityStats?.postsToday?.toLocaleString() ?? '-'}
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-gray-600">Events This Week</p>
              <p className="text-sm font-semibold text-gray-900">
                {communityStats?.eventsThisWeek?.toLocaleString() ?? '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          {/* Popular Categories - Commented out for now
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Popular Categories
          </h2>
          <div className="space-y-3 community-stats-items">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">Fashion</p>
              <p className="text-sm font-semibold text-gray-900">28</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">Services</p>
              <p className="text-sm font-semibold text-gray-900">34</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">Food</p>
              <p className="text-sm font-semibold text-gray-900">23</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-gray-600">Housing</p>
              <p className="text-sm font-semibold text-gray-900">8</p>
            </div>
          </div>
          <hr className="border-gray-200 my-4" />
          */}

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Quick Links
            </h2>
            <div className="space-y-2">
              <Link
                href="/events"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
              >
                <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                <span>Find Local Events</span>
              </Link>
              <Link
                href="/groups"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
              >
                <UsersRound className="w-4 h-4 text-[var(--primary-color)]" />
                <span>Join Groups</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
              >
                <BriefcaseConveyorBelt className="w-4 h-4 text-[var(--primary-color)]" />
                <span>Browse Marketplace</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
