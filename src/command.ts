#!/usr/bin/env node

import program from 'commander';
import { start } from './index';

program
    .option('-i --input <path>', '输入要转换的图片父目录')
    .option('-o --output <path>', '输入要生成的图片父目录')
    .parse(process.argv);

start(program.input, program.output);

