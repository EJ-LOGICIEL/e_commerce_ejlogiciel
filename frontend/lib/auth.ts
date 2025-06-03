import {loginData, UserState} from "@/utils/types";
import api from "@/lib/apis";
import {store} from "@/redux/store";
import {loginUser} from "@/features/user/userSlice";
import {AxiosResponse} from "axios";
import {ACCESS_TOKEN} from "@/utils/constant";

export async function authenticate(data: UserState | loginData, type: 'token' | 'signup') {
    try {
        const res: AxiosResponse = await api.post(`/${type}/`, data, {withCredentials: true});
        store.dispatch(loginUser(res.data.user));
        localStorage.setItem(ACCESS_TOKEN, res.data.token);
        return true
    } catch (error) {
        console.error("Failed to authenticate", error);
        return null
    }

}
