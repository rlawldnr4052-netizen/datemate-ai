export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: FriendRequestStatus
  createdAt: string
}

export interface FriendRelationship {
  userId: string
  connectedAt: string
}
