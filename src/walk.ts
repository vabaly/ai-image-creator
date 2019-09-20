/**
 * @file 遍历指定文件夹下的图片，并对图片执行相关的操作
 */
import path from 'path';
import fs from 'fs';
import {
    ProcessFn
} from './process';
import { logSuccess, logWarning, logInfo } from './log';
import { PWD } from './config';

// 遍历时需要忽略的文件（夹）名
const blackName = [
    '.git',
    'node_modules'
];
// 遍历时需要忽略的文件（夹）路径
const blackPath: string[] = [];

// 文件分隔符
const sep = path.sep;

/**
 * 追增需要忽略的文件（夹）名或文件（夹）路径
 * @param value 文件（夹）名或文件（夹）路径或包含上述值的一个数组
 */
export function appendToBlackNameOrPath(value: string | string[]): void {
    let nameAndPaths: string[];

    if (typeof value === 'string') {
        nameAndPaths = [value];
    } else {
        nameAndPaths = value;
    }

    nameAndPaths.forEach(nameOrPath => {
        if (nameOrPath.indexOf(sep) > -1) {
            // 此情况认为 nameOrPath 是路径，要转为绝对路径
            blackPath.push(path.resolve(PWD, nameOrPath));
        } else {
            // 此情况认为 nameOrPath 是文件名
            blackName.push(nameOrPath);
        }
    });
}

/**
 * 文件名是否在被忽略的项里面
 * @param name 文件名
 */
export function isInBlackName(name: string): boolean {
    return blackName.indexOf(name) > -1;
}

/**
 * 文件路径是否在被忽略的项里面
 * @param name 文件名
 */
export function isInBlackPath(filePath: string): boolean {
    const resolvePath = path.resolve(PWD, filePath);
    return blackPath.some(item => {
        const regExp = new RegExp(`^${item}(?=/)`);
        return item === resolvePath || regExp.test(resolvePath);
    });
}

/**
 * 遍历文件夹
 * @param dirPath 文件夹路径
 * @param callback 回调函数
 */
export async function walk(dirPath: string, callback: ProcessFn): Promise<any> {
    let fileList = [];
    try {
        fileList = fs.readdirSync(dirPath);
    } catch (error) {
        return true;
    }

    for (let index = 0; index < fileList.length; index++) {
        const name = fileList[index];
        const fileOrDirPath = path.join(dirPath, name);
        const stat = fs.statSync(fileOrDirPath);
        const isFile = stat.isFile();

        // 文件或文件夹不在黑名单中则继续往下执行
        if (!isInBlackName(name) && !isInBlackPath(fileOrDirPath)) {
            if (isFile) {
                if (!isInBlackName(name) && !isInBlackPath(fileOrDirPath)) {
                    await callback({
                        path: fileOrDirPath,
                        name
                    })
                        .then(() => logSuccess(`图片 ${fileOrDirPath} 的训练集生成成功`))
                        .catch(() => logWarning(`文件 ${fileOrDirPath} 不支持转换，即将跳过`));
                }
            } else {
                await walk(fileOrDirPath, callback);
            }
        } else {
            logInfo(`${isFile ? '文件' : '文件夹'}${path.resolve(PWD, fileOrDirPath)}在黑名单中，将不会生成任何图片}`);
        }
    }

    return true;
}
