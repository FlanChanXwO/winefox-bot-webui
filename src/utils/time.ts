export const formatTime = (isoString: string) => {
    try {
        const date = new Date(isoString);
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return "00-00 00:00:00";
        }

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');

        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());

        const timePart = `${month}-${day} ${hour}:${minute}:${second}`;

        // 判断年份：如果不是今年，则在前面加上年份
        if (date.getFullYear() !== now.getFullYear()) {
            return `${date.getFullYear()}-${timePart}`;
        }

        return timePart;

    } catch (e) {
        return "00-00 00:00:00";
    }
};

export const formatLogTime = (isoString: string) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const timeStr = date.toLocaleTimeString('zh-CN', { hour12: false });
    return { dateStr, timeStr };
};

