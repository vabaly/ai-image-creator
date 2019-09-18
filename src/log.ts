/**
 * @file 日志打印
 */
import chalk from 'chalk';

// 打印的类型的颜色
enum LogColor {
    INFO = 'black',
    SUCCESS = 'green',
    WARNING = 'yellow',
    ERROR = 'red'
}

// 基础的打印函数
function base(texts: string[], color: LogColor): void {
    console.log(chalk[color](...texts));
}

// 信息打印
export function logInfo(...texts: string[]): void {
    base(texts, LogColor.INFO);
}

// 成功打印
export function logSuccess(...texts: string[]): void {
    base(texts, LogColor.SUCCESS);
}

// 警告打印
export function logWarning(...texts: string[]): void {
    base(texts, LogColor.WARNING);
}

// 错误打印
export function logError(...texts: string[]): void {
    base(texts, LogColor.ERROR);
}
