import fs from 'fs';

const cftext = fs.readFileSync('./cloudflare2.jsonc', 'utf8');
const cfjson = JSON.parse(cftext);

const fullobj = {
  Cookies: {
    'Cookie-Name': 'string',
  },
  'RequestHeaders': {
    "accept": "string",
    "accept-language": "string",
    "accept-encoding": "string",
    "accept-charset": "string",
    "if-modified-since": "string",
    "connection": "string",
    "forwarded": "string",
    "cdn-loop": "string",
    "via": "string",
    "x-forwarded-host": "string",
    "x-forwarded-for": "string",
    "x-push-invalidation": "string",
    "x-byo-cdn-type": "string",
  },
  'ResponseHeaders': {
    "content-type": "image\/webp", // EdgeResponseContentType
    "content-encoding": "", // 
    "age": "",
    "cache-control": "max-age=7200, must-revalidate",
    "expires": "",
    "cdn-cache-control": "",
    "surrogate-control": "",
    "last-modified": "",
    "vary": "",
    "surrogate-key": "main--blog--adobe 9b08ed882cc3217ceb23a3e71d769dbe47576312869465a0a302ed29c6d",
    "x-robots-tag": "",
    "x-error": "",
    // "fastly_io_error": "",
    // "fastly_io_warning": "",
    // "fastly_io_info": "ifsz=1239159 idim=1200x843 ifmt=jpeg ofsz=237230 odim=1200x843 ofmt=webp"
  },
};

const replacements = {
  RequestHeaders: 'ReqH',
  ResponseHeaders: 'ResH',
};

function camelCase(str) {
  const shortstr = replacements[str] || str;
  const dashes = shortstr.replace(/[-_](\w)/g, (match, letter) => letter.toUpperCase());
  // first letter is always upper case
  return (dashes.charAt(0).toUpperCase() + dashes.slice(1)).substr(0, 30);
}

function makeRegex(obj, parent = '') {
  return '{\\s*(' + Object.entries(obj)
    .map(([name, value]) => ([name, typeof value === 'object' ? value : typeof value]))
    .map(([name, type]) => `"${name}"\\s*:\\s*` + captureType(type, parent + name))
    //.map((line, index) => `${line}${(index + 1) < Object.entries(obj).length ? '\\s*,\\s*' : ''})?`)
    .join("\\s*)?(,\\s*") + ')?\\s*}';
}

function captureType(type, name) {
  if (type === 'string') {
    return `"(?P<${camelCase(name)}>[^"]*)"`;
  }
  if (typeof type === 'object') {
    return makeRegex(Object.assign(type,
      fullobj[name]
    ), name);
  }
  if (type === 'number') {
    return `(?P<${name}>\\d+)`;
  }
  return `(?P<${name}>[^,}]+)`;
}

class ArrayExpression {
  constructor(arr, name, parent = '') {
    this.name = name;
    this.parent = parent;
  }
  toString() {
    return `"${this.name}"\\s*:\\s*\\[(?P<${camelCase(this.parent) + camelCase(this.name)}>[^\\]]*)\\]`;
  }
}

class StringExpression {
  constructor(arr, name, parent = '') {
    this.name = name;
    this.parent = parent;
  }

  toString() {
    return `"${this.name}"\\s*:\\s*"(?P<${camelCase(this.parent) + camelCase(this.name)}>[^"]*)"`;
  }
}

class NumberExpression {
  constructor(value, name, parent = '') {
    this.name = name;
    this.parent = parent;
  }

  toString() {
    return `"${this.name}"\\s*:\\s*(?P<${camelCase(this.parent) + camelCase(this.name)}>[\\d.]+)`;
  }
}

class BooleanExpression {
  constructor(value, name, parent = '') {
    this.name = name;
    this.parent = parent;
  }

  toString() {
    return `"${this.name}"\\s*:\\s*(?P<${camelCase(this.parent) + camelCase(this.name)}>true|false)`;
  }
}

class ObjExpression {
  constructor(obj, name, parent) {
    this.name = name || '';
    this.subexpressions = Object
      .keys(Object.assign(fullobj[this.name] || {}, obj))
      //.slice(0, 15)
      .map(key => {
        if (Array.isArray(obj[key])) {
          return new ArrayExpression(obj[key], key, this.name);
        }
        if (typeof obj[key] === 'object') {
          return new ObjExpression(obj[key], key, this.name);
        }
        if (typeof obj[key] === 'string') {
          return new StringExpression(obj[key], key, this.name);
        }
        if (typeof obj[key] === 'boolean') {
          return new BooleanExpression(obj[key], key, this.name);
        }
        return new NumberExpression(obj[key], key, this.name);
      });
  }
  toString() {
    const inner = this.subexpressions
      .map(expr => expr.toString())
      .map(expr => `(${expr})?`)
      .join('\\s*,?\\s*');
    if (this.name) {
      return `"${this.name}"\\s*:\\s*{\\s*${inner}\\s*}`;
    } else {
      return `^{\\s*${inner}\\s*`;
    }
  }
}

//console.log(makeRegex(cfjson));
//console.log(new ObjExpression(cfjson.RequestHeaders, 'RequestHeaders').toString());
console.log(new ObjExpression(cfjson).toString());