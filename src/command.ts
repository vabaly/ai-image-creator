#!/usr/bin/env node

import program from 'commander';
import { start } from './index';
import { commaSeparatedList } from './util';

program
    .option('-i --input <path>', '输入要转换的图片父目录')
    .option('-o --output <path>', '输入要生成的图片父目录')
    .option('--ignore <paths>', '输入文件夹遍历过程中要忽略的文件夹名或路径', commaSeparatedList)
    .parse(process.argv);

const { input, output, ignore } = program;

// 执行任务
start(input, output, {
    ignore
});

