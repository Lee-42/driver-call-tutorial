#include <stdio.h>
#include <string.h>

typedef struct {
    int id;
    char name[50];
} Person;

// 返回基本类型（int）
int add(int a, int b) {
    return a + b;
}

// 返回基本类型（float）
float multiply(float a, float b) {
    return a * b;
}

// 返回基本类型（char*）
const char* greet(const char* name) {
    static char greeting[100];
    snprintf(greeting, sizeof(greeting), "Hello, %s!", name);
    return greeting;
}

// 通过指针修改值
void updateValue(int* value, int delta) {
    *value += delta;
}

// 通过指针修改字符串
void updateString(char** str, const char* newStr) {
    *str = strdup(newStr);  // 分配新的字符串
}

// 结构体作为参数和返回值
Person createPerson(int id, const char* name) {
    Person p;
    p.id = id;
    snprintf(p.name, sizeof(p.name), "%s", name);
    return p;
}

// 数组作为参数
void sumArray(int* arr, int size, int* result) {
    *result = 0;
    for (int i = 0; i < size; i++) {
        *result += arr[i];
    }
}

// 使用回调函数
void processArrayWithCallback(int* arr, int size, void (*callback)(int)) {
    for (int i = 0; i < size; i++) {
        callback(arr[i]);
    }
}
