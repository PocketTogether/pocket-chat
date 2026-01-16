// 获取图标（最终 API）
export function fileTypeResolveIconContentUtil(data: {
  fileName: string
  fileType: string
}) {
  const category = classifyFile(data)
  return {
    riIconClass: CATEGORY_TO_RI_ICON[category],
    textColorTwcss:
      TEXT_POTO_COLOR_TWCSS_DICT[CATEGORY_TO_POTO_COLOR[category]],
  }
}

function classifyFile(data: {
  fileName: string
  fileType: string
}): keyof typeof CATEGORY_TO_RI_ICON {
  const mime = data.fileType.trim().toLowerCase()

  // 1. MIME 优先
  if (mime !== '' && MIME_TO_CATEGORY[mime] != null) {
    return MIME_TO_CATEGORY[mime]
  }

  // 2. 扩展名 fallback（支持多段后缀）
  const name = data.fileName.toLowerCase().trim()

  // 例如： "archive.tar.gz" → ["tar.gz", "gz"]
  const parts = name.split('.').filter(Boolean)

  if (parts.length > 1) {
    // 从最长后缀开始匹配
    for (let i = 1; i < parts.length; i++) {
      const ext = parts.slice(i).join('.') // tar.gz / gz
      if (EXT_TO_CATEGORY[ext] != null) {
        return EXT_TO_CATEGORY[ext]
      }
    }
  }

  // 单段后缀（如 "file.txt"）
  const lastExt = parts.length > 0 ? parts[parts.length - 1] : ''
  if (lastExt !== '' && EXT_TO_CATEGORY[lastExt] != null) {
    return EXT_TO_CATEGORY[lastExt]
  }

  // 3. fallback
  return 'file'
}

const CATEGORY_TO_RI_ICON = {
  image: 'ri-file-image-fill',
  video: 'ri-file-video-fill',
  audio: 'ri-file-music-fill',
  pdf: 'ri-file-pdf-2-fill',
  document: 'ri-article-fill',
  word: 'ri-file-word-fill',
  sheet: 'ri-file-excel-fill',
  slide: 'ri-file-ppt-fill',
  text: 'ri-file-text-fill',
  gif: 'ri-file-gif-fill',
  code: 'ri-file-code-fill',
  archive: 'ri-file-zip-fill',
  hwp: 'ri-file-hwp-fill',
  chart: 'ri-file-chart-fill', // 数据文件 / 存档文件
  game: 'ri-file-chart-2-fill', // 游戏文件 / 游戏资源包
  unknow: 'ri-file-unknow-fill',
  settings: 'ri-file-settings-fill', // 可执行文件
  lock: 'ri-file-lock-fill',
  shield: 'ri-file-shield-fill',
  time: 'ri-file-history-fill',
  damage: 'ri-file-damage-fill',
  user: 'ri-file-user-fill',
  upload: 'ri-file-upload-fill',
  download: 'ri-file-download-fill', // 可用于 .torrent
  transfer: 'ri-file-transfer-fill',
  search: 'ri-file-search-fill',
  info: 'ri-file-info-fill',
  warning: 'ri-file-warning-fill',
  add: 'ri-file-add-fill',
  reduce: 'ri-file-reduce-fill',
  marked: 'ri-file-marked-fill',
  file: 'ri-file-3-fill',
} as const

const TEXT_POTO_COLOR_TWCSS_DICT = {
  'harvest-wheat': 'text-poto-harvest-wheat',
  'amber-sand': 'text-poto-amber-sand',
  'clay-orange': 'text-poto-clay-orange',
  'ember-rust': 'text-poto-ember-rust',
  'terra-red': 'text-poto-terra-red',
  'plum-rose': 'text-poto-plum-rose',
  'violet-dusk': 'text-poto-violet-dusk',
  'indigo-mist': 'text-poto-indigo-mist',
  'mist-blue': 'text-poto-mist-blue',
  'dusk-cyan': 'text-poto-dusk-cyan',
  'moss-green': 'text-poto-moss-green',
  'olive-haze': 'text-poto-olive-haze',
  // 普通色 用于如 file
  'color-text': 'text-color-text',
} as const

const CATEGORY_TO_POTO_COLOR: Record<
  keyof typeof CATEGORY_TO_RI_ICON,
  keyof typeof TEXT_POTO_COLOR_TWCSS_DICT
> = {
  image: 'moss-green', // 图像 → 自然、摄影 → 绿
  video: 'indigo-mist', // 视频 → 蓝紫（Premiere、YouTube）
  audio: 'plum-rose', // 音频 → 紫（Podcast、Music）
  pdf: 'terra-red', // PDF → 红（Adobe）
  document: 'mist-blue', // 文档 → 蓝（Google Docs）
  word: 'mist-blue', // Word → 蓝
  sheet: 'moss-green', // Excel → 绿
  slide: 'clay-orange', // PPT → 橙
  text: 'olive-haze', // 纯文本 → 中性灰绿
  gif: 'amber-sand', // GIF → 明亮、有趣 → 黄橙
  code: 'dusk-cyan', // 代码 → 青（VSCode）
  archive: 'ember-rust', // 压缩包 → 棕/铁锈色
  hwp: 'mist-blue', // 韩文文档 → 文档系 → 蓝
  chart: 'amber-sand', // 图表 → 黄橙（分析/可视化）
  game: 'violet-dusk', // 游戏 → 紫（娱乐、创意）

  unknow: 'olive-haze', // 未知 → 中性灰绿

  settings: 'indigo-mist', // 可执行/设置 → 蓝（系统工具）
  lock: 'terra-red', // 加密 → 红（警示）
  shield: 'moss-green', // 安全 → 绿（通过/保护）
  time: 'mist-blue', // 历史记录 → 蓝
  damage: 'ember-rust', // 损坏 → 铁锈红（破损感）
  user: 'plum-rose', // 用户 → 紫粉（身份）

  upload: 'dusk-cyan', // 上传 → 青（动作）
  download: 'dusk-cyan', // 下载 → 青（动作）
  transfer: 'indigo-mist', // 传输 → 蓝（网络）
  search: 'mist-blue', // 搜索 → 蓝（信息）
  info: 'indigo-mist', // 信息 → 蓝（系统提示）
  warning: 'terra-red', // 警告 → 红
  add: 'moss-green', // 添加 → 绿（正向）
  reduce: 'ember-rust', // 减少 → 棕红（负向）
  marked: 'amber-sand', // 标记 → 黄（高亮）

  file: 'color-text', // fallback → 中性文本色
} as const

// MIME → 分类（优先级最高）
// 这是核心：**浏览器能识别的 MIME 很有限**，但我们把所有常见的都覆盖。
const MIME_TO_CATEGORY: Record<string, keyof typeof CATEGORY_TO_RI_ICON> = {
  // ============================
  // Images
  // ============================
  'image/jpeg': 'image',
  'image/pjpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'gif',
  'image/bmp': 'image',
  'image/x-ms-bmp': 'image',
  'image/svg+xml': 'image',
  'image/tiff': 'image',
  'image/x-icon': 'image',
  'image/vnd.microsoft.icon': 'image',
  'image/heic': 'image',
  'image/heif': 'image',
  'image/avif': 'image',

  // ============================
  // Video
  // ============================
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video', // mov (Safari)
  'video/x-msvideo': 'video', // avi
  'video/x-matroska': 'video', // mkv (Chrome)
  'video/3gpp': 'video',
  'video/3gpp2': 'video',
  'video/mpeg': 'video',

  // ============================
  // Audio
  // ============================
  'audio/mpeg': 'audio', // mp3
  'audio/wav': 'audio',
  'audio/x-wav': 'audio',
  'audio/webm': 'audio',
  'audio/ogg': 'audio',
  'audio/opus': 'audio',
  'audio/aac': 'audio',
  'audio/mp4': 'audio',
  'audio/flac': 'audio', // Safari only
  'audio/x-flac': 'audio',

  // ============================
  // PDF
  // ============================
  'application/pdf': 'pdf',

  // ============================
  // Text / Document
  // ============================
  'text/plain': 'text',
  'text/markdown': 'document', // 部分浏览器
  'text/x-markdown': 'document',
  'text/richtext': 'document',
  'text/rtf': 'document',
  'application/rtf': 'document',

  // ============================
  // JSON / Data / Config
  // ============================
  'application/json': 'code',
  'application/ld+json': 'code',
  'application/geo+json': 'code',
  'application/x-yaml': 'code',
  'text/yaml': 'code',
  'text/x-yaml': 'code',
  'application/xml': 'code',
  'text/xml': 'code',

  // ============================
  // CSV / Spreadsheet
  // ============================
  'text/csv': 'sheet',
  'application/vnd.ms-excel': 'sheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'sheet',

  // ============================
  // Word
  // ============================
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'word',

  // ============================
  // PowerPoint
  // ============================
  'application/vnd.ms-powerpoint': 'slide',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'slide',

  // ============================
  // HTML / Web
  // ============================
  'text/html': 'code',
  'text/css': 'code',
  'text/javascript': 'code',
  'application/javascript': 'code',
  'application/x-javascript': 'code',

  // ============================
  // Archives
  // ============================
  'application/zip': 'archive',
  'application/x-zip-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/gzip': 'archive',
  'application/x-gzip': 'archive',
  'application/x-tar': 'archive',

  // ============================
  // Executables
  // ============================
  'application/x-msdownload': 'settings', // exe
  'application/vnd.apple.installer+xml': 'settings', // pkg
  'application/x-sh': 'settings',
  'application/x-bat': 'settings',

  // ============================
  // Certificates / Security
  // ============================
  'application/x-x509-ca-cert': 'shield',
  'application/pkix-cert': 'shield',

  // ============================
  // Torrent
  // ============================
  'application/x-bittorrent': 'download',

  // ============================
  // Fonts
  // ============================
  'font/ttf': 'document',
  'font/otf': 'document',
  'font/woff': 'document',
  'font/woff2': 'document',

  // ============================
  // Misc text formats
  // ============================
  'application/x-httpd-php': 'code',
  'application/x-python': 'code',
  'application/x-shellscript': 'code',
  'application/x-typescript': 'code',
  'application/x-java-source': 'code',
}

// 扩展名 → 分类（MIME 为空时 fallback）
// 这里覆盖所有浏览器不认识的类型（md、ts、py、rar、7z、iso、rom、sav…）
const EXT_TO_CATEGORY: Record<string, keyof typeof CATEGORY_TO_RI_ICON> = {
  // ============================
  // Images
  // ============================
  jpg: 'image',
  jpeg: 'image',
  jpe: 'image',
  jif: 'image',
  jfif: 'image',
  jfi: 'image',
  png: 'image',
  apng: 'image',
  webp: 'image',
  bmp: 'image',
  dib: 'image',
  rle: 'image',
  gif: 'gif',
  tif: 'image',
  tiff: 'image',
  heic: 'image',
  heif: 'image',
  avif: 'image',
  ico: 'image',
  cur: 'image',
  svg: 'image',
  svgz: 'image',
  psd: 'image',
  ai: 'image',
  eps: 'image',
  raw: 'image',
  cr2: 'image',
  nef: 'image',
  arw: 'image',
  orf: 'image',
  rw2: 'image',
  dng: 'image',
  webp2: 'image',
  xcf: 'image',

  // ============================
  // Video
  // ============================
  mp4: 'video',
  m4v: 'video',
  mp4v: 'video',
  mpg: 'video',
  mpeg: 'video',
  mpe: 'video',
  mp2: 'video',
  mpv: 'video',
  webm: 'video',
  ogv: 'video',
  ogx: 'video',
  mov: 'video',
  qt: 'video',
  avi: 'video',
  wmv: 'video',
  asf: 'video',
  mkv: 'video',
  mka: 'video',
  mks: 'video',
  mk3d: 'video',
  flv: 'video',
  f4v: 'video',
  f4p: 'video',
  f4a: 'video',
  f4b: 'video',
  '3gp': 'video',
  '3g2': 'video',
  // ts: 'video',
  m2ts: 'video',
  mts: 'video',
  vob: 'video',
  mxf: 'video',
  rm: 'video',
  rmvb: 'video',

  // ============================
  // Audio
  // ============================
  mp3: 'audio',
  mp2a: 'audio',
  mp2v: 'audio',
  mpga: 'audio',
  m4a: 'audio',
  m4b: 'audio',
  m4p: 'audio',
  aac: 'audio',
  ac3: 'audio',
  eac3: 'audio',
  wav: 'audio',
  wave: 'audio',
  ogg: 'audio',
  oga: 'audio',
  opus: 'audio',
  flac: 'audio',
  wma: 'audio',
  amr: 'audio',
  aiff: 'audio',
  aif: 'audio',
  aifc: 'audio',
  caf: 'audio',
  mid: 'audio',
  midi: 'audio',
  rmi: 'audio',
  kar: 'audio',
  mkaudio: 'audio',

  // ============================
  // PDF
  // ============================
  pdf: 'pdf',

  // ============================
  // Office / Documents
  // ============================
  doc: 'word',
  docx: 'word',
  dot: 'word',
  dotx: 'word',
  docm: 'word',
  dotm: 'word',
  rtf: 'document',
  wps: 'document',
  wpt: 'document',
  odt: 'document',
  ott: 'document',
  fodt: 'document',
  uot: 'document',
  uof: 'document',
  pages: 'document',

  xls: 'sheet',
  xlsx: 'sheet',
  xlt: 'sheet',
  xltx: 'sheet',
  xlsm: 'sheet',
  xltm: 'sheet',
  xlsb: 'sheet',
  ods: 'sheet',
  ots: 'sheet',
  fods: 'sheet',
  csv: 'sheet',
  tsv: 'sheet',
  sxc: 'sheet',
  numbers: 'sheet',

  ppt: 'slide',
  pptx: 'slide',
  pps: 'slide',
  ppsx: 'slide',
  pot: 'slide',
  potx: 'slide',
  pptm: 'slide',
  potm: 'slide',
  odp: 'slide',
  otp: 'slide',
  fodp: 'slide',
  // key: 'slide',

  // ============================
  // Text / Markup / Docs
  // ============================
  txt: 'text',
  text: 'text',
  log: 'time',
  ini: 'text',
  cfg: 'text',
  conf: 'text',
  config: 'text',
  properties: 'text',
  env: 'text',
  md: 'document',
  markdown: 'document',
  mkd: 'document',
  mkdn: 'document',
  rst: 'document',
  adoc: 'document',
  asciidoc: 'document',
  nfo: 'info',
  readme: 'document',
  license: 'document',
  lic: 'document',
  rtx: 'document',
  tex: 'document',
  latex: 'document',
  sty: 'document',
  cls: 'document',
  chm: 'document',
  hlp: 'document',

  // ============================
  // Code / Scripts / Config
  // ============================
  js: 'code',
  mjs: 'code',
  cjs: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  json: 'code',
  jsonc: 'code',
  json5: 'code',
  map: 'code',
  html: 'code',
  htm: 'code',
  xhtml: 'code',
  shtml: 'code',
  xml: 'code',
  xsd: 'code',
  xsl: 'code',
  xslt: 'code',
  rss: 'code',
  atom: 'code',
  yml: 'code',
  yaml: 'code',
  toml: 'code',
  ini_bak: 'time',

  css: 'code',
  scss: 'code',
  sass: 'code',
  less: 'code',
  styl: 'code',

  vue: 'code',
  svelte: 'code',
  astro: 'code',

  php: 'code',
  phtml: 'code',
  php3: 'code',
  php4: 'code',
  php5: 'code',
  php7: 'code',
  phps: 'code',

  py: 'code',
  pyw: 'code',
  pyc: 'code',
  pyo: 'code',
  pyd: 'code',

  rb: 'code',
  erb: 'code',
  rhtml: 'code',

  java: 'code',
  class: 'code',
  jar: 'code',
  war: 'code',
  ear: 'code',

  c: 'code',
  h: 'code',
  cpp: 'code',
  cxx: 'code',
  cc: 'code',
  hh: 'code',
  hpp: 'code',
  hxx: 'code',
  inl: 'code',
  lua: 'code',

  cs: 'code',
  vb: 'code',
  fs: 'code',
  fsx: 'code',

  go: 'code',
  rs: 'code',
  swift: 'code',
  kt: 'code',
  kts: 'code',
  dart: 'code',
  scala: 'code',
  groovy: 'code',
  gradle: 'code',

  sh: 'settings',
  bash: 'settings',
  zsh: 'settings',
  ksh: 'settings',
  fish: 'settings',
  csh: 'settings',
  tcsh: 'settings',

  bat: 'settings',
  cmd: 'settings',
  ps1: 'settings',
  psd1: 'settings',
  psm1: 'settings',

  sql: 'code',
  db: 'chart',
  db3: 'chart',
  sqlite: 'chart',
  sqlite3: 'chart',
  mdb: 'chart',
  accdb: 'chart',

  reg: 'code',
  inf: 'code',
  vbs: 'code',
  wsf: 'code',

  // ============================
  // Archives / Compressed
  // ============================
  zip: 'archive',
  zipx: 'archive',
  rar: 'archive',
  r00: 'archive',
  r01: 'archive',
  r02: 'archive',
  '7z': 'archive',
  '7zip': 'archive',
  tar: 'archive',
  tgz: 'archive',
  'tar.gz': 'archive',
  tbz: 'archive',
  tbz2: 'archive',
  'tar.bz2': 'archive',
  txz: 'archive',
  'tar.xz': 'archive',
  tlz: 'archive',
  'tar.lz': 'archive',
  gz: 'archive',
  bz: 'archive',
  bz2: 'archive',
  xz: 'archive',
  lz: 'archive',
  lzma: 'archive',
  z: 'archive',
  cab: 'archive',
  arj: 'archive',
  lzh: 'archive',
  iso: 'game',
  img: 'archive',
  dmg: 'settings',
  bin: 'chart',
  cue: 'chart',
  nrg: 'archive',
  uha: 'archive',
  ace: 'archive',
  zoo: 'archive',
  lha: 'archive',
  sit: 'archive',
  sitx: 'archive',
  pak: 'game',
  pak0: 'game',
  pak1: 'game',
  wad: 'game',
  pk3: 'game',
  pk4: 'game',

  // ============================
  // Game / ROM / Save
  // ============================
  rom: 'game',
  nes: 'game',
  smc: 'game',
  sfc: 'game',
  gba: 'game',
  gb: 'game',
  gbc: 'game',
  nds: 'game',
  n64: 'game',
  z64: 'game',
  v64: 'game',
  gcm: 'game',
  iso_game: 'game',
  cso: 'game',
  xiso: 'game',
  sav: 'game',
  srm: 'game',
  mcr: 'game',
  dsv: 'game',
  dat_game: 'game',
  pak_game: 'game',
  wad_game: 'game',

  // ============================
  // HWP
  // ============================
  hwp: 'hwp',
  hwpx: 'hwp',

  // ============================
  // Data / Chart / Binary
  // ============================
  dat: 'chart',
  binlog: 'chart',
  bak: 'time',
  old: 'time',
  tmp: 'time',
  temp: 'time',
  swp: 'time',
  swx: 'time',
  lockfile: 'lock',
  idx: 'search',
  index: 'search',
  dbf: 'chart',
  mdf: 'chart',
  ndf: 'chart',
  dmp: 'chart',
  dump: 'chart',
  bak1: 'time',
  bak2: 'time',

  // ============================
  // Settings / Executables
  // ============================
  exe: 'settings',
  msi: 'settings',
  msp: 'settings',
  com: 'settings',
  scr: 'settings',
  app: 'settings',
  apk: 'settings',
  aab: 'settings',
  xap: 'settings',
  ipa: 'settings',
  xapk: 'settings',
  elf: 'settings',
  so: 'settings',
  dll: 'settings',
  ocx: 'settings',
  sys: 'settings',
  drv: 'settings',
  service: 'settings',
  run: 'settings',
  command: 'settings',
  gadget: 'settings',
  crx: 'settings',
  xpi: 'settings',
  vsix: 'settings',
  pkg: 'settings',
  deb: 'settings',
  rpm: 'settings',
  flatpak: 'settings',
  snap: 'settings',

  // ============================
  // Lock / Encrypted / Security
  // ============================
  enc: 'lock',
  crypt: 'lock',
  encrypted: 'lock',
  aes: 'lock',
  gpg: 'lock',
  pgp: 'lock',
  kdb: 'lock',
  kdbx: 'lock',
  vault: 'lock',
  keystore: 'lock',
  jks: 'lock',
  p12: 'lock',
  pfx: 'lock',
  pem: 'shield',
  crt: 'shield',
  cer: 'shield',
  der: 'shield',
  key: 'shield',
  pub: 'shield',
  ssh: 'shield',
  known_hosts: 'shield',
  authorized_keys: 'shield',

  // ============================
  // Time / History / Logs
  // ============================
  // log: 'time',
  // bak: 'time',
  // old: 'time',
  // tmp: 'time',
  // temp: 'time',
  // swp: 'time',
  swo: 'time',
  orig: 'time',
  rej: 'time',

  // ============================
  // User / Profile / Config
  // ============================
  profile: 'user',
  'profile.json': 'user',
  'user.conf': 'user',
  'user.ini': 'user',
  'user.json': 'user',
  'settings.json': 'user',
  'config.json': 'user',
  'preferences.json': 'user',

  // ============================
  // Upload / Download / Transfer
  // ============================
  uploading: 'upload',
  upload: 'upload',
  part: 'transfer',
  crdownload: 'download',
  download: 'download',
  torrent: 'download',
  magnet: 'download',

  // ============================
  // Search / Info / Warning / Mark
  // ============================
  // idx: 'search',
  index_db: 'search',
  // nfo: 'info',
  info: 'info',
  warn: 'warning',
  warning: 'warning',
  alert: 'warning',
  template: 'add',
  tpl: 'add',
  skeleton: 'add',
  trash: 'reduce',
  deleted: 'reduce',
  removed: 'reduce',
  starred: 'marked',
  favorite: 'marked',
  favourite: 'marked',
}
