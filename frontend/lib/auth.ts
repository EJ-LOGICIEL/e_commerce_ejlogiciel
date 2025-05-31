import {loginData, UserState} from "@/utils/types";
import api from "@/lib/apis";
import {store} from "@/redux/store";
import {loginUser} from "@/features/user/userSlice";
import {AxiosResponse} from "axios";
import {redirect} from "next/navigation";

export async function authenticate(data: UserState | loginData, type: 'token' | 'signup') {
    try {
        const res: AxiosResponse = await api.post(`/${type}/`, data, {withCredentials: true});
        if (res.status === 200 || res.status === 201) {
            store.dispatch(loginUser(res.data));
            return true
        }
    } catch (error) {
        console.error("Failed to authenticate", error);
        return null
    }
    return redirect('/dashboard');
}
