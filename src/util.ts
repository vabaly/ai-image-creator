/**
 * @file 工具函数
 */

/**
 * 获取数组中 target 出现的次数
 * @param array 一个数组
 * @param target 查找的目标，目标仅能支持三种基本类型，对象不适用
 */
export function getCount(array: (string | number | boolean)[], target: string | number | boolean): number {
    const filterArray = array.filter(item => item === target);
    return filterArray.length;
}

/**
 * 将字符串按 , 分隔开，变成个字符串数组
 * @param value 字符串
 */
export function commaSeparatedList(value: string): string[] {
    return value.split(',');
}
