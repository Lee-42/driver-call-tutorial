#include <stdio.h>

typedef struct {
    int id;
    char name[50];
} Person;

// 返回 int 类型
int add(int a, int b) {
    return a + b;
}

// 返回 void 类型，带有多个参数，修改传入的指针
void multiplyAndUpdate(int* result, int a, int b) {
    *result = a * b;
}

// 返回一个结构体，传递结构体作为参数
Person createPerson(int id, const char* name) {
    Person p;
    p.id = id;
    snprintf(p.name, sizeof(p.name), "%s", name);
    return p;
}

// 返回一个字符串
const char* greet(const char* name) {
    static char greeting[100];
    snprintf(greeting, sizeof(greeting), "Hello, %s!", name);
    return greeting;
}
