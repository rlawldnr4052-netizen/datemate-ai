export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
  tmiData?: TMIData
}

export interface TMIData {
  type: 'local_knowledge' | 'nearby_people' | 'fun_fact'
  title: string
  content: string
  icon: string
}

export interface QuickReply {
  id: string
  label: string
  action: string
}
