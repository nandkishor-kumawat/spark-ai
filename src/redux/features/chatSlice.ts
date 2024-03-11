import { QueryType } from "@/lib/types";
import { Content } from "@google/generative-ai";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
    chats: QueryType[]
}

const initialState = {
    chats: []
} as ChatState

export const chat = createSlice({
    name: "chat",
    initialState,
    reducers: {
        initializeChats: (state, action: PayloadAction<QueryType[]>) => {
            state.chats = action.payload
        },
        addUserChat: (state, action: PayloadAction<QueryType>) => {
            // const { message, ...chat } = action.payload;
            // state.chats.push({ ...chat, parts: [{ text: message }] });
            state.chats.push(action.payload);
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
            // const { message, ...chat } = action;
            // state.chats.push({ ...chat, parts: [{ text: message }] });
            state.chats.push(action);
        },

        addModelChat: (state, action: PayloadAction<QueryType>) => {
            state.chats.pop();
            // const { message, ...chat } = action.payload;
            // state.chats.push({ ...chat, parts: [{ text: message }] });
            state.chats.push(action.payload);
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