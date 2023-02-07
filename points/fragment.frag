precision highp float;

// uniform vec2 u_resolution;
uniform sampler2D u_texture;

varying vec2 v_texcoord;

vec3 hsb2rgb(in float h, in float s, in float b) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return b * mix(vec3(1.0), rgb, s);
}

void main() {
    float value = texture2D(u_texture, v_texcoord).r;
    vec3 rgb = hsb2rgb((1. - value) / 2., 1., 1.);
    gl_FragColor = vec4(rgb, .6);
}