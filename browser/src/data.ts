export function getData() {
  return fetch("data/hits.json").then(response => response.json())
}

export function getMetrics() {
    return fetch("data/metrics.json").then(response => response.json())
}
