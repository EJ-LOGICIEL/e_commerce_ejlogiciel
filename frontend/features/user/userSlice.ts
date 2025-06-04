import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import type {WritableDraft} from "immer";
import {UserState} from "@/utils/types";

interface AuthState {
    user: UserState | null;
}

const initialState: AuthState = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginUser: (
            state: WritableDraft<AuthState>,
            action: PayloadAction<UserState>
        ) => {
            console.log(action.payload)
            state.user = action.payload;
            console.log(state.user)
        },
        logout: (
            state: WritableDraft<AuthState>
        ) => {
            state.user = null;
        },
    },
});

export const {loginUser, logout} = userSlice.actions;

export const selectCurrentUser =
    (state: { user: AuthState }) => state.user.user;

export default userSlice.reducer;
