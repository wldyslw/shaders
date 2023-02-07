attribute vec2 a_texcoord;
attribute vec2 a_pos;

uniform vec2 u_resolution;

varying vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_pos, 0., 1.);
    v_texcoord = a_texcoord;
}