import { GenerativeContentBlob } from "@google/generative-ai"

export interface QueryType {
    id: string
    group_id: string
    message: string
    images?: GenerativeContentBlob[]
    model: string
    user_id: string
    response?: string
    created_at: Date
}