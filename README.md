# driver-call-tutorial

#### 一、关于 ffi-napi

1、ffi-napi 是一个 Node.js 原生模块，用于通过 FFI（Foreign Function Interface，外部函数接口）与本地 C/C++ 代码交互。
它使得 JavaScript 可以调用由 C 或 C++ 编写的本地函数，进行底层操作，如调用动态链接库（DLL）或共享库（.so 文件），并可以与 C 函数进行数据交换。

2、与 ref-napi 配合使用： ffi-napi 依赖于 ref-napi 来处理原生数据类型和指针。
ref-napi 允许你在 JavaScript 中处理 C 类型的数据（例如，int、string、char\* 等），并将它们传递给 C 函数。

#### 二、简单例子

1、假设我们有一个名为 myLibrary.c 的 C 代码文件，其中包含一个简单的加法函数

```c
// myLibrary.c
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}
```

我们将这个文件编译为一个共享库（.so 或 .dll 文件）。 myLibrary.c
window
```shell
gcc 
```

2、在 Node.js 中使用 ffi-napi 调用 C 函数

```js
const ffi = require("ffi-napi");
const ref = require("ref-napi");

// 加载 C 库
const myLibrary = ffi.Library("./libmylibrary", {
  // 声明 C 函数的签名
  add: ["int", ["int", "int"]], // 函数名为 'add'，返回类型为 int，接受两个 int 参数
});

// 调用 add 函数
const result = myLibrary.add(5, 7);
console.log("Result:", result); // 输出: Result: 12
```
