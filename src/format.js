const ref = require('ref-napi');
const iconv = require("iconv-lite");

function msgFormat(msg)
{
    if (isJSON(ref.readCString(msg))) {
        return JSONParse(ref.readCString(msg));
    } else {
        return iconv.decode(msg, 'gbk').replaceAll('\u0000', ' ').trim();
    }
}

function isJSON(str)
{
    return typeof (str) == 'string' && str.startsWith("{") && str.endsWith("}");
}

function JSONParse(str)
{
    let obj = JSON.parse(str);
    for (let a in obj) {
        if (isJSON(obj[a])) {
            obj[a] = JSONParse(obj[a]);
        } else if (typeof (obj[a]) == 'string') {
            obj[a] = obj[a].trim();
        }
    }
    return obj
}

module.exports = {
    msgFormat,
}