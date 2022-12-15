varying float vRandomTime;

varying vec2 vUv;

varying vec3 vBaseColor;

uniform float u_opacity;
uniform float u_global_opacity;
uniform float u_frequency;
uniform float u_stripe_scale;


void main() {
    float randomTime = vRandomTime * u_frequency;
    float intensity = (sin(randomTime + vUv.y * u_stripe_scale) + 3.0) / 4.0;
    float opacity = u_opacity * intensity * vUv.y * u_global_opacity;
    gl_FragColor = vec4(vBaseColor, opacity);
}
