import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import type {WritableDraft} from "immer";
import {UserState} from "@/utils/types";

interface AuthState {
  user: UserState | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (
      state: WritableDraft<AuthState>,
      action: PayloadAction<{
        user: UserState;
        token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateToken: (
      state: WritableDraft<AuthState>,
      action: PayloadAction<string>
    ) => {
      state.token = action.payload;
    },
    logout: (
      state: WritableDraft<AuthState>
    ) => {
      state.user = null;
      state.token = null;
    },
    setLoading: (
      state: WritableDraft<AuthState>,
      action: PayloadAction<boolean>
    ) => {
      state.isLoading = action.payload;
    },
  },
});

export const { loginUser, logout, updateToken, setLoading } = userSlice.actions;

export const selectCurrentUser =
    (state: { user: AuthState }) => state.user.user;
export const selectAuthToken
    = (state: { user: AuthState }) => state.user.token;
export const selectIsLoading
    = (state: { user: AuthState }) => state.user.isLoading;

export default userSlice.reducer;
