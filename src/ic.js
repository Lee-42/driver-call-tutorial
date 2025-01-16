/**
 * 南天高拍仪
 */

const ffi = require('ffi-napi')
const ref = require('ref-napi')
const msgFormat = require('./format').msgFormat
const iconv = require('iconv-lite')
const { join } = require('path')

const strPtr = ref.refType('string')
const intPtr = ref.refType('int')
const WORD = ref.types.uint16

const { fail } = require('assert')
const libFile = join(__dirname, "./libIc_nantian.dll")

const pushMsg = ffi.Callback('void', ['string'], function (msg) {
  console.log('pushMsg: ', msg)
})

const IC = ffi.Library(libFile, {
  initDriver: ['int', ['pointer']],
  setPortAttr: ['void', ['string', 'int', 'int', 'int', 'string']],
  // 读取IC卡客户信息并获取ARQC
  getICCardInfo: ['int', ['string', strPtr, strPtr, 'int', 'int']],
  // 从IC卡获取ARQC
  genARQC: ['int', ['string', strPtr, strPtr, 'int', 'int']],
  // 向IC卡发送ARPC，发送写卡脚本
  ARPC_ExeICScript: ['int', ['string', strPtr, strPtr, 'int', 'int']],
  // 读IC卡交易明细
  GetTxDetail: ['int', ['string', strPtr, strPtr, 'int', 'int']],
  // 读取IC卡圈存日志
  readloadlog: ['int', ['string', strPtr, strPtr, 'int', 'int']],
})

//20241223 jlwang add
const initDriver = (pushMsg) => {
  let ret = IC.initDriver(pushMsg)
  return ret
}

const setPortAttr = (port, len, baud, extport, cfgstr) => {
  IC.setPortAttr(port, len, baud, extport, cfgstr)
}

const setPortAttr4 = (port, baud, extport, cfgstr) => {
  let len = port.length
  if (len > 0) {
    IC.setPortAttr(port, len, baud, extport.length > 0 ? extport.charCodeAt(0) : 0, cfgstr)
  }
}

const init = () => {
  initDriver(pushMsg)
  setPortAttr("COM4", 4, 9600, 0, '')

//   // 调用 setPortAttr
//   let attrs = deviceAttrs
//   for (let i = 0; i < attrs.length; i++) {
//     let attr = attrs[i]
//     if (!('type' in attr)) {
//       continue
//     }

//     if (attr.type == DeviceType.IC) {
//       let port = 'USB'
//       let baud = 9600
//       let extport = 0
//       let cfgstr = ''
//       if ('port' in attr) {
//         port = attr.port
//       }
//       if ('baud' in attr) {
//         let value = new Number(attr.baud)
//         if (!isNaN(value) && value > 0) {
//           baud = value
//         }
//       }
//       if ('extport' in attr && attr.extport.length > 0) {
//         extport = attr.extport.charCodeAt(0)
//       }
//       if ('cfgstr' in attr) {
//         cfgstr = attr.cfgstr
//       }

//       this.setPortAttr(port, port.length, baud, extport, cfgstr)
//       break
//     }
//   }
}


const getICCardInfo = (callback, readTimeOut = 180, writeTimeOut = 180) => {
  const { success, fail } = callback
  let tagMap = {
    A: 'cardNO', // 卡号
    B: 'name', // 姓名
    C: 'cardType', // 证件类型
    D: 'number', // 证件号
    E: 'track2', // 二磁道数据
    F: 'track1', // 一磁道数据
    G: 'balance', // 现金余额
    H: 'balanceLimit', //  余额上限
    I: 'apply_expiration_date', // 应用失效日期
    J: 'serialNumber', // 卡序列号
    K: 'ectBalance', // 电子现金交易限额
  }
  const args = JSON.stringify({
    TagList: Object.keys(tagMap).join('|'),
    AIDList: 'A000000333010101',
    isReadArqc: 'false',
    aryInput: 'S006330801U006150119',
  })

  let params = iconv.encode(args, 'gbk')
  let resBuf = Buffer.alloc(4 * 1024 * 1024)
  let errBuf = Buffer.alloc(256)
  let result = IC['getICCardInfo'](params, resBuf, errBuf, readTimeOut, writeTimeOut) || 0

  const res = msgFormat(resBuf)
  const err = msgFormat(errBuf)

  if (result === 0) {
    if (success) {
      const { IcARQC, IcInfo } = res
      // "A0196231132201000678334B026                          C00200D024                        E0366231132201000678334=2512220999653524F000G012000000000000H012000000100000I006251231J003000K012000000100000"
      const regex = /([A-Z])([0-9]+)/g
      let match
      // 使用正则提取匹配项
      let icInfo = {}
      while ((match = regex.exec(IcInfo)) !== null) {
        const [_, key, value] = match
        const k = tagMap[key]
        icInfo[k] = value.slice(3)
      }
      success(icInfo)
    }
  } else if (fail) {
    fail({
      code: result,
      message: err,
    })
  }
}


init()

getICCardInfo({
    success: (info) => console.log('info: ', info),
    fail: (err) => console.log('err: ', err)
})