/**
 * @file 工具函数
 */

/**
 * 获取数组中 target 出现的次数
 * @param array 一个数组
 * @param target 查找的目标
 */
export function getCount(array: any[], target: any): number {
    const filterArray = array.filter(item => item === target);
    return filterArray.length;
}
