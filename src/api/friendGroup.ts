import request from "@/utils/request"; // 假设你有一个封装好的 request 工具

const friendGroupApi = {
    /**
     * 获取所有已知的群组 ID 列表
     * @param botId 可选，机器人 ID
     */
    getGroupIds: (botId?: string | number) => {
        return request.get<number[]>('/api/friend-group/groupids', {
            params: { botId }
        });
    }
};

export default friendGroupApi;
