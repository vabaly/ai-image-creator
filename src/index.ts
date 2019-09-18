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
    processFile, setOutputDir
} from './process';
import { walk } from './walk';
import {
    logSuccess
} from './log';

export async function start(input: string, output: string): Promise<void> {
    const inputDir = input ? path.resolve(PWD, input) : INPUT;
    const outputDir = output ? path.resolve(PWD, output) : OUTPUT;

    // 输出目录不存在则创建
    if (!fs.existsSync(outputDir)) {
        shelljs.mkdir('-p', outputDir);
    }

    setOutputDir(outputDir);

    await walk(inputDir, processFile);

    logSuccess('任务成功');
}
