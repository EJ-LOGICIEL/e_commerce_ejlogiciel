import {loginData, UserState} from "@/utils/types";
import api from "@/lib/apis";
import {store} from "@/redux/store";
import {loginUser, logout as logoutAction} from "@/features/user/userSlice";
import {AxiosResponse} from "axios";
import {ACCESS_TOKEN} from "@/utils/constant";

export async function authenticate(data: Partial<UserState & {
    password: string,
    confirmPassword: string
}> | loginData, type: 'token' | 'signup') {
    try {
        const res: AxiosResponse = await api.post(`/${type}/`, data, {withCredentials: true});
        store.dispatch(loginUser(res.data.user));
        localStorage.setItem(ACCESS_TOKEN, res.data.token);
        return true
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        if (error.status) { // @ts-expect-error
            return error.status
        }
        return null
    }
}

export function logout() {
    // Remove token from localStorage
    localStorage.removeItem(ACCESS_TOKEN);
    // Dispatch logout action to clear user from Redux store
    store.dispatch(logoutAction());
}
