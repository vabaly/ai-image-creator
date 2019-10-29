/**
 * @file 图像处理方法
 */
import path from 'path';
import gm from 'gm';
import { pictureToXML } from 'picture-to-xml';
import { OUTPUT } from './config';
import { getCount } from './util';
import { logError } from './log';

// 动态设置 outputDir
let outputDir = OUTPUT;

export interface Input {
    path: string;
    name: string;
}

// 标准的图像数据输入
export interface ImageInput extends Input {
    ext: string;
}

// 标准的图像数据输出
interface Output {
    name: string;
    ext: string;
    modifier: string;
}

export interface ProcessFn {
    (input: Input): Promise<any>;
}

/**
 * 获取图像输出的地址
 * @param output 图像输出数据
 */
function getOutputPath(output: Output): string {
    // 默认生成的图像是 png 类型的
    const { name, ext = 'png', modifier } = output;
    // 如果名字中包含后缀，则先去除
    const pureName = name.replace(/\.png$/, '')
        .replace(/\.jpg$/, '')
        .replace(/\.jpeg$/, '');

    const fullName = `${pureName}-${modifier}.${ext}`;
    const outputPath = path.join(outputDir, fullName);

    return outputPath;
}

/**
 * 图像生成 XML 文件
 * @param outputPath 图像输出的地址
 */
function generateXML(outputPath: string): Promise<void> {
    const pathObject = path.parse(outputPath);
    const componentName = 'demo';
    const filename = pathObject.name;
    const XMLOutputPath = path.join(pathObject.dir, filename + '.xml');

    // 同时生成一份图片对应的 XML
    return pictureToXML(
        outputPath,
        componentName,
        XMLOutputPath
    );
}

/**
 * 通用的处理函数
 * @param resolve 成功决议
 * @param reject 失败决议
 */
function handle(
    resolve: (value?: any) => void,
    reject: (reason?: any) => void
) {
    return function callback(error: Error|null): void {
        if (error) {
            reject(error);
        } else {
            resolve(true);
        }
    };
}

/**
 * 旋转
 * @param input 输入的图像信息
 */
export function rotate(input: ImageInput): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: 'rotate' });

    return new Promise((resolve, reject): void => {
        gm(path)
            .rotate('white', 90)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch((error: Error): boolean => {
            logError(`旋转图片 ${path} 时发生错误`, error.message);
            return false;
        });
}

/**
 * 沿 Y 轴翻转，即上下颠倒
 * @param path 输入的图像文件路径
 * @param name 输入的图片文件名
 */
export function flip(input: ImageInput): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: 'flip' });

    return new Promise((resolve, reject): void => {
        gm(path)
            .flip()
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch((error: Error): boolean => {
            logError(`沿 Y 轴翻转图片 ${path} 时发生错误`, error.message);
            return false;
        });
}

/**
 * 沿 X 轴翻转，即左右颠倒
 * @param input 输入的图像信息
 */
export function flop(input: ImageInput): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: 'flop' });

    return new Promise((resolve, reject): void => {
        gm(path)
            .flop()
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch((error: Error): boolean => {
            logError(`沿 X 轴翻转图片 ${path} 时发生错误`, error.message);
            return false;
        });
}

/**
 * 点对称翻转
 * @param input 输入的图像信息
 */
export function flipAndFlop(input: ImageInput): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: 'flip-flop' });

    return new Promise((resolve, reject): void => {
        gm(path)
            .flip()
            .flop()
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch((error: Error): boolean => {
            logError(`沿对角线翻转图片 ${path} 时发生错误`, error.message);
            return false;
        });
}

/**
 * 调整图片亮度
 * @param input 输入的图像信息
 * @param delta 图像亮度的值，基准值是 100，比 100 高则是增加亮度，比 100 低则是减少亮度
 */
export function adjustBrightness(input: ImageInput, brightness: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-brightness-${brightness}` });

    return new Promise((resolve, reject): void => {
        gm(path)
            .modulate(brightness, 100, 100)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch(() => false);
}

/**
 * 调整图片的对比度
 * @param input 输入的图像信息
 * @param delta 图像亮度的值，基准值是 100，比 100 高则是增加亮度，比 100 低则是减少亮度
 */
export function adjustContrast(input: ImageInput, multiplier: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-contrast-${multiplier}` });

    return new Promise((resolve, reject): void => {
        gm(path)
            .contrast(multiplier)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch(() => false);
}

/**
 * 调整图片的色相
 * @param input 输入的图像信息
 * @param hue 图像色相的值，基准值是 100，比 100 高则是增加色相，比 100 低则是减少色相
 */
export function adjustHue(input: ImageInput, hue: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-hue-${hue}` });

    return new Promise((resolve, reject): void => {
        gm(path)
            .modulate(100, 100, hue)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch(() => false);
}

/**
 * 调整图片的饱和度
 * @param input 输入的图像信息
 * @param saturation 图像饱和度的值，基准值是 100，比 100 高则是增加饱和度，比 100 低则是减少饱和度
 */
export function adjustSaturation(input: ImageInput, saturation: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-saturation-${saturation}` });

    return new Promise((resolve, reject): void => {
        gm(path)
            .modulate(100, saturation, 100)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath))
        .catch(() => false);
}

/**
 * 通过处理图片的亮度来获得一系列图片，亮度范围 [60, 140]，步长 20
 * @param input 输入的图像信息
 */
export function processByBrightness(input: ImageInput): Promise<any> {
    const promises = [];
    for (let brightness = 60; brightness <= 140; brightness = brightness + 20) {
        if (brightness !== 100) {
            promises.push(adjustBrightness(input, brightness));
        }
    }
    return Promise.all(promises)
        .then(infos => {
            const count = getCount(infos, false);
            if (count) {
                logError(`处理图片 ${input.path} 亮度时有 ${count} 项子任务失败`);
            }
            return true;
        });
}

/**
 * 通过处理图片的饱和度来获得一系列图片，饱和度范围 [0, 140]，步长 20
 * @param input 输入的图像信息
 */
export function processBySaturation(input: ImageInput): Promise<any> {
    const promises = [];
    for (let saturation = 0; saturation <= 140; saturation = saturation + 20) {
        if (saturation !== 100) {
            promises.push(adjustSaturation(input, saturation));
        }
    }
    return Promise.all(promises)
        .then(infos => {
            const count = getCount(infos, false);
            if (count) {
                logError(`处理图片 ${input.path} 饱和度时有 ${count} 项子任务失败`);
            }
            return true;
        });
}

/**
 * 通过处理图片的色相来获得一系列图片，色相范围 [0, 190]，步长 10
 * @param input 输入的图像信息
 */
export function processByHue(input: ImageInput): Promise<any> {
    const promises = [];
    for (let hue = 0; hue <= 190; hue = hue + 10) {
        if (hue !== 100) {
            promises.push(adjustHue(input, hue));
        }
    }
    return Promise.all(promises)
        .then(infos => {
            const count = getCount(infos, false);
            if (count) {
                logError(`处理图片 ${input.path} 色相时有 ${count} 项子任务失败`);
            }
            return true;
        });
}

/**
 * 通过处理图片的对比度来获得一系列图片，对比度范围 [-5, 2]，步长 1
 * @param input 输入的图像信息
 */
export function processByContrast(input: ImageInput): Promise<any> {
    const promises = [];
    for (let contrast = -5; contrast <= 2; contrast = contrast + 1) {
        if (contrast !== 0) {
            promises.push(adjustContrast(input, contrast));
        }
    }
    return Promise.all(promises)
        .then(infos => {
            const count = getCount(infos, false);
            if (count) {
                logError(`处理图片 ${input.path} 对比度时有 ${count} 项子任务失败`);
            }
            return true;
        });
}

/**
 * 对图片进行处理
 * @param input 输入的图片信息
 */
export function processImage(input: ImageInput): Promise<boolean> {
    return Promise.all([
        // 暂时去掉翻转，因为感觉翻转后和原来组件差别很大
        // flip(input),
        // flop(input),
        // flipAndFlop(input),
        processByBrightness(input),
        processBySaturation(input),
        processByHue(input),
        processByContrast(input)
    ]).then(() => true);
}

/**
 * 对文件进行处理
 * @param file 文件
 */
export function processFile(file: Input): Promise<any> {
    return new Promise((resolve, reject): void => {
        try {
            gm(file.path)
                .format((error, format): void => {
                    if (error) {
                        reject(error);
                    } else {
                        const ext = file.path.split('.').pop() || format.toLocaleLowerCase();
                        // 只有被 GM 认可的图片文件才进行处理
                        resolve(processImage({
                            ...file,
                            ext
                        }));
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 动态设置图片输出目录
 * @param output 图片输出的目录
 */
export function setOutputDir(output: string): void {
    outputDir = output;
}
