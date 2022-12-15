attribute float random;
attribute float scale;

uniform float u_time;
uniform float u_opacity;
uniform float u_frequency;
uniform float u_scale_factor;

varying vec2 vUv;
varying float vGradient;
varying float vScale;

void main() {
    vUv = uv;
    vScale = scale;
    vGradient = ((sin((u_time + random) * u_frequency) + 3.0) / 4.0) * vUv.y * u_opacity;

    float adjustedScale = mix(0.2, 0.8, scale);
    float randomizedScale = (adjustedScale + (random / 10.0)) * u_scale_factor;

    // Scale Matrix
    mat4 sPos = mat4(
        vec4(1.0, 0.0 ,0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0,randomizedScale, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    vec4 modelInstancePositionMatrix = modelMatrix * instanceMatrix * sPos * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelInstancePositionMatrix;
}
