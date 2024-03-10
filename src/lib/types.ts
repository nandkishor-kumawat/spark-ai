import { Part } from "@google/generative-ai"

export interface Chat {
    id: string
    group_id: string
    message: string
    images?: Part[]
    model: string
    role: string
    user_id: string
    created_at: Date
}