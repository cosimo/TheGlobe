attribute float random;
attribute float scale;

uniform float u_scale_factor;
uniform float u_time;

uniform vec3 u_high_color;
uniform vec3 u_low_color;

varying float vScale;
varying float vRandomTime;

varying vec2 vUv;

varying vec3 vBaseColor;


void main() {
    vScale = scale;
    vUv = uv;
    vRandomTime = (u_time + random);
    vBaseColor = mix(u_low_color, u_high_color, scale);

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
