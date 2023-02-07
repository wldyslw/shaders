import fsGLSL from "./fragment.frag";
import vsGLSL from "./vertex.vert";

const canvas = document.querySelector("canvas");
const height = canvas.clientHeight;
const width = canvas.clientWidth;

const random = () => Math.round((Math.random() + Number.EPSILON) * 1000) / 1000;

const POINTS_COUNT = 20;

const points = new Array(POINTS_COUNT).fill(1).map(() => ({
  x: random(),
  y: random(),
  value: random(),
}));

const getDistance = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

const SCALE = 2;
const SCALED_H = Math.round(height / SCALE);
const SCALED_W = Math.round(width / SCALE);

const values_map = new Array(SCALED_H * SCALED_W).fill(0);

for (let i = 0; i < SCALED_H; i++) {
  for (let j = 0; j < SCALED_W; j++) {
    const POWER = 4;

    const x2 = i / SCALED_H;
    const y2 = j / SCALED_W;

    const effectiveValues = points.map(({ x, y, value }, valueIndex) => {
      const distance = getDistance(x, y, x2, y2);
      return { value, distance };
    });

    const num = effectiveValues.reduce((acc, ev) => {
      return acc + ev.value / Math.pow(ev.distance, POWER);
    }, 0);

    const denom = effectiveValues.reduce((acc, ev) => {
      return acc + 1 / Math.pow(ev.distance, POWER);
    }, 0);

    const accumulatedValue = num / denom;

    values_map[i + j * SCALED_W] = accumulatedValue;
  }
}

let rgba_values_map = values_map
  .map((v) => [Math.round(v * 255), 0, 0, 255])
  .flat();

const gl = canvas.getContext("webgl2");

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsGLSL);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  throw new Error(gl.getShaderInfoLog(vertexShader));
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsGLSL);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
  throw new Error(gl.getShaderInfoLog(fragmentShader));
}

const prg = gl.createProgram();
gl.attachShader(prg, vertexShader);
gl.attachShader(prg, fragmentShader);
gl.linkProgram(prg);
if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(prg));
}

gl.useProgram(prg);

const resolutionUniformLocation = gl.getUniformLocation(prg, "u_resolution");
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  SCALED_W,
  SCALED_H,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  new Uint8Array(rgba_values_map)
);

gl.generateMipmap(gl.TEXTURE_2D);

const posLoc = gl.getAttribLocation(prg, "a_pos");
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  // prettier-ignore
  new Float32Array([
    -1, 1,
    -1, -1,
    1, 1,
    1, -1
  ]),
  gl.STATIC_DRAW
);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(
  posLoc,
  2, // 2 values per vertex shader iteration
  gl.FLOAT, // data is 32bit floats
  false, // don't normalize
  0, // stride (0 = auto)
  0 // offset into buffer
);

const texcoordLocation = gl.getAttribLocation(prg, "a_texcoord");
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  // prettier-ignore
  new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
  ]),
  gl.STATIC_DRAW
);
gl.enableVertexAttribArray(texcoordLocation);
gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// compute 3 vertices for 1 triangle
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
