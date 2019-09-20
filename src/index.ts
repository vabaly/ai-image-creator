/**
 * @file 图片转换
 */
import path from 'path';
import fs from 'fs';
import shelljs from 'shelljs';
import {
    PWD,
    INPUT,
    OUTPUT
} from './config';
import {
    processFile,
    setOutputDir
} from './process';
import {
    walk,
    appendToBlackNameOrPath,
    isInBlackName,
    isInBlackPath
} from './walk';
import {
    logSuccess
} from './log';

interface Options {
    ignore: string[];
}

export async function start(input: string, output: string, options?: Options): Promise<void> {
    const inputDir = input ? path.resolve(PWD, input) : INPUT;
    const outputDir = output ? path.resolve(PWD, output) : OUTPUT;

    // 输出目录不存在则创建
    if (!fs.existsSync(outputDir)) {
        shelljs.mkdir('-p', outputDir);
    }

    // 如果存在 ignore 参数，则需要设置忽略的内容
    if (options && options.ignore) {
        appendToBlackNameOrPath(options.ignore);
    }

    // 设置输出的目录
    setOutputDir(outputDir);

    const stat = fs.statSync(inputDir);
    // 如果是文件，则只对文件做处理
    if (stat.isFile()) {
        const name = path.basename(inputDir);
        if (!isInBlackName(name) && !isInBlackPath(inputDir)) {
            await processFile({
                path: inputDir,
                name: path.basename(inputDir)
            });
        }
    } else {
        await walk(inputDir, processFile);
    }

    logSuccess('任务成功');
}
