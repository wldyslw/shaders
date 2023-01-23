#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

vec3 base(in vec2 st) {
    vec2 pos = vec2(0.5) - st;

    float r = length(pos) * 2.0;
    float a = atan(pos.y * .25, pos.x);

    float f = .1 * (cos(a + PI / 4.) * sin(a + PI / 4.) + 4.);

    return vec3(1. - smoothstep(f, f + 0.01, r));
}

vec3 branch(in vec2 st, in vec2 center) {
    float pct = 0.0;
    pct = max(distance(st, vec2(center + vec2(-.05, .05))), distance(st, vec2(center + vec2(.05, -.05))));
    pct = 1. - smoothstep(.1, .1 + .005, pct);
    return vec3(pct);
}

float circle(in vec2 st, in float radius, in vec2 center) {
    vec2 dist = st - center;
    return 1. - smoothstep(radius - (radius * 0.05), radius, dot(dist, dist) * 4.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    gl_FragColor = vec4(branch(st, vec2(.56, .76)) + base(st) - circle(st, .05, vec2(.74, .55)), 1.0);
}
