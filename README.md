# AI Image Creator

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme) [![workflow badge](https://github.com/vabaly/ai-image-creator/workflows/continuous-integration-workflow/badge.svg)](https://github.com/vabaly/ai-image-creator)

AI Image Creator 是一款可以将 1 张图片一键生成 40+ 张衍生图片的工具，它也可以深度遍历一个文件夹，将里面的所有图片都产生 40+ 张衍生图片，从而达到对一个图库扩充 40+ 倍的效果。

## 目录

- [背景](#背景)
- [安装](#安装)
- [使用](#使用)
- [贡献者](#贡献者)
- [许可证](#许可证)

## 背景

为了解决对象识别中训练集不足的问题，同时又需要使用 [Node.js](https://nodejs.org) 技术栈，此工具应运而生，它可以通过对训练集中的图片进行翻转，调节亮度、饱和度、色相、对比度等来产生 40 倍的新训练集，后续会逐渐增加新的产生方法，从而达到更大规模。

关于背景更详细的介绍请[阅读此文](https://github.com/vabaly/blog/issues/2)。

## 安装

### 安装依赖

AI Image Creator 依赖于 [GraphicsMagick](http://www.graphicsmagick.org/) ，因此首先需要下载和安装 [GraphicsMagick](http://www.graphicsmagick.org/)。如果是 macOS 系统，可以轻松地用 [Homebrew](http://mxcl.github.io/homebrew/) 安装：

```sh
brew install graphicsmagick
```

Windows 系统可以前往 [官网下载页面](http://www.graphicsmagick.org/download.html) 下载安装包，如果下载链接打不开可以前往 [SourceForge](https://sourceforge.net/projects/graphicsmagick/files/) 下载。 Linux 系统一般可以使用包管理器安装。

### 全局安装

AI Image Creator 可以通过 [npm](https://www.npmjs.com/) 全局安装：

```sh
npm i image-creator -g
```

### 本地安装

AI Image Creator 也可以通过 [npm](https://www.npmjs.com/) 安装在项目内：

```sh
npm i image-creator -S
```

## 使用

### 命令行

AI Image Creator 可以用过命令行的方式调用。如果是安装在全局，则直接在终端运行 `aiimg [options]` 即可。如果是安装在项目内，则在项目根目录下通过 `npx aiimg [options]` 运行。

其中，`options` 支持以下几种参数：

* `-i --input <path>`， `path` 为源图片路径或者包含源图片的目录路径，默认是当前目录。
* `-o --output <path>`， `path` 为生成的图片目录路径，默认是当前目录下的 `output` 文件夹。
* `--output <paths>`，`paths` 为遍历时忽略的文件夹或文件名，多个文件或文件夹名用 `,` 分隔，暂时不支持 Glob 匹配。

例如，下面的命令就是将 `images` 目录下除去 `dog` 和 `cat` 两个目录的所有图片都生成出衍生图片至 `outputs` 文件夹：

```
aiimg -i images/ -o outputs --ignore images/dog,images/cat
```

### Node API

AI Image Creator 可以作为 `Node` 模块被调用：

```js
import { start } from 'ai-image-creator'

/**
 * @param {string} input 源图片路径或者包含源图片的目录路径，默认是当前目录
 * @param {string} output 生成的图片目录路径，默认是当前目录下的 output 文件夹
 * @param {object} options 参数配置
 * @param {string|string[]} options.ignore 遍历时忽略的文件夹或文件名，暂时不支持 Glob 匹配
 * @return {Promise} 生成完毕后会返回一个 Promise
 */
start(input, output, options);
```

## Todo

- [ ] 支持 Glob 忽略模式
- [ ] 支持自定义调节生成图片的配置

## 贡献

欢迎大家提 [ISSUE](https://github.com/vabaly/ai-image-creator/issues/new) 帮助改进问题，或者提交 `PR` 来帮助改进和新增功能。

## 许可证

[MIT © vabaly.](./LICENSE)
