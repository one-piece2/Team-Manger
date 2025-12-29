import { create, type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import createSelectors from "./selectors";

type UserType = {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    currentWorkspace: string;
};

type AuthState = {
    accessToken: string | null;
    user: UserType | null;
    setAccessToken: (token: string) => void;
    clearAccessToken: () => void;
    setUser: (user: UserType) => void;
    clearUser: () => void;
};

const createAuthSlice: StateCreator<AuthState> = (set) => ({
    accessToken: null,
    user: null,
    setAccessToken: (token) => set({ accessToken: token }),
    clearAccessToken: () => set({ accessToken: null }),
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
});

type StoreType = AuthState;

export const useStoreBase = create<StoreType>()(
    devtools(
        persist(
            //immer支持直接修改复杂的嵌套状态
            immer((...a) => ({
                ...createAuthSlice(...a),
            })),
            {
                name: "session-storage",
                //存入了sessionStorage 而不是localStorage。  sessionStorage（会话存储）：关闭标签自动清除数据。  localStorage：一直在。
                storage: createJSONStorage(() => sessionStorage),
            }
        )
    )
);

export const useStore = createSelectors(useStoreBase);