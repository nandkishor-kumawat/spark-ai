import { QueryType } from "@/lib/types";
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
            state.chats.push(action.payload);
        },

        addModelChat: (state, action: PayloadAction<QueryType>) => {
            state.chats.pop();
            state.chats.push(action.payload);
        }
    },
});

export const {
    addUserChat,
    addModelChat,
    initializeChats
} = chat.actions;

export default chat.reducer;