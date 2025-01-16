const ffi = require('ffi-napi');
const ref = require('ref-napi');
const StructType = require('ref-struct-napi');

// 定义结构体类型：Person
const Person = StructType({
  id: 'int',
  name: 'string'
});

// 加载共享库
const myLibrary = ffi.Library('./libmylibrary', {
  // 声明 add 函数，接受两个 int 类型的参数，返回一个 int 类型的值
  'add': ['int', ['int', 'int']],

  // 声明 multiplyAndUpdate 函数，接受两个 int 类型的参数，修改一个 int 指针
  'multiplyAndUpdate': ['void', [ref.refType('int'), 'int', 'int']],

  // 声明 createPerson 函数，接受两个参数，返回一个 Person 结构体
  'createPerson': [Person, ['int', 'string']],

  // 声明 greet 函数，接受一个字符串参数，返回一个字符串
  'greet': ['string', ['string']]
});

// 1. 调用 add 函数
const sum = myLibrary.add(10, 20);
console.log(`Sum: ${sum}`);  // 输出：Sum: 30

// 2. 调用 multiplyAndUpdate 函数
let result = ref.alloc('int');  // 为结果分配一个 int 指针
myLibrary.multiplyAndUpdate(result, 5, 10);
console.log(`Multiplication Result: ${result.deref()}`);  // 输出：Multiplication Result: 50

// 3. 调用 createPerson 函数，返回一个结构体
const person = myLibrary.createPerson(1, 'John Doe');
console.log(`Person ID: ${person.id}, Name: ${person.name}`);  // 输出：Person ID: 1, Name: John Doe

// 4. 调用 greet 函数
const greeting = myLibrary.greet('Alice');
console.log(greeting);  // 输出：Hello, Alice!


