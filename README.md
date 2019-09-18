# 图片训练集扩充工具

## 安装

安装至全局作为命令行工具使用：

```sh
npm i ai-image-creator -g
```

安装至本地作为模块调用：

```sh
npm i ai-image-creator -S
```

## 使用

### 作为命令行工具使用时：

```
aiimg [options]
```

Options:
  -i --input <path>   输入要转换的图片父目录
  -o --output <path>  输入要生成的图片父目录

### 作为模块使用

```js
import { start } from 'ai-image-creator'

// start 可以接收两个参数，分别是源图片父目录，目标图片生成目录，返回 Promise
// 不传的话源图片父目录就是当前地址，目标图片生成目录就是当前地址下的 output 文件夹
start();
```
