import { Message } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
    chats: Message[]
    prompt: string,
}

const initialState = {
    chats: [],
    prompt: "",
} as ChatState

export const chat = createSlice({
    name: "chat",
    initialState,
    reducers: {
        initializeChats: (state, action: PayloadAction<Message[]>) => {
            state.chats = action.payload
        },

        addUserChat: (state, action: PayloadAction<Message>) => {
            state.chats.push(action.payload);
        },

        addModelChat: (state, action: PayloadAction<Message>) => {
            state.chats.pop();
            state.chats.push(action.payload);
        },

        setPrompt: (state, action: PayloadAction<string>) => {
            state.prompt = action.payload;
        },
    },
});

export const {
    addUserChat,
    addModelChat,
    initializeChats,
    setPrompt,
} = chat.actions;

export default chat.reducer;