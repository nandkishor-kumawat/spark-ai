import { Chat } from "@/lib/types";
import { Content } from "@google/generative-ai";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
    chats: Content[]
}

const initialState = {
    chats: []
} as ChatState

export const chat = createSlice({
    name: "chat",
    initialState,
    reducers: {
        initializeChats: (state, action: PayloadAction<Content[]>) => {
            state.chats = action.payload
        },
        addUserChat: (state, action: PayloadAction<Chat>) => {
            const { message, ...chat } = action.payload;
            state.chats.push({ ...chat, parts: [{ text: message }] });
        },

        addDummyModelChat: (state) => {
            const action = {
                id: 'dummy',
                user_id: "dummy",
                group_id: 'dummy',
                message: 'Generating...',
                role: 'model',
                model: 'gemini-pro',
                created_at: new Date()
            }
            const { message, ...chat } = action;
            state.chats.push({ ...chat, parts: [{ text: message }] });
        },

        addModelChat: (state, action: PayloadAction<Chat>) => {
            state.chats.pop();
            const { message, ...chat } = action.payload;
            state.chats.push({ ...chat, parts: [{ text: message }] });
        }

    },
});

export const {
    addUserChat,
    addModelChat,
    addDummyModelChat,
    initializeChats
} = chat.actions;
export default chat.reducer;