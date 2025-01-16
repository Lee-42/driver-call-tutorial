const ffi = require("ffi-napi");
const ref = require("ref-napi");
const { join } = require("path");
const StructType = require("ref-struct-napi");

const dirverFile = join(__dirname, "./demo3.dll");

// 定义结构体类型：Person
const Person = StructType({
  id: "int",
  name: "string",
});

// 加载共享库
const myComplexLibrary = ffi.Library(dirverFile, {
  // 声明 add 函数，接受两个 int 类型的参数，返回一个 int 类型的值
  add: ["int", ["int", "int"]],

  // 声明 multiply 函数，接受两个 float 类型的参数，返回一个 float 类型的值
  multiply: ["float", ["float", "float"]],

  // 声明 greet 函数，接受一个字符串参数，返回一个字符串
  greet: ["string", ["string"]],

  // 声明 updateValue 函数，接受一个 int 指针和一个 int 参数，修改传入的值
  updateValue: ["void", [ref.refType("int"), "int"]],

  // 声明 updateString 函数，接受一个 char* 指针并修改字符串
  updateString: ["void", [ref.refType("string"), "string"]],

  // 声明 createPerson 函数，返回一个 Person 结构体
  createPerson: [Person, ["int", "string"]],

  // 声明 sumArray 函数，接受一个 int 数组，返回一个 int 类型的结果
  sumArray: ["void", [ref.refType("int"), "int", ref.refType("int")]],

  // 声明 processArrayWithCallback 函数，接受一个回调函数作为参数
  processArrayWithCallback: ["void", [ref.refType("int"), "int", "pointer"]],
});

// 回调函数示例：打印每个元素
function printElement(value) {
  console.log(`Element: ${value}`);
}

// 1. 调用 add 函数
const sum = myComplexLibrary.add(10, 20);
console.log(`Sum: ${sum}`); // 输出：Sum: 30

// 2. 调用 multiply 函数
const product = myComplexLibrary.multiply(5.5, 4.2);
console.log(`Product: ${product}`); // 输出：Product: 23.1

// 3. 调用 greet 函数
const greeting = myComplexLibrary.greet("Alice");
console.log(greeting); // 输出：Hello, Alice!

// 4. 调用 updateValue 函数
let value = ref.alloc("int");
value.writeInt32LE(10); // 初始化为10
myComplexLibrary.updateValue(value, 5); // 增加5
console.log(`Updated Value: ${value.deref()}`); // 输出：Updated Value: 15

// 5. 调用 updateString 函数
let str = ref.alloc("string");
str.writeCString("Hello");
myComplexLibrary.updateString(str, "Goodbye");
console.log(`Updated String: ${str.deref()}`); // 输出：Updated String: Goodbye

// 6. 调用 createPerson 函数
const person = myComplexLibrary.createPerson(1, "John Doe");
console.log(`Person ID: ${person.id}, Name: ${person.name}`); // 输出：Person ID: 1, Name: John Doe

// 7. 调用 sumArray 函数
const arr = [1, 2, 3, 4, 5];
let result = ref.alloc("int");
myComplexLibrary.sumArray(ref.alloc("int", arr[0]), arr.length, result); // 汇总数组元素
console.log(`Array Sum: ${result.deref()}`); // 输出：Array Sum: 15

// 8. 调用 processArrayWithCallback 函数
myComplexLibrary.processArrayWithCallback(
  ref.alloc("int", arr[0]),
  arr.length,
  ffi.Callback("void", ["int"], printElement)
);
// 输出：
// Element: 1
// Element: 2
// Element: 3
// Element: 4
// Element: 5
