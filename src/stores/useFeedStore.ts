import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FeedPost } from '@/types/feed'

interface FeedState {
  posts: FeedPost[]
  addPost: (post: Omit<FeedPost, 'id' | 'likeCount' | 'isLiked' | 'comments' | 'createdAt'>) => void
  removePost: (postId: string) => void
  toggleLike: (postId: string) => void
  addComment: (postId: string, userId: string, userName: string, text: string) => void
  getPostsByUser: (userId: string) => FeedPost[]
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      posts: [],

      addPost: (post) =>
        set((s) => ({
          posts: [
            {
              ...post,
              id: crypto.randomUUID(),
              likeCount: 0,
              isLiked: false,
              comments: [],
              createdAt: new Date().toISOString(),
            },
            ...s.posts,
          ],
        })),

      removePost: (postId) =>
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== postId),
        })),

      toggleLike: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
                }
              : p,
          ),
        })),

      addComment: (postId, userId, userName, text) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: crypto.randomUUID(),
                      userId,
                      userName,
                      text,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : p,
          ),
        })),

      getPostsByUser: (userId) => get().posts.filter((p) => p.userId === userId),
    }),
    { name: 'datemate-feed' },
  ),
)
