import request from "@/utils/request";

const userApi = {
    /**
     * 获取所有已知的用户 ID 列表
     */
    getUserIds: () => {
        return request.get<number[]>('/api/users/userids');
    }
};

export default userApi;
