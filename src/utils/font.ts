export const getValueFontSize = (val: number) => {
    const str = val.toString();
    if (str.length >= 6) return "text-xs";    // 10万以上：超小号字体
    if (str.length >= 5) return "text-sm";    // 万级：小号字体 (对应你截图中的 22308)
    if (str.length === 4) return "text-base"; // 千级：中号字体
    return "text-lg";                         // 百级以内：大号字体
};
