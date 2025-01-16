const ffi = require('ffi-napi')
const ref = require('ref-napi')
const { join } = require('path')

const dirverFile = join(__dirname, './myLibrary.dll')

const myLibrary = ffi.Library(dirverFile, {
    add: ['int', ['int', 'int']]
})

const result = myLibrary.add(10, 20)
console.log(result)