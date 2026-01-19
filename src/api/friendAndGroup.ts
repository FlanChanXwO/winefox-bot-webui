import request from "@/utils/request";

export interface FriendAndGroupStatsResponse {
    friendCount: number;
    groupCount: number;
}

export const getFriendAndGroupStats = (botId: number) => {
    return request.get<FriendAndGroupStatsResponse>(`/api/friend-group/stats/${botId}`);
};
