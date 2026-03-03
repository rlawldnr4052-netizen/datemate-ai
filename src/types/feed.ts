export interface FeedPhoto {
  id: string
  imageUrl: string
  placeName: string
  placeCategory: string
}

export interface FeedComment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

export interface FeedPost {
  id: string
  userId: string
  userName: string
  courseId: string
  courseTitle: string
  courseRegion: string
  photos: FeedPhoto[]
  caption: string
  likeCount: number
  isLiked: boolean
  comments: FeedComment[]
  createdAt: string
}
