export function convertTimeToFormattedTime(time: number) {
    if (time === Infinity) return -1;
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substring(11, 19);
}