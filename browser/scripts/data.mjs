export default function getData() {
  //console.log('data fetching');
  return fetch('../hits.csv')
            .then(res => res.text())
            .then(csv => d3.csvParse(csv, ({ lat, lng, hits}) => ({ lat: +lat, lng: +lng, hits: +hits })))
}
