import {useState} from "react";
import {Button, Input, Select, SelectItem, Tab, Tabs} from "@nextui-org/react";
import {toast} from "sonner";
import {Check} from "lucide-react";

/**
 * 简单的 Cron 生成器组件
 */
export default function CronGeneratorPopup ({ onSelect }: { onSelect: (cron: string) => void })  {
    const [mode, setMode] = useState<"interval" | "daily" | "weekly" | "monthly" | "yearly">("interval");

    // 状态
    const [intervalMin, setIntervalMin] = useState("30");
    const [dailyTime, setDailyTime] = useState("08:00");
    const [weeklyDay, setWeeklyDay] = useState("2"); // 1=SUN, 2=MON... Java Calendar
    const [weeklyTime, setWeeklyTime] = useState("09:00");

    // 新增状态：每月/每年
    const [monthDay, setMonthDay] = useState("1"); // 每月的几号
    const [monthlyTime, setMonthlyTime] = useState("10:00");
    const [yearMonth, setYearMonth] = useState("1"); // 1月
    const [yearlyTime, setYearlyTime] = useState("12:00");

    const handleApply = () => {
        let cron = "";
        switch (mode) {
            case "interval":
                // 每隔 N 分钟 (例如 0 0/30 * * * *)
                cron = `0 0/${intervalMin} * * * *`;
                break;
            case "daily":
                // 每天 HH:mm:00 (例如 0 0 8 * * *)
                const [dHour, dMin] = dailyTime.split(":");
                cron = `0 ${Number(dMin)} ${Number(dHour)} * * *`;
                break;
            case "weekly":
                // 每周 [周几] HH:mm:00 (例如 0 0 9 * * MON)
                const [wHour, wMin] = weeklyTime.split(":");
                const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                const dayStr = days[Number(weeklyDay) - 1] || "MON";
                // 日(Day of month) 也要用 *，而不是 ? (根据具体 cron 库可能有所不同，这里保持原有风格)
                cron = `0 ${Number(wMin)} ${Number(wHour)} * * ${dayStr}`;
                break;
            case "monthly":
                // 每月 [几号] HH:mm:00 (例如 0 0 10 1 * *)
                const [mHour, mMin] = monthlyTime.split(":");
                cron = `0 ${Number(mMin)} ${Number(mHour)} ${monthDay} * *`;
                break;
            case "yearly":
                // 每年 [几月] [几号] HH:mm:00 (例如 0 0 12 1 1 *)
                const [yHour, yMin] = yearlyTime.split(":");
                // 这里默认每年执行时选取当月的1号，如果需要更复杂（如每年X月Y日），可以再加一个Input控制日期
                // 目前逻辑：每年 X月 1日 HH:mm 执行
                cron = `0 ${Number(yMin)} ${Number(yHour)} 1 ${yearMonth} *`;
                break;
        }
        onSelect(cron);
        toast.success("Cron 表达式已生成");
    };

    // 生成1-31日的选项
    const daysOfMonth = Array.from({length: 31}, (_, i) => ({
        key: String(i + 1),
        label: `${i + 1}号`
    }));

    // 生成1-12月的选项
    const monthsOfYear = Array.from({length: 12}, (_, i) => ({
        key: String(i + 1),
        label: `${i + 1}月`
    }));

    return (
        <div className="w-[340px] px-1 py-2">
            <Tabs
                size="sm"
                aria-label="Cron Options"
                selectedKey={mode}
                onSelectionChange={(k) => setMode(k as any)}
                className="mb-3 w-full"
                classNames={{tabList: "flex-wrap"}} // 如果放不下自动换行，或者你可以用 scrollable
            >
                <Tab key="interval" title="间隔" />
                <Tab key="daily" title="每天" />
                <Tab key="weekly" title="每周" />
                <Tab key="monthly" title="每月" />
                <Tab key="yearly" title="每年" />
            </Tabs>

            <div className="flex flex-col gap-4 min-h-[80px] justify-center px-1">
                {mode === "interval" && (
                    <Input
                        label="每隔多少分钟"
                        type="number"
                        size="sm"
                        endContent={<span className="text-small text-default-400">分</span>}
                        value={intervalMin}
                        onValueChange={setIntervalMin}
                    />
                )}

                {mode === "daily" && (
                    <Input
                        label="每天执行时间"
                        type="time"
                        size="sm"
                        value={dailyTime}
                        onValueChange={setDailyTime}
                    />
                )}

                {mode === "weekly" && (
                    <div className="flex gap-2">
                        <Select
                            label="周几"
                            size="sm"
                            className="w-1/2"
                            selectedKeys={[weeklyDay]}
                            onChange={(e) => setWeeklyDay(e.target.value)}
                        >
                            <SelectItem key="2">周一</SelectItem>
                            <SelectItem key="3">周二</SelectItem>
                            <SelectItem key="4">周三</SelectItem>
                            <SelectItem key="5">周四</SelectItem>
                            <SelectItem key="6">周五</SelectItem>
                            <SelectItem key="7">周六</SelectItem>
                            <SelectItem key="1">周日</SelectItem>
                        </Select>
                        <Input
                            label="时间"
                            type="time"
                            size="sm"
                            className="w-1/2"
                            value={weeklyTime}
                            onValueChange={setWeeklyTime}
                        />
                    </div>
                )}

                {mode === "monthly" && (
                    <div className="flex gap-2">
                        <Select
                            label="日期"
                            size="sm"
                            className="w-1/2"
                            selectedKeys={[monthDay]}
                            onChange={(e) => setMonthDay(e.target.value)}
                        >
                            {daysOfMonth.map((d) => (
                                <SelectItem key={d.key}>{d.label}</SelectItem>
                            ))}
                        </Select>
                        <Input
                            label="时间"
                            type="time"
                            size="sm"
                            className="w-1/2"
                            value={monthlyTime}
                            onValueChange={setMonthlyTime}
                        />
                    </div>
                )}

                {mode === "yearly" && (
                    <div className="flex gap-2">
                        <Select
                            label="月份"
                            size="sm"
                            className="w-1/2"
                            selectedKeys={[yearMonth]}
                            onChange={(e) => setYearMonth(e.target.value)}
                        >
                            {monthsOfYear.map((m) => (
                                <SelectItem key={m.key}>{m.label}</SelectItem>
                            ))}
                        </Select>
                        <Input
                            label="1号几点" // 简化起见，默认每年选定月份的1号
                            type="time"
                            size="sm"
                            className="w-1/2"
                            value={yearlyTime}
                            onValueChange={setYearlyTime}
                        />
                    </div>
                )}
            </div>

            <Button
                size="sm"
                className="w-full mt-4 bg-pink-500 text-white font-bold"
                startContent={<Check size={14}/>}
                onPress={handleApply}
            >
                生成并应用
            </Button>
        </div>
    );
};
