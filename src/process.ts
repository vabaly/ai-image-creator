/**
 * @file 图像处理方法
 */
import path from 'path';
import fs from 'fs';
import gm, { Dimensions } from 'gm';
import { pictureToXML, ComponentData } from 'picture-to-xml';
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
 * 判断是否是 GM 可以处理的图片文件
 * @param filePath 图片文件路径
 */
function isCanProcessImage(filePath: string): Promise<boolean> {
    return new Promise((resolve): void => {
        try {
            gm(filePath)
                .format((error): void => {
                    if (error) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
        } catch (error) {
            resolve(false);
        }
    });
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
 * 随机获取背景
 */
async function getBackgroundRandom(): Promise<string> {
    const backgroundDir = path.join(__dirname, '../assets/background');
    const backgroundFileList = fs.readdirSync(backgroundDir);
    const validBackgroundFileList = [];

    // 只有能被处理的图片才能加入备选池
    for (let index = 0; index < backgroundFileList.length; index++) {
        const filename = backgroundFileList[index];
        const filePath = path.resolve(backgroundDir, filename);
        const isValidFile = await isCanProcessImage(filePath);

        if (isValidFile) {
            validBackgroundFileList.push(filename);
        }
    }

    const length = validBackgroundFileList.length;
    const index = Math.floor(Math.random() * length);
    const filename = validBackgroundFileList[index];
    const filePath = path.resolve(backgroundDir, filename);

    return filePath;
}

/**
 * 获取图像尺寸
 * @param filePath 图像的地址，或者图像的 GM 实例
 */
function getSize(filePath: string): Promise<Dimensions> {
    return new Promise((resolve) => {
        gm(filePath)
            .size((error, size) => {
                if (error) {
                    logError('获取图片的尺寸失败', error.message);

                    // 没有获取到即认为文件尺寸为 0, 0
                    resolve({
                        width: 0,
                        height: 0
                    });
                }

                resolve(size);
            });
    });
}

/**
 * 图像生成 XML 文件
 * @param outputPath 图像输出的地址
 */
function generateXML(outputPath: string, componentData: ComponentData): Promise<void> {
    const pathObject = path.parse(outputPath);
    const componentName = 'demo';
    const filename = pathObject.name;
    const XMLOutputPath = path.join(pathObject.dir, filename + '.xml');

    // 同时生成一份图片对应的 XML
    return pictureToXML(
        outputPath,
        componentName,
        XMLOutputPath,
        componentData
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
            console.log('error', error);
            reject(error);
        } else {
            resolve(true);
        }
    };
}

// 缩放
export function resize(inputPath: string, outputPath: string, finalWidth: number): Promise<void> {
    return new Promise((resolve, reject) => {
        gm(inputPath)
            .resize(finalWidth)
            .write(outputPath, handle(resolve, reject));
    });
}

/**
 * 组件图片嵌入至随机选取的背景中
 * @param inputPath 组件的路径
 * @param outputPath 组件图片嵌入背景后输出的路径
 */
async function composite(inputPath: string, outputPath: string): Promise<ComponentData> {
    let componentPath = inputPath;

    // 随机选取一张背景图
    const backgroundPath = await getBackgroundRandom();
    // 获取背景图的尺寸
    const backgroundSize = await getSize(backgroundPath);
    // 获取组件的尺寸
    const componentSize = await getSize(inputPath);

    let { width: componentWidth, height: componentHeight } = componentSize;

    // 组件的尺寸必须小于背景图的尺寸，即宽高都小于背景图，且小于等于一定比例，目前设为 0.8
    // 如果大于这个比例就缩小组件图的尺寸
    const rateStandard = 0.8;
    const rateWidth = componentSize.width / backgroundSize.width;
    const rateHeight = componentSize.height / backgroundSize.height;

    // 使用最大的比率来计算组件图缩小后的尺寸大小
    const maxRate = Math.max(rateWidth, rateHeight);

    if (maxRate > rateStandard) {
        const deltaRate = rateStandard / maxRate;
        const finalWidth = componentSize.width * deltaRate;
        const finalHeight = componentSize.height * deltaRate;

        // 缩小图片
        await resize(inputPath, outputPath, finalWidth);

        // 重新设置组件的路径
        // 重新设置组件的尺寸以便后面计算
        componentWidth = finalWidth;
        componentHeight = finalHeight;

        componentPath = outputPath;
    }

    // 在上述前提下，组件图一定能放在背景图上，但是放置的位置也有一个范围，这里就是计算这个范围的过程
    const maxX = backgroundSize.width - componentWidth;
    const maxY = backgroundSize.height - componentHeight;

    // 随机选取一个坐标来放置
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    const xmax = x + componentWidth;
    const ymax = y + componentHeight;

    // 开始图片拼接了
    return new Promise((resolve, reject) => {
        gm(backgroundPath)
            .composite(componentPath)
            .geometry(`+${x}+${y}`)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => {
            // 返回 XML 文件需要知道的坐标信息
            return {
                box: {
                    xmin: x,
                    xmax,
                    ymin: y,
                    ymax
                },
                size: {
                    width: componentWidth,
                    height: componentHeight
                }
            };
        });
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
        // .then(() => generateXML(outputPath))
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
        // .then(() => generateXML(outputPath))
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
        // .then(() => generateXML(outputPath))
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
        // .then(() => generateXML(outputPath))
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
export async function adjustBrightness(input: ImageInput, brightness: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-brightness-${brightness}` });

    const componentData = await composite(path, outputPath);

    return new Promise((resolve, reject): void => {
        gm(outputPath)
            .modulate(brightness, 100, 100)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath, componentData))
        .catch(() => false);
}

/**
 * 调整图片的对比度
 * @param input 输入的图像信息
 * @param delta 图像亮度的值，基准值是 100，比 100 高则是增加亮度，比 100 低则是减少亮度
 */
export async function adjustContrast(input: ImageInput, multiplier: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-contrast-${multiplier}` });

    const componentData = await composite(path, outputPath);

    return new Promise((resolve, reject): void => {
        gm(outputPath)
            .contrast(multiplier)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath, componentData))
        .catch(() => false);
}

/**
 * 调整图片的色相
 * @param input 输入的图像信息
 * @param hue 图像色相的值，基准值是 100，比 100 高则是增加色相，比 100 低则是减少色相
 */
export async function adjustHue(input: ImageInput, hue: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-hue-${hue}` });

    const componentData = await composite(path, outputPath);

    return new Promise((resolve, reject): void => {
        gm(outputPath)
            .modulate(100, 100, hue)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath, componentData))
        .catch(() => false);
}

/**
 * 调整图片的饱和度
 * @param input 输入的图像信息
 * @param saturation 图像饱和度的值，基准值是 100，比 100 高则是增加饱和度，比 100 低则是减少饱和度
 */
export async function adjustSaturation(input: ImageInput, saturation: number): Promise<any> {
    const { path, name, ext } = input;
    const outputPath = getOutputPath({ name, ext, modifier: `adjust-saturation-${saturation}` });

    const componentData = await composite(path, outputPath);

    return new Promise((resolve, reject): void => {
        gm(outputPath)
            .modulate(100, saturation, 100)
            .write(outputPath, handle(resolve, reject));
    })
        .then(() => generateXML(outputPath, componentData))
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
