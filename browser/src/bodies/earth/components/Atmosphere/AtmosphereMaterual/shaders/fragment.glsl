varying vec3 vertexNormal;

uniform float u_intensity_base;
uniform float u_intensity_power;
uniform vec3 u_base_color;

void main() {
    float intensity = u_intensity_base - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = u_base_color * pow(intensity, u_intensity_power);
    gl_FragColor = vec4(atmosphere, 0.5);
}
