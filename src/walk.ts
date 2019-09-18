/**
 * @file 遍历指定文件夹下的图片，并对图片执行相关的操作
 */
import path from 'path';
import fs from 'fs';
import {
    ProcessFn
} from './process';
import { logSuccess, logWarning } from './log';

/**
 * 需要忽略的文件夹名
 * @param name 文件夹名
 */
function isBlackFolder(name: string): boolean {
    return [
        '.git',
        'node_modules'
    ].indexOf(name) > -1;
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

        if (isFile) {
            await callback({
                path: fileOrDirPath,
                name
            })
                .then(() => logSuccess(`图片 ${fileOrDirPath} 的训练集生成成功`))
                .catch(() => logWarning(`文件 ${fileOrDirPath} 不支持转换，即将跳过`));
        } else if (!isBlackFolder(name)) {
            await walk(fileOrDirPath, callback);
        }
    }

    return true;
}
