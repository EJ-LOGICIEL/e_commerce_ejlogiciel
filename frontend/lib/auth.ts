import {loginData, UserState} from "@/utils/types";
import api from "@/lib/apis";
import {store} from "@/redux/store";
import {loginUser} from "@/features/user/userSlice";
import {AxiosResponse} from "axios";

export async function authenticate(data: UserState | loginData, type: 'token' | 'signup') {
    try {
        const res: AxiosResponse = await api.post(`/${type}/`, data, {withCredentials: true});
        store.dispatch(loginUser(res.data));
    } catch (error) {
        console.error("Failed to authenticate", error);
        return null
    }
    return true
}
