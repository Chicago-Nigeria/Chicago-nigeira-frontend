'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse, IPost, Meta } from '@/app/types';
import {
  Search,
  MoreVertical,
  Trash2,
  Eye,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  FileText,
} from 'lucide-react';
import CreateBlogPostForm from './components/CreateBlogPostForm';
import { toast } from 'sonner';
import { Loader } from '@/app/components/loader';

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState<IPost | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<IPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const fetchPosts = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
    });

    const { data, error } = await callApi<ApiResponse<IPost[]> & { meta: Meta }>(
      `/admin/posts?${params}`,
      'GET'
    );

    if (!error && data) {
      setPosts(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    }
    setLoading(false);
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await callApi(
      `/admin/posts/${postId}`,
      'DELETE'
    );

    if (error) {
      toast.error(error.message || 'Failed to delete blog post');
    } else {
      toast.success('Blog post deleted successfully');
      fetchPosts();
      setShowDeleteModal(null);
      setShowDetailsModal(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleDropdownToggle = (postId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (showDropdown === postId) {
      setShowDropdown(null);
      return;
    }

    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = 120;

    const right = viewportWidth - buttonRect.right;

    if (spaceBelow >= dropdownHeight) {
      setDropdownStyle({ top: buttonRect.bottom + 8, right });
    } else if (spaceAbove >= dropdownHeight) {
      setDropdownStyle({ bottom: viewportHeight - buttonRect.top + 8, right });
    } else {
      if (spaceBelow >= spaceAbove) {
        setDropdownStyle({ top: buttonRect.bottom + 8, right });
      } else {
        setDropdownStyle({ bottom: viewportHeight - buttonRect.top + 8, right });
      }
    }

    setShowDropdown(postId);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Create and manage official blog posts for the community feed
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create Blog Post</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Posts Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="font-medium">No blog posts yet</p>
            <p className="text-sm mt-1">Create your first blog post to engage the community</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {truncateContent(post.content, 150)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {post.author.photo ? (
                            <Image
                              src={post.author.photo}
                              alt={`${post.author.firstName} ${post.author.lastName}`}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 text-sm font-medium">
                                {post.author.firstName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {post.author.firstName} {post.author.lastName}
                            </p>
                            <p className="text-xs text-emerald-600">Admin</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.images.length > 0 && (
                          <span className="mr-2">{post.images.length} image{post.images.length > 1 ? 's' : ''}</span>
                        )}
                        {post.videos.length > 0 && (
                          <span>{post.videos.length} video{post.videos.length > 1 ? 's' : ''}</span>
                        )}
                        {post.images.length === 0 && post.videos.length === 0 && 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post._count.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-4 w-4" />
                            {post._count.saves}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={(e) => handleDropdownToggle(post.id, e)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {showDropdown === post.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[100]"
                                onClick={() => setShowDropdown(null)}
                              />
                              <div
                                className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[101]"
                                style={{
                                  ...(dropdownStyle.top !== undefined && { top: dropdownStyle.top }),
                                  ...(dropdownStyle.bottom !== undefined && { bottom: dropdownStyle.bottom }),
                                  right: dropdownStyle.right,
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setShowDetailsModal(post);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Post
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDeleteModal(post);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Post
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && posts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <Loader />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No blog posts yet</p>
            <p className="text-sm mt-1">Create your first blog post</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">{truncateContent(post.content, 100)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-emerald-600 font-medium">
                        {post.author.firstName} {post.author.lastName}
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => handleDropdownToggle(post.id, e)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {showDropdown === post.id && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setShowDropdown(null)} />
                        <div
                          className="fixed w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-[101]"
                          style={{
                            ...(dropdownStyle.top !== undefined && { top: dropdownStyle.top }),
                            ...(dropdownStyle.bottom !== undefined && { bottom: dropdownStyle.bottom }),
                            right: dropdownStyle.right,
                          }}
                        >
                          <button
                            onClick={() => { setShowDetailsModal(post); setShowDropdown(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Post
                          </button>
                          <button
                            onClick={() => { setShowDeleteModal(post); setShowDropdown(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5" />
                    {post._count.saves}
                  </span>
                </div>
              </div>
            ))}

            {/* Pagination - Mobile */}
            {posts.length > 0 && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Delete Blog Post
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(showDeleteModal.id)}
                className="flex-1 px-3 md:px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Blog Post</h2>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Author */}
              <div className="flex items-center gap-3">
                {showDetailsModal.author.photo ? (
                  <Image
                    src={showDetailsModal.author.photo}
                    alt={`${showDetailsModal.author.firstName} ${showDetailsModal.author.lastName}`}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-lg font-medium">
                      {showDetailsModal.author.firstName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {showDetailsModal.author.firstName} {showDetailsModal.author.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(showDetailsModal.createdAt)}</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Official Blog
                </span>
              </div>

              {/* Post Content */}
              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">{showDetailsModal.content}</p>
              </div>

              {/* Media */}
              {(showDetailsModal.images.length > 0 || showDetailsModal.videos.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {showDetailsModal.images.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {showDetailsModal.videos.map((video, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <video
                        src={video}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="h-5 w-5" />
                  <span>{showDetailsModal._count.likes} likes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="h-5 w-5" />
                  <span>{showDetailsModal._count.comments} comments</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bookmark className="h-5 w-5" />
                  <span>{showDetailsModal._count.saves} saves</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(showDetailsModal);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBlogPostForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}
