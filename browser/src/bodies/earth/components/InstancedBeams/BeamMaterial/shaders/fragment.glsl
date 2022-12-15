varying float vGradient;
varying float vScale;

uniform vec3 u_high_bottom_color;
uniform vec3 u_high_top_color;
uniform vec3 u_low_bottom_color;
uniform vec3 u_low_top_color;

varying vec2 vUv;

void main() {
    vec3 highScaleGradient = mix(u_high_bottom_color, u_high_top_color, 1.0 - vUv.y);
    vec3 lowScaleGradient = mix(u_low_bottom_color, u_low_top_color, 1.0 - vUv.y);
    vec3 color = mix(lowScaleGradient, highScaleGradient, vScale);

    gl_FragColor = vec4(color, vGradient);
}
