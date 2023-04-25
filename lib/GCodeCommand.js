export const GCodeCommandParameters = {
  e: Number,
  f: Number,
  x: Number,
  y: Number,
  z: Number,
}

export class GCodeCommand {
  #params = {
    e: null,
    f: null,
    x: null,
    y: null,
    z: null,
  };

  constructor(commandCode, parameters = GCodeCommandParameters) {
    Object.assign(this.#params, parameters);
  };

  get code() { return this.#code };

  get e() { return this.#params.e };

  get f() { return this.#params.f };

  get x() { return this.#params.x };

  get y() { return this.#params.y };

  get z() { return this.#params.z };
}