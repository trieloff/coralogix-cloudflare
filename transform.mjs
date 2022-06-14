import fs from 'fs';

const cftext = fs.readFileSync('./cloudflare.jsonc', 'utf8');
const cfjson = JSON.parse(cftext);

const fullobj = {
  'RequestHeaders': {
    // ClientRequestReferer
    "referer": "https:\/\/blog.adobe.com\/jp\/publish\/2022\/06\/14\/cc-design-fresco-creative-relay-27-nanahara",
    // ClientRequestUserAgent
    "user-agent": "Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/605.1.15 (KHTML, like Gecko) Version\/15.5 Safari\/605.1.15",
    // ClientDeviceType
    "user-agent-type": "desktop",
    // RequestHeaders.accept
    "accept-content": "image\/webp,image\/png,image\/svg+xml,image\/*;q=0.8,video\/*;q=0.8,*\/*;q=0.5",
    // RequestHeaders.accept-language
    "accept-language": "en-GB,en;q=0.9",
    // RequestHeaders.accept-encoding
    "accept-encoding": "gzip",
    // RequestHeaders.accept-charset
    "accept-charset": "",
    // RequestHeaders.If-Modified-Since
    "if-modified-since": "",
    // RequestHeaders.If-Connection
    "connection": "",
    // RequestHeaders.Forwarded
    "forwarded": "",
    // RequestHeaders.cdn-loop
    "cdn-loop": "Fastly, Fastly, Fastly, Fastly",
    // RequestHeaders.via
    "via": "",
    // RequestHeaders.cache-control
    "cache_control": "",
    "x-forwarded-host": "blog.adobe.com, main--blog--adobe.hlx.live, main--blog--adobe.hlx.live",
    "x-forwarded-for": "93.138.115.174, 146.75.2.122, 157.52.106.64",
    "x-push-invalidation": "enabled",
    "x-byo-cdn-type": "fastly"
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

function camelCase(str) {
  const dashes = str.replace(/[-_](\w)/g, (match, letter) => letter.toUpperCase());
  // first letter is always upper case
  return dashes.charAt(0).toUpperCase() + dashes.slice(1);
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

console.log(makeRegex(cfjson));