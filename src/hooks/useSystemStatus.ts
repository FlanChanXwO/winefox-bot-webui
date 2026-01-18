import useSWR from 'swr';
import request, {Result} from "@/utils/request";

interface SystemStatus {
    cpuUsage: string;
    memoryUsage: string;
    diskUsage: string;
}

// 定义 fetcher，使用我们封装好的 axios
const axiosFetcher = (url: string) => request.get(url);

export const useSystemStatus = () => {
    // key 依然是路径，具体的 baseURL 由 axios 拦截器处理
    const { data, error, isLoading, mutate } = useSWR<Result<SystemStatus>>(
        '/api/monitor/status',
        axiosFetcher,
        {
            refreshInterval: 2000,
            dedupingInterval: 2000,
            keepPreviousData: true,
            // 如果出错（比如后端没启动），不要无限重试导致浏览器卡死，可以设置慢一点
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
                if (retryCount >= 10) return; // 最多重试10次
                setTimeout(() => revalidate({ retryCount }), 5000);
            }
        }
    );

    // 提供一个 reload 方法，允许外部强制刷新（比如修改配置后）
    const reload = () => mutate();

    return {
        status: data?.data || { cpuUsage: '0%', memoryUsage: '0%', diskUsage: '0%' },
        isLoading,
        isError: error,
        reload
    };
};
