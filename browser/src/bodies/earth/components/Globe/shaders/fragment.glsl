void main() {
    vec3 lightDirection = normalize(pointLights[0].position + vViewPosition);
    vec3 normalDirection = normalize(vNormal);
    float dotDirection = pow((dot(normalDirection, lightDirection) + 1.) / 2., 1./2.);

    float csm_LightMapLight;
}
