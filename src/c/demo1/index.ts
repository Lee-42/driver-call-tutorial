import ffi from 'ffi-napi';
import { join } from 'path';

// 1. 定义接口，描述 myLibrary 的结构
interface MyLibrary {
  add(a: number, b: number): number;
}

// 指定 DLL 文件的路径
const driverFile = join(__dirname, './myLibrary.dll');

// 2. 使用 ffi 加载库，并指定类型为 MyLibrary 接口
const myLibrary = ffi.Library(driverFile, {
  // 定义 add 函数的返回类型和参数类型
  add: ['int', ['int', 'int']],
}) as MyLibrary;

// 3. 调用 add 函数
const result: number = myLibrary.add(1, 2)
console.log(result);
