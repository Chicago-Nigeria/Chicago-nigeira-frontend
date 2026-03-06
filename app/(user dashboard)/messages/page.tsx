"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  ChevronLeft,
  Paperclip,
  Send,
  MoreVertical,
  CheckCheck,
  Check,
  Clock3,
  Loader2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/app/store/useSession";
import { callApi } from "@/app/libs/helper/callApi";

type ChatUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string | null;
  profession?: string | null;
  location?: string | null;
};

type ChatMessage = {
  id: string;
  content: string;
  images: string[];
  videos: string[];
  isRead: boolean;
  readAt?: string | null;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: ChatUser;
  receiver: ChatUser;
  sendState?: "sending" | "sent" | "failed";
  retryPayload?: {
    content: string;
    files: File[];
    imagePreviewUrls: string[];
    videoPreviewUrls: string[];
  };
};

type Conversation = {
  user: ChatUser;
  unreadCount: number;
  lastMessage: {
    id: string;
    content: string;
    images: string[];
    videos: string[];
    senderId: string;
    receiverId: string;
    isRead: boolean;
    readAt?: string | null;
    createdAt: string;
  };
  lastActivityAt: string;
};

type ConversationsResponse = {
  success: boolean;
  data: Conversation[];
};

type MessagesResponse = {
  success: boolean;
  data: ChatMessage[];
  meta?: {
    hasMore: boolean;
    nextCursor: string | null;
    limit: number;
  };
  conversationUser?: ChatUser;
};

type SendMessageResponse = {
  success: boolean;
  data: ChatMessage;
};

type MarkReadResponse = {
  success: boolean;
  data: {
    count: number;
    messageIds: string[];
    readAt?: string;
  };
};

type SearchUsersResponse = {
  success: boolean;
  data: ChatUser[];
};

type PublicProfileResponse = {
  success: boolean;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    photo?: string | null;
    profession?: string | null;
    location?: string | null;
  };
};

type MessageReadEvent = {
  messageIds: string[];
  readerId: string;
  conversationUserId: string;
  readAt: string;
};

type ThreadCacheEntry = {
  messages: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
  savedAt: string;
};

type PersistedMessagesState = {
  version: number;
  savedAt: string;
  conversations: Conversation[];
  draftConversationUser: ChatUser | null;
  activeConversationId: string | null;
  isMobileChatView: boolean;
  threads: Record<string, ThreadCacheEntry>;
};

const MESSAGES_CACHE_VERSION = 1;
const MESSAGES_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const MAX_PERSISTED_THREADS = 12;
const MAX_PERSISTED_MESSAGES_PER_THREAD = 120;
const getMessagesCacheKey = (userId: string) => `messages-page-cache:${userId}`;

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatRelative = (value: string) => {
  const now = new Date().getTime();
  const date = new Date(value).getTime();
  const diff = Math.max(0, now - date);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return new Date(value).toLocaleDateString();
};

const sortByCreatedAt = (items: ChatMessage[]) =>
  [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const getMessageDayKey = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatMessageDayLabel = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const asDayValue = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayValue = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayValue = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  ).getTime();

  if (asDayValue === todayValue) return "Today";
  if (asDayValue === yesterdayValue) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const conversationPreview = (conversation: Conversation) => {
  if (conversation.lastMessage.content) return conversation.lastMessage.content;
  if ((conversation.lastMessage.images || []).length && (conversation.lastMessage.videos || []).length) {
    return "Shared media";
  }
  if ((conversation.lastMessage.images || []).length) return "Shared an image";
  if ((conversation.lastMessage.videos || []).length) return "Shared a video";
  return "Start a conversation";
};

const fullName = (user: ChatUser) => `${user.firstName || ""} ${user.lastName || ""}`.trim();

const getApiStreamBase = () => {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api";
  const normalizedApi = api.replace(/\/+$/, "");
  return normalizedApi.endsWith("/api") ? normalizedApi.slice(0, -4) : normalizedApi;
};

const getStoredAccessToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") || "";
};

const createDraftConversation = (chatUser: ChatUser): Conversation => {
  const now = new Date().toISOString();
  return {
    user: chatUser,
    unreadCount: 0,
    lastMessage: {
      id: `draft-${chatUser.id}`,
      content: "",
      images: [],
      videos: [],
      senderId: chatUser.id,
      receiverId: chatUser.id,
      isRead: true,
      readAt: now,
      createdAt: now,
    },
    lastActivityAt: now,
  };
};

const upsertConversationFromMessage = (
  prev: Conversation[],
  message: ChatMessage,
  authUserId: string,
  activeConversationId: string | null
) => {
  const otherUser = message.senderId === authUserId ? message.receiver : message.sender;
  const conversationId = otherUser.id;

  const index = prev.findIndex((item) => item.user.id === conversationId);
  const unreadIncrement =
    message.receiverId === authUserId && activeConversationId !== conversationId && !message.isRead ? 1 : 0;

  const baseConversation: Conversation = {
    user: otherUser,
    unreadCount: unreadIncrement,
    lastMessage: {
      id: message.id,
      content: message.content,
      images: message.images || [],
      videos: message.videos || [],
      senderId: message.senderId,
      receiverId: message.receiverId,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt,
    },
    lastActivityAt: message.createdAt,
  };

  let next: Conversation[];
  if (index === -1) {
    next = [baseConversation, ...prev];
  } else {
    next = [...prev];
    next[index] = {
      ...next[index],
      user: otherUser,
      unreadCount: Math.max(0, next[index].unreadCount + unreadIncrement),
      lastMessage: baseConversation.lastMessage,
      lastActivityAt: message.createdAt,
    };
  }

  return next.sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
};

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const { user, loading } = useSession((state) => state);
  const authUserId = (user?.id || user?._id || "") as string;
  const deepLinkUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationSearch, setConversationSearch] = useState("");
  const [newChatResults, setNewChatResults] = useState<ChatUser[]>([]);
  const [searchingNewUsers, setSearchingNewUsers] = useState(false);
  const [draftConversationUser, setDraftConversationUser] = useState<ChatUser | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [streamConnected, setStreamConnected] = useState(false);
  const [isMobileChatView, setIsMobileChatView] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [restoredFromCache, setRestoredFromCache] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const threadCacheRef = useRef<Record<string, ThreadCacheEntry>>({});
  const draftConversationUserRef = useRef<ChatUser | null>(null);
  const deepLinkHandledForRef = useRef<string | null>(null);
  const deepLinkResolvingForRef = useRef<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const sseReconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseReconnectAttemptsRef = useRef(0);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.user.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const authChatUser = useMemo<ChatUser>(
    () => ({
      id: authUserId,
      firstName: (user as { firstName?: string } | null)?.firstName || "You",
      lastName: (user as { lastName?: string } | null)?.lastName || "",
      email: (user as { email?: string } | null)?.email || "",
      photo: (user as { photo?: string | null } | null)?.photo || null,
      profession: (user as { profession?: string | null } | null)?.profession || null,
      location: (user as { location?: string | null } | null)?.location || null,
    }),
    [authUserId, user]
  );

  const selectedFilePreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isImage: file.type.startsWith("image/"),
        isVideo: file.type.startsWith("video/"),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    draftConversationUserRef.current = draftConversationUser;
  }, [draftConversationUser]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    return () => {
      selectedFilePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedFilePreviews]);

  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const writeThreadCache = useCallback(
    (conversationId: string, thread: { messages: ChatMessage[]; nextCursor: string | null; hasMore: boolean }) => {
      if (!conversationId) return;

      threadCacheRef.current[conversationId] = {
        messages: sortByCreatedAt(thread.messages),
        nextCursor: thread.nextCursor,
        hasMore: thread.hasMore,
        savedAt: new Date().toISOString(),
      };
    },
    []
  );

  const hydrateThreadFromCache = useCallback((conversationId: string) => {
    if (!conversationId) return false;

    const cachedThread = threadCacheRef.current[conversationId];
    if (!cachedThread) return false;

    setMessages(cachedThread.messages || []);
    setNextCursor(cachedThread.nextCursor || null);
    setHasMore(!!cachedThread.hasMore);
    setLoadingMessages(false);
    return true;
  }, []);

  useEffect(() => {
    if (!authUserId) {
      threadCacheRef.current = {};
      setStorageHydrated(false);
      setRestoredFromCache(false);
      return;
    }

    const cacheKey = getMessagesCacheKey(authUserId);
    let restored = false;

    try {
      const rawCache = localStorage.getItem(cacheKey);
      if (!rawCache) {
        setStorageHydrated(true);
        setRestoredFromCache(false);
        return;
      }

      const parsedCache = JSON.parse(rawCache) as PersistedMessagesState;
      const isVersionValid = parsedCache?.version === MESSAGES_CACHE_VERSION;
      const cacheAgeMs = Date.now() - new Date(parsedCache?.savedAt || 0).getTime();
      const isFresh = Number.isFinite(cacheAgeMs) && cacheAgeMs <= MESSAGES_CACHE_TTL_MS;

      if (!isVersionValid || !isFresh) {
        localStorage.removeItem(cacheKey);
      } else {
        const restoredThreads = Object.entries(parsedCache.threads || {}).reduce<Record<string, ThreadCacheEntry>>(
          (acc, [conversationId, thread]) => {
            if (!thread || !Array.isArray(thread.messages)) return acc;

            acc[conversationId] = {
              messages: sortByCreatedAt(thread.messages).slice(-MAX_PERSISTED_MESSAGES_PER_THREAD),
              nextCursor: typeof thread.nextCursor === "string" ? thread.nextCursor : null,
              hasMore: !!thread.hasMore,
              savedAt: typeof thread.savedAt === "string" ? thread.savedAt : new Date().toISOString(),
            };

            return acc;
          },
          {}
        );

        threadCacheRef.current = restoredThreads;

        const restoredDraftConversationUser = parsedCache.draftConversationUser || null;
        draftConversationUserRef.current = restoredDraftConversationUser;
        setDraftConversationUser(restoredDraftConversationUser);
        setConversations(Array.isArray(parsedCache.conversations) ? parsedCache.conversations : []);

        // Always start on the conversation list — don't auto-open any thread
        setLoadingConversations(false);
        restored = true;
      }
    } catch (error) {
      console.error("Failed to restore message cache", error);
    }

    setRestoredFromCache(restored);
    setStorageHydrated(true);
  }, [authUserId]);

  useEffect(() => {
    if (!activeConversationId) return;

    writeThreadCache(activeConversationId, {
      messages,
      nextCursor,
      hasMore,
    });
  }, [activeConversationId, hasMore, messages, nextCursor, writeThreadCache]);

  useEffect(() => {
    if (!authUserId || !storageHydrated) return;

    if (activeConversationId) {
      writeThreadCache(activeConversationId, {
        messages,
        nextCursor,
        hasMore,
      });
    }

    const nextThreads = Object.entries(threadCacheRef.current)
      .sort(([, a], [, b]) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, MAX_PERSISTED_THREADS)
      .reduce<Record<string, ThreadCacheEntry>>((acc, [conversationId, thread]) => {
        acc[conversationId] = {
          messages: sortByCreatedAt(thread.messages)
            .slice(-MAX_PERSISTED_MESSAGES_PER_THREAD)
            .map((message) => ({
              ...message,
              sendState:
                message.sendState === "sent" || message.sendState === "failed"
                  ? message.sendState
                  : undefined,
              retryPayload: undefined,
            })),
          nextCursor: thread.nextCursor || null,
          hasMore: !!thread.hasMore,
          savedAt: thread.savedAt || new Date().toISOString(),
        };
        return acc;
      }, {});

    threadCacheRef.current = nextThreads;

    const cachePayload: PersistedMessagesState = {
      version: MESSAGES_CACHE_VERSION,
      savedAt: new Date().toISOString(),
      conversations,
      draftConversationUser,
      activeConversationId,
      isMobileChatView,
      threads: nextThreads,
    };

    localStorage.setItem(getMessagesCacheKey(authUserId), JSON.stringify(cachePayload));
  }, [
    activeConversationId,
    authUserId,
    conversations,
    draftConversationUser,
    hasMore,
    isMobileChatView,
    messages,
    nextCursor,
    storageHydrated,
    writeThreadCache,
  ]);

  const markConversationAsRead = useCallback(
    async (otherUserId: string) => {
      if (!otherUserId) return;

      const { data, error } = await callApi<MarkReadResponse>(
        `/messages/with/${otherUserId}/read`,
        "PUT"
      );

      if (error) return;
      if (!data?.data?.messageIds?.length) return;

      const readAt = data.data.readAt || new Date().toISOString();
      setMessages((prev) =>
        prev.map((msg) =>
          data.data.messageIds.includes(msg.id)
            ? { ...msg, isRead: true, readAt }
            : msg
        )
      );
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === otherUserId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    },
    []
  );

  const startConversationWithUser = useCallback((chatUser: ChatUser) => {
    draftConversationUserRef.current = chatUser;
    setDraftConversationUser(chatUser);
    setConversations((prev) => {
      if (prev.some((conv) => conv.user.id === chatUser.id)) return prev;
      return [createDraftConversation(chatUser), ...prev];
    });
    setActiveConversationId(chatUser.id);
    setIsMobileChatView(true);
    setMessages([]);
    setHasMore(false);
    setNextCursor(null);
    setLoadingMessages(false);
    writeThreadCache(chatUser.id, {
      messages: [],
      nextCursor: null,
      hasMore: false,
    });
  }, [writeThreadCache]);

  const fetchConversations = useCallback(
    async (searchValue = "", silent = false) => {
      if (!authUserId) return;
      if (!silent) {
        setLoadingConversations(true);
      }

      const query = searchValue.trim() ? `?search=${encodeURIComponent(searchValue.trim())}` : "";
      const { data, error } = await callApi<ConversationsResponse>(`/messages${query}`, "GET");

      if (error) {
        if (!silent) {
          toast.error(error.message || "Failed to load conversations");
          setConversations([]);
          setLoadingConversations(false);
        }
        return;
      }

      const nextConversations = data?.data || [];
      const currentDraft = draftConversationUserRef.current;
      const hasDraftInServerData =
        !!currentDraft &&
        nextConversations.some((item) => item.user.id === currentDraft.id);

      const mergedConversations =
        currentDraft && !hasDraftInServerData
          ? [createDraftConversation(currentDraft), ...nextConversations]
          : nextConversations;

      setConversations(mergedConversations);

      if (hasDraftInServerData) {
        draftConversationUserRef.current = null;
        setDraftConversationUser(null);
      }

      setActiveConversationId((prev) => {
        if (prev && mergedConversations.some((item) => item.user.id === prev)) return prev;
        return null;
      });
      if (!silent) {
        setLoadingConversations(false);
      }
    },
    [authUserId]
  );

  const fetchMessages = useCallback(
    async (
      otherUserId: string,
      cursor?: string | null,
      append = false,
      silent = false
    ) => {
      if (!otherUserId) return;

      if (append) {
        setLoadingMore(true);
      } else if (!silent) {
        setLoadingMessages(true);
      }

      const qs = new URLSearchParams();
      qs.set("limit", "50");
      if (cursor) qs.set("cursor", cursor);

      const { data, error } = await callApi<MessagesResponse>(
        `/messages/${otherUserId}?${qs.toString()}`,
        "GET"
      );

      if (error) {
        if (!silent) {
          toast.error(error.message || "Failed to load messages");
        }
        if (!silent) setLoadingMessages(false);
        setLoadingMore(false);
        return;
      }

      const incoming = data?.data || [];
      const conversationUser = data?.conversationUser;

      if (conversationUser) {
        setConversations((prev) => {
          const index = prev.findIndex((conv) => conv.user.id === conversationUser.id);
          if (index === -1) {
            return [createDraftConversation(conversationUser), ...prev];
          }
          const next = [...prev];
          next[index] = { ...next[index], user: conversationUser };
          return next;
        });
      }

      const resolvedNextCursor = data?.meta?.nextCursor || null;
      const resolvedHasMore = !!data?.meta?.hasMore;
      setNextCursor(resolvedNextCursor);
      setHasMore(resolvedHasMore);

      let nextMessagesSnapshot: ChatMessage[] = [];
      setMessages((prev) => {
        if (!append) {
          const serverIds = new Set(incoming.map((msg) => msg.id));
          const localPending = prev.filter((msg) => {
            const isSameConversation =
              (msg.senderId === authUserId && msg.receiverId === otherUserId) ||
              (msg.senderId === otherUserId && msg.receiverId === authUserId);
            return isSameConversation && (msg.sendState === "sending" || msg.sendState === "failed");
          });
          const pendingWithoutDupes = localPending.filter((msg) => !serverIds.has(msg.id));
          nextMessagesSnapshot = [...incoming, ...pendingWithoutDupes].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return nextMessagesSnapshot;
        }
        const existingIds = new Set(prev.map((msg) => msg.id));
        const merged = [...incoming.filter((msg) => !existingIds.has(msg.id)), ...prev];
        nextMessagesSnapshot = merged.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return nextMessagesSnapshot;
      });

      writeThreadCache(otherUserId, {
        messages: nextMessagesSnapshot,
        nextCursor: resolvedNextCursor,
        hasMore: resolvedHasMore,
      });

      if (!silent) setLoadingMessages(false);
      setLoadingMore(false);

      if (!append) {
        setTimeout(scrollToBottom, 30);
      }

      await markConversationAsRead(otherUserId);
    },
    [authUserId, markConversationAsRead, scrollToBottom, writeThreadCache]
  );

  const cleanupSse = useCallback(() => {
    if (sseReconnectTimerRef.current) {
      clearTimeout(sseReconnectTimerRef.current);
      sseReconnectTimerRef.current = null;
    }
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
  }, []);

  const attachSse = useCallback(() => {
    if (!authUserId) return;
    if (sseRef.current) return;

    const streamBase = getApiStreamBase();
    const streamUrl = new URL(`${streamBase}/api/messages/stream`);
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      streamUrl.searchParams.set("accessToken", accessToken);
    }

    const source = new EventSource(streamUrl.toString(), {
      withCredentials: true,
    });

    source.onopen = () => {
      sseReconnectAttemptsRef.current = 0;
      setStreamConnected(true);
    };

    source.addEventListener("connected", () => {
      sseReconnectAttemptsRef.current = 0;
      setStreamConnected(true);
    });

    source.addEventListener("message:new", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as ChatMessage;
        const currentActiveId = activeConversationIdRef.current;

        setConversations((prev) =>
          upsertConversationFromMessage(prev, payload, authUserId, currentActiveId)
        );

        const otherUserId = payload.senderId === authUserId ? payload.receiverId : payload.senderId;
        if (draftConversationUserRef.current?.id === otherUserId) {
          draftConversationUserRef.current = null;
          setDraftConversationUser(null);
        }
        if (currentActiveId === otherUserId) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === payload.id)) return prev;
            return [...prev, payload].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

          if (payload.receiverId === authUserId) {
            void markConversationAsRead(otherUserId);
          }

          setTimeout(scrollToBottom, 30);
        }
      } catch (error) {
        console.error("Failed to parse message:new event", error);
      }
    });

    source.addEventListener("message:read", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as MessageReadEvent;
        const idSet = new Set(payload.messageIds || []);

        setMessages((prev) =>
          prev.map((msg) => (idSet.has(msg.id) ? { ...msg, isRead: true, readAt: payload.readAt } : msg))
        );

        setConversations((prev) =>
          prev.map((conv) => {
            const isAffectedConversation =
              conv.user.id === payload.conversationUserId || conv.user.id === payload.readerId;
            if (!isAffectedConversation) return conv;
            const updatedLast =
              conv.lastMessage && idSet.has(conv.lastMessage.id)
                ? { ...conv.lastMessage, isRead: true, readAt: payload.readAt }
                : conv.lastMessage;
            return { ...conv, unreadCount: 0, lastMessage: updatedLast };
          })
        );
      } catch (error) {
        console.error("Failed to parse message:read event", error);
      }
    });

    source.onerror = () => {
      setStreamConnected(false);
      // Close the failed connection and schedule a reconnect with backoff
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      const attempts = sseReconnectAttemptsRef.current;
      const delay = Math.min(2000 * Math.pow(2, attempts), 30000);
      sseReconnectAttemptsRef.current = attempts + 1;
      sseReconnectTimerRef.current = setTimeout(() => {
        sseReconnectTimerRef.current = null;
        attachSse();
      }, delay);
    };

    sseRef.current = source;
  }, [authUserId, markConversationAsRead, scrollToBottom]);

  useEffect(() => {
    if (!authUserId || !storageHydrated) return;

    void fetchConversations("", restoredFromCache);
    attachSse();

    const interval = setInterval(() => {
      void fetchConversations("", true);
    }, 30000);

    return () => {
      clearInterval(interval);
      cleanupSse();
    };
  }, [attachSse, authUserId, cleanupSse, fetchConversations, restoredFromCache, storageHydrated]);

  useEffect(() => {
    if (!activeConversationId || !storageHydrated) return;

    const hasCachedThread = hydrateThreadFromCache(activeConversationId);
    if (hasCachedThread) {
      void fetchMessages(activeConversationId, null, false, true);
      return;
    }

    void fetchMessages(activeConversationId);
  }, [activeConversationId, fetchMessages, hydrateThreadFromCache, storageHydrated]);

  useEffect(() => {
    if (activeConversationId) return;
    setIsMobileChatView(false);
  }, [activeConversationId]);

  useEffect(() => {
    if (!expandedImageUrl) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedImageUrl(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedImageUrl]);

  useEffect(() => {
    if (!activeConversationId) return;

    const intervalMs = streamConnected ? 15000 : 8000;
    const fallbackPoll = setInterval(() => {
      void fetchMessages(activeConversationId, null, false, true);
    }, intervalMs);

    return () => clearInterval(fallbackPoll);
  }, [activeConversationId, fetchMessages, streamConnected]);

  useEffect(() => {
    if (!authUserId || !storageHydrated) return;

    const refreshSilently = () => {
      void fetchConversations("", true);
      const currentActiveConversationId = activeConversationIdRef.current;
      if (currentActiveConversationId) {
        void fetchMessages(currentActiveConversationId, null, false, true);
      }
    };

    const handleFocus = () => {
      refreshSilently();
      attachSse();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      refreshSilently();
      attachSse();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attachSse, authUserId, fetchConversations, fetchMessages, storageHydrated]);

  useEffect(() => {
    if (!authUserId) return;

    const query = conversationSearch.trim();
    if (query.length < 2) {
      setNewChatResults([]);
      setSearchingNewUsers(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchingNewUsers(true);
      const { data, error } = await callApi<SearchUsersResponse>(
        `/users/search?q=${encodeURIComponent(query)}&limit=8`,
        "GET"
      );

      if (cancelled) return;
      setSearchingNewUsers(false);

      if (error) {
        setNewChatResults([]);
        return;
      }

      setNewChatResults(data?.data || []);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authUserId, conversationSearch]);

  useEffect(() => {
    if (!deepLinkUserId) {
      deepLinkHandledForRef.current = null;
      deepLinkResolvingForRef.current = null;
    }
  }, [deepLinkUserId]);

  useEffect(() => {
    if (!authUserId || !deepLinkUserId) return;
    if (deepLinkUserId === authUserId) return;
    if (deepLinkHandledForRef.current === deepLinkUserId) return;
    if (deepLinkResolvingForRef.current === deepLinkUserId) return;

    const existingConversation = conversations.find((conv) => conv.user.id === deepLinkUserId);
    if (existingConversation) {
      setActiveConversationId(deepLinkUserId);
      setIsMobileChatView(true);
      deepLinkHandledForRef.current = deepLinkUserId;
      return;
    }

    let cancelled = false;
    deepLinkResolvingForRef.current = deepLinkUserId;
    const hydrateConversationFromProfile = async () => {
      const { data, error } = await callApi<PublicProfileResponse>(`/users/${deepLinkUserId}`, "GET");

      if (cancelled) return;
      if (error || !data?.data?.id) {
        toast.error("Unable to open this conversation");
        deepLinkResolvingForRef.current = null;
        return;
      }

      startConversationWithUser({
        id: data.data.id,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        email: "",
        photo: data.data.photo || null,
        profession: data.data.profession || null,
        location: data.data.location || null,
      });
      deepLinkHandledForRef.current = deepLinkUserId;
      deepLinkResolvingForRef.current = null;
    };

    void hydrateConversationFromProfile();
    return () => {
      cancelled = true;
      if (deepLinkResolvingForRef.current === deepLinkUserId) {
        deepLinkResolvingForRef.current = null;
      }
    };
  }, [authUserId, conversations, deepLinkUserId, startConversationWithUser]);

  const handleStartChatWithUser = (chatUser: ChatUser) => {
    startConversationWithUser(chatUser);
    setConversationSearch("");
    setNewChatResults([]);
  };

  const handleSelectConversation = (userId: string) => {
    const hasCachedThread = hydrateThreadFromCache(userId);
    if (!hasCachedThread) {
      setMessages([]);
      setNextCursor(null);
      setHasMore(false);
    }
    setActiveConversationId(userId);
    setIsMobileChatView(true);
  };

  const handleBackToConversations = useCallback(() => {
    setIsMobileChatView(false);
    setActiveConversationId(null);
    setMessages([]);
    setHasMore(false);
    setNextCursor(null);
  }, []);

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files || []);
    if (!picked.length) return;

    const allowed = picked.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (allowed.length !== picked.length) {
      toast.error("Only image/video files are supported");
    }

    setSelectedFiles((prev) => [...prev, ...allowed].slice(0, 8));
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessageRequest = useCallback(
    async (receiverId: string, content: string, files: File[]) => {
      const formData = new FormData();
      formData.append("receiverId", receiverId);
      if (content.trim()) {
        formData.append("content", content.trim());
      }
      files.forEach((file) => formData.append("media", file));

      return callApi<SendMessageResponse>("/messages", "POST", formData);
    },
    []
  );

  const handleSendMessage = async () => {
    if (!activeConversationId || !authUserId || sending || !activeConversation?.user) return;

    const trimmed = messageInput.trim();
    const filesSnapshot = [...selectedFiles];
    if (!trimmed && filesSnapshot.length === 0) return;

    const imagePreviewUrls = filesSnapshot
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));
    const videoPreviewUrls = filesSnapshot
      .filter((file) => file.type.startsWith("video/"))
      .map((file) => URL.createObjectURL(file));

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      content: trimmed,
      images: imagePreviewUrls,
      videos: videoPreviewUrls,
      isRead: false,
      readAt: null,
      senderId: authUserId,
      receiverId: activeConversationId,
      createdAt: new Date().toISOString(),
      sender: authChatUser,
      receiver: activeConversation.user,
      sendState: "sending",
      retryPayload: {
        content: trimmed,
        files: filesSnapshot,
        imagePreviewUrls,
        videoPreviewUrls,
      },
    };

    setMessages((prev) =>
      [...prev, optimisticMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );
    setConversations((prev) =>
      upsertConversationFromMessage(prev, optimisticMessage, authUserId, activeConversationId)
    );
    setMessageInput("");
    setSelectedFiles([]);
    setTimeout(scrollToBottom, 30);

    setSending(true);
    const { data, error } = await sendMessageRequest(activeConversationId, trimmed, filesSnapshot);
    setSending(false);

    if (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, sendState: "failed" } : msg
        )
      );
      return;
    }

    const sent = data?.data;
    if (!sent) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, sendState: "failed" } : msg
        )
      );
      return;
    }

    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    videoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));

    const confirmedMessage: ChatMessage = { ...sent, sendState: "sent" };
    setMessages((prev) => {
      const withoutTemp = prev.filter((msg) => msg.id !== tempId);
      const existingIndex = withoutTemp.findIndex((msg) => msg.id === confirmedMessage.id);
      if (existingIndex !== -1) {
        const next = [...withoutTemp];
        next[existingIndex] = {
          ...next[existingIndex],
          ...confirmedMessage,
          sendState: "sent",
        };
        return next.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return [...withoutTemp, confirmedMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    setConversations((prev) =>
      upsertConversationFromMessage(prev, confirmedMessage, authUserId, activeConversationId)
    );
    setDraftConversationUser((prev) => {
      if (prev?.id === activeConversationId) {
        draftConversationUserRef.current = null;
        return null;
      }
      return prev;
    });
    setTimeout(scrollToBottom, 30);
  };

  const handleRetryMessage = async (messageId: string) => {
    if (sending) return;

    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (!failedMessage || failedMessage.sendState !== "failed" || !failedMessage.retryPayload) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, sendState: "sending" } : msg
      )
    );

    setSending(true);
    const { data, error } = await sendMessageRequest(
      failedMessage.receiverId,
      failedMessage.retryPayload.content,
      failedMessage.retryPayload.files
    );
    setSending(false);

    if (error || !data?.data) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, sendState: "failed" } : msg
        )
      );
      return;
    }

    failedMessage.retryPayload.imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    failedMessage.retryPayload.videoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));

    const confirmedMessage: ChatMessage = { ...data.data, sendState: "sent" };
    setMessages((prev) => {
      const withoutFailed = prev.filter((msg) => msg.id !== messageId);
      const existingIndex = withoutFailed.findIndex((msg) => msg.id === confirmedMessage.id);
      if (existingIndex !== -1) {
        const next = [...withoutFailed];
        next[existingIndex] = {
          ...next[existingIndex],
          ...confirmedMessage,
          sendState: "sent",
        };
        return next.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return [...withoutFailed, confirmedMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    setConversations((prev) =>
      upsertConversationFromMessage(prev, confirmedMessage, authUserId, activeConversationId)
    );
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const activeHeaderUser = activeConversation?.user || null;
  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const name = fullName(conversation.user).toLowerCase();
      const email = (conversation.user.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [conversationSearch, conversations]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading messages...
        </div>
      </div>
    );
  }

  if (!authUserId) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <p className="text-sm text-gray-600">Sign in to access your messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border border-gray-200 bg-white px-6 py-3 ${isMobileChatView ? "hidden lg:block" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <p className="mt-1 text-sm text-gray-600">Stay connected with the community</p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              streamConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                streamConnected ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {streamConnected ? "Live" : "Reconnecting"}
          </span>
        </div>
      </div>

      <div className="grid min-h-[68vh] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:h-[78dvh] lg:min-h-0 lg:grid-cols-[360px_1fr]">
        <aside className={`flex flex-col border-r border-gray-200 ${isMobileChatView ? "hidden lg:block" : "block"} lg:h-full`}>
          <div className="relative flex h-20 items-center border-b border-gray-200 px-4">
            <label className="relative block w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                placeholder="Search messages or users..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none ring-emerald-500/20 transition focus:border-emerald-500 focus:ring-2"
              />
              {conversationSearch.length > 0 && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setConversationSearch("");
                    setNewChatResults([]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-gray-200/80"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            {conversationSearch.trim().length >= 2 && (
              <div className="absolute left-4 right-4 top-full z-20">
                <div className="max-h-56 overflow-y-auto rounded-b-lg border border-gray-200 border-t-0 bg-white shadow-lg">
                  {searchingNewUsers ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Searching users...
                    </div>
                  ) : newChatResults.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-gray-500">No users found</p>
                  ) : (
                    newChatResults.map((chatUser) => {
                      const initials = `${chatUser.firstName?.[0] || ""}${chatUser.lastName?.[0] || ""}`.toUpperCase();
                      return (
                        <button
                          key={chatUser.id}
                          onClick={() => handleStartChatWithUser(chatUser)}
                          className="flex w-full items-center gap-2.5 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50"
                        >
                          {chatUser.photo ? (
                            <Image
                              src={chatUser.photo}
                              alt={fullName(chatUser)}
                              width={34}
                              height={34}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
                              {initials || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{fullName(chatUser)}</p>
                            <p className="truncate text-xs text-gray-500">{chatUser.email}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
            ) : (
              filteredConversations.map((conversation) => {
                const active = conversation.user.id === activeConversationId;
                const initials = `${conversation.user.firstName?.[0] || ""}${conversation.user.lastName?.[0] || ""}`.toUpperCase();

                return (
                  <button
                    key={conversation.user.id}
                    onClick={() => handleSelectConversation(conversation.user.id)}
                    className={`w-full border-b border-gray-100 px-4 py-4 text-left transition ${
                      active ? "bg-emerald-50/70" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {conversation.user.photo ? (
                        <Image
                          src={conversation.user.photo}
                          alt={fullName(conversation.user)}
                          width={46}
                          height={46}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                          {initials || "U"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-lg font-semibold text-gray-900">
                            {fullName(conversation.user)}
                          </p>
                          <div className="flex shrink-0 flex-col gap-1">
                            <span className="text-xs text-gray-500">
                              {formatRelative(conversation.lastActivityAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm text-gray-500">
                            {conversationPreview(conversation)}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 p-1.5 text-xs font-semibold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`${
            isMobileChatView ? "fixed inset-x-0 top-16 bottom-18 z-40 flex" : "hidden"
          } min-h-0 flex-col bg-gray-50 lg:static lg:z-auto lg:flex lg:h-full `}
        >
          {activeHeaderUser ? (
            <>
              <header className="flex py-2 lg:h-20 lg:py-0 items-center justify-between border-b border-gray-200 bg-white px-1 md:px-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToConversations}
                    className="rounded-lg  text-gray-600 hover:bg-gray-100 lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {activeHeaderUser.photo ? (
                    <Image
                      src={activeHeaderUser.photo}
                      alt={fullName(activeHeaderUser)}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white">
                      {`${activeHeaderUser.firstName?.[0] || ""}${activeHeaderUser.lastName?.[0] || ""}`.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-semibold text-gray-900">{fullName(activeHeaderUser)}</p>
                    {/* <p className="text-xs text-emerald-600">Active now</p> */}
                  </div>
                </div>
                <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-2 md:px-6 py-5">
                {hasMore && (
                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={() => void fetchMessages(activeConversationId!, nextCursor, true)}
                      disabled={loadingMore}
                      className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {loadingMore ? "Loading..." : "Load older messages"}
                    </button>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {messages.map((message, index) => {
                      const isMine = message.senderId === authUserId;
                      const status = message.sendState || "sent";
                      const previousMessage = messages[index - 1];
                      const showDayPill =
                        !previousMessage ||
                        getMessageDayKey(previousMessage.createdAt) !== getMessageDayKey(message.createdAt);

                      return (
                          <Fragment key={message.id}>
                          {showDayPill && (
                            <div className="sticky -top-4 z-10 flex justify-center py-1">
                              <span className="rounded-full border border-gray-200 bg-white/95 px-3 py-1 text-[11px] font-medium text-gray-600 shadow-sm backdrop-blur">
                                {formatMessageDayLabel(message.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[82%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-2`}>
                              {!!message.images?.length && (
                                <div
                                  className={`grid w-full gap-2 ${
                                    message.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                  }`}
                                >
                                  {message.images.map((imageUrl) => (
                                    <button
                                      key={imageUrl}
                                      type="button"
                                      onClick={() => setExpandedImageUrl(imageUrl)}
                                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt="message attachment"
                                        width={280}
                                        height={220}
                                        className="h-36 w-full object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}

                              {!!message.videos?.length && (
                                <div className="w-full space-y-2">
                                  {message.videos.map((videoUrl) => (
                                    <video
                                      key={videoUrl}
                                      src={videoUrl}
                                      controls
                                      className="w-full rounded-xl border border-gray-200 bg-black/90"
                                    />
                                  ))}
                                </div>
                              )}

                              {message.content && (
                                <div
                                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                                    isMine
                                      ? "bg-emerald-700 text-white"
                                      : "border border-gray-200 bg-white text-gray-900"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {message.content}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-2 px-1 text-xs text-gray-500">
                                <span>{formatTime(message.createdAt)}</span>
                                {isMine && (
                                  <span className="inline-flex items-center gap-1">
                                    {status === "sending" ? (
                                      <>
                                        <Clock3 className="h-3.5 w-3.5" />
                                        Sending...
                                      </>
                                    ) : status === "failed" ? (
                                      <>
                                        <Clock3 className="h-3.5 w-3.5 text-red-500" />
                                        Not sent
                                      </>
                                    ) : message.isRead ? (
                                      <>
                                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                                        Seen
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-3.5 w-3.5" />
                                        Sent
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>

                              {isMine && status === "failed" && (
                                <div className="flex items-center gap-2 px-1 text-xs">
                                  <span className="font-medium text-red-600">Failed to send</span>
                                  <button
                                    type="button"
                                    onClick={() => void handleRetryMessage(message.id)}
                                    disabled={sending}
                                    className="rounded-full border border-red-200 px-2 py-0.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                  >
                                    Retry
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              <footer className="border-t border-gray-200 bg-white px-2 py-3">
                {selectedFilePreviews.length > 0 && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {selectedFilePreviews.map((item, index) => (
                      <div
                        key={`${item.file.name}-${index}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                      >
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute right-1 top-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-sm font-semibold text-white"
                          aria-label={`Remove ${item.file.name}`}
                        >
                          ×
                        </button>

                        {item.isImage ? (
                          <Image
                            src={item.url}
                            alt={item.file.name}
                            fill
                            unoptimized
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : item.isVideo ? (
                          <video
                            src={item.url}
                            className="h-full w-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] text-gray-600">
                            {item.file.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFilesChanged}
                  />

                  <button
                    onClick={handleChooseFiles}
                    className="rounded-lg p-1 text-gray-600 hover:bg-gray-100"
                    title="Attach files"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type a message..."
                    className="h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-emerald-500/20 transition focus:border-emerald-500 focus:ring-2"
                  />

                  <button
                    onClick={() => void handleSendMessage()}
                    disabled={sending || (!messageInput.trim() && selectedFiles.length === 0)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="relative min-h-0 flex flex-1 items-center justify-center p-8 text-center">
              <button
                type="button"
                onClick={handleBackToConversations}
                className="absolute left-4 top-4 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Back to conversations"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Select a conversation</h3>
                <p className="text-sm text-gray-500">
                  Choose a user from the left panel to start chatting in real time.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {expandedImageUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setExpandedImageUrl(null)}
        >
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setExpandedImageUrl(null)}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
              >
                <Minimize2 className="h-4 w-4" />
                Minimize
              </button>
            </div>
            <div className="relative h-[80dvh] w-full overflow-hidden rounded-2xl ">
              <Image
                src={expandedImageUrl}
                alt="Expanded media preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
