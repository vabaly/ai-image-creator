/**
 * @file 配置项
 */
import path from 'path';

export const PWD = process.cwd();
const isDev = process.env.NODE_ENV === 'dev';

const {
    // 图片所在的目录，默认是运行程序时的当前目录
    IMAGES_DIR = PWD,
    // 图片所在的目录，默认是运行程序时当前目录下的 output 目录
    OUTPUT_DIR = path.join(PWD, 'output')
} = process.env;

const tempDir = path.join(__dirname, '../temp');

export const INPUT = isDev ? path.join(tempDir, 'input') : IMAGES_DIR;
export const OUTPUT = isDev ? path.join(tempDir, 'output') : OUTPUT_DIR;
