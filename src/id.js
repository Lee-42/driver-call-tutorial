/**
 * 南天高拍仪
 */

const ffi = require("ffi-napi");
const ref = require("ref-napi");
const iconv = require("iconv-lite");
const msgFormat = require("./format").msgFormat;

const { join } = require("path");

const strPtr = ref.refType("string");
const _int = ref.types.int
const _void = ref.types.void
const intPtr = ref.refType("int");
const WORD = ref.types.uint16;

const libFile = join(__dirname, "./libid_nantian.dll");

const pushMsg = ffi.Callback("void", ["string"], function (msg) {
  console.log('pushMsg: ', msg)
});

const ID = ffi.Library(libFile, {
  initDriver: [_int, ["pointer"]],
  setPortAttr: [_void, ["string", _int, _int, _int, "string"]],
  // 打开设备
  OpenDevice: [_int, ["string", strPtr, strPtr, _int, _int]],
  // 关闭设备
  CloseDevice: [_int, ["string", strPtr, strPtr, _int, _int]],
  // 证件类型确定
  getIDType: [_int, ["string", strPtr, strPtr, _int, _int]],
  // 读取二代身份证信息
  GetIdCardInfo: [_int, ["string", strPtr, strPtr, _int, _int]],
  // 读取永久居留证信息
  getForeginCardInfo: [_int, ["string", strPtr, strPtr, _int, _int]],
  // 读取港澳台居民居留证信息
  getGATCardInfo: [_int, ["string", strPtr, strPtr, _int, _int]],
  //  通用测试方法
  Test: [_int, ["string", strPtr, strPtr, _int, _int]],
});

const initDriver = (pushMsg) => {
  let ret = ID.initDriver(pushMsg);
  return ret;
};

const setPortAttr = (port, len, baud, extport, cfgstr) => {
  ID.setPortAttr(port, len, baud, extport, cfgstr);
};

const OpenDevice = (
  args = "",
  callback,
  readTimeOut = 180,
  writeTimeOut = 180
) => {
  let params = iconv.encode(args, "gbk");
  let resmsg = Buffer.alloc(4 * 1024 * 1024);
  let errmsg = Buffer.alloc(256);
  let result = 0;
  result = ID.OpenDevice(params, resmsg, errmsg, readTimeOut, writeTimeOut);
  msgFormat(errmsg);
  if (callback) {
    callback(msgFormat(errmsg), msgFormat(resmsg));
  }
  return result;
};

const setPortAttr4 = (port, baud, extport, cfgstr) => {
  let len = port.length;
  if (len > 0) {
    ID.setPortAttr(
      port,
      len,
      baud,
      extport.length > 0 ? extport.charCodeAt(0) : 0,
      cfgstr
    );
  }
};

const init = () => {
  initDriver(pushMsg);
  setPortAttr("COM4", 4, 9600, 0, "");
};

const getIdCardInfo = (callback, readTimeOut = 180, writeTimeOut = 180) => {
  const { success, fail } = callback;
  let params = iconv.encode("", "gbk");
  let resBuf = Buffer.alloc(4 * 1024 * 1024);
  let errBuf = Buffer.alloc(256);
  let result =
    ID["GetIdCardInfo"](params, resBuf, errBuf, readTimeOut, writeTimeOut) || 0;

  let res = msgFormat(resBuf);
  let err = msgFormat(errBuf);

  if (result === 0) {
    if (success) {
      // todo 这里应该驱动层处理，妈的
      // 姓名^_^性别^_^民族^_^出生日期^_^住址^_^公民身份号码^_^签发机关^_^有效期始^_^有效期止^_^照片字符串
      res = res.split("^_^");
      let cardInfo = {};
      res[0] && (cardInfo["name"] = res[0]);
      res[1] && (cardInfo["gender"] = res[1]);
      res[2] && (cardInfo["nation"] = res[2]);
      res[3] && (cardInfo["birthday"] = res[3]);
      res[4] && (cardInfo["address"] = res[4]);
      res[5] && (cardInfo["idCard"] = res[5]);
      res[6] && (cardInfo["issuing_authority"] = res[6]);
      res[7] && (cardInfo["start"] = res[7]);
      res[8] && (cardInfo["end"] = res[8]);
      res[9] && (cardInfo["picture"] = res[9]);
      success(cardInfo);
    }
  } else if (fail) {
    fail({
      code: result,
      message: err,
    });
  }
};

init();
OpenDevice();
getIdCardInfo({
  success: (info) => console.log("info: ", info),
  fail: (err) => console.log("err: ", err),
});
