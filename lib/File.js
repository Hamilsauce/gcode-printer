export const loadFile = async (path) => {
  return await (await fetch(path)).text();
};

const CLASS_KEY = 'FILE123'
const FileOptions = {
  name: String,
}

const DEFAULT_FILE_OPTIONS = {
  name: 'untitled.gcode',
  path: '',
  size: 0,
  date: '4/14/2023',
  time: '09:31',
}

export class ReadableFile {
  #source = null;
  #content = null;
  #name = null;
  #path = null;
  #size = null;
  #date = null;
  #time = null;

  constructor(classKey, source, options = DEFAULT_FILE_OPTIONS) {
    if (!(classKey && classKey === CLASS_KEY)) throw new Error('Illegal Constructor: Use static method File.create');
    
    this.#source = source;
    
    this.init(options)
    // console.log('FILE', {source: source});
  }

  get name() { return this.#name };
  set name(v) { this.#name = v ? v : this.#name; };
  get path() { return this.#path };
  set path(v) { this.#path = v ? v : this.#path; };
  get size() { return this.#size };
  set size(v) { this.#size = v ? v : this.#size; };
  get date() { return this.#date };
  set date(v) { this.#date = v ? v : this.#date; };
  get time() { return this.#time };
  set time(v) { this.#time = v ? v : this.#time; };

  init({ name, path, size, date, time, }) {
    this.#name = name ? name : 'untitled.gcode';
    this.#path = path ? path : null;
    this.#size = size ? size : 0;
    this.#date = date ? date : new Date(Date.now()).toLocaleDateString();
    this.#time = time ? time : new Date(Date.now()).toLocaleTimeString();
  }

  static async create(path, options) {
    const res = await (await fetch(path));
    const f = new ReadableFile('FILE123', (await res.blob()));

    return f;
  }

  async load(callback) {
    const content = await this.#source.text();
    this.#content = content;
    
    // console.log('content', content)
    
  }
}