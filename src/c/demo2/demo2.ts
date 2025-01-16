import ffi from "ffi-napi";
import ref from "ref-napi";
import StructType from "ref-struct-napi";

// 定义结构体类型：Person
const PersonStruct = StructType({
  id: "int",
  name: "string",
});

interface Person {
  id: number;
  name: string;
}

interface MyLibrary {
  add: (a: number, b: number) => number;
  multiplyAndUpdate: (a: number, b: number, c: number) => void;
  createPerson: (age: number, name: string) => Person;
  greet: (name: string) => string;
}

// 加载共享库
const myLibrary = ffi.Library("./libmylibrary", {
  // 声明 add 函数，接受两个 int 类型的参数，返回一个 int 类型的值
  add: ["int", ["int", "int"]],

  // 声明 multiplyAndUpdate 函数，接受两个 int 类型的参数，修改一个 int 指针
  multiplyAndUpdate: ["void", [ref.refType("int"), "int", "int"]],

  // 声明 createPerson 函数，接受两个参数，返回一个 Person 结构体
  createPerson: [PersonStruct, ["int", "string"]],

  // 声明 greet 函数，接受一个字符串参数，返回一个字符串
  greet: ["string", ["string"]],
}) as MyLibrary

// 调用 add 函数
const sum = myLibrary.add(10, 20)
console.log(sum)

// 调用 multiplyAndUpdate 函数
let result = ref.alloc("int")
myLibrary.multiplyAndUpdate(result, 5, 10)
console.log(`Multiplication Result: ${result}`);  // 输出：Multiplication Result: 50

// 调用 createPerson 函数
const person = myLibrary.createPerson(30, 'Lee42')
console.log(`Person: ${person.id}, ${person.name}`)

// 调用 greet 函数
const greeting = myLibrary.greet('Lee42')
console.log(greeting)
