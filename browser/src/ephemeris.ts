// Converts km lengths to 3D space coordinates, where Earth's radius is 1.0
export function km(l: number) {
  const earthMeanRadiusKm = 6371.0;
  return l / earthMeanRadiusKm;
}
