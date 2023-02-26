// https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.txt
const ISS_EPHEMERIS_DATA_URL = "data/ISS.OEM_J2K_EPH.txt";

class StateVector {
  timestamp: string;
  position: {x: number, y: number, z: number};
  velocity: {x: number, y: number, z: number};
  adjusted: boolean;
}

let issTrajectoryData: StateVector[] = [];

// Converts km lengths to 3D space coordinates, where Earth's radius is 1.0
export function km(l: number) {
  const earthMeanRadiusKm = 6371.0;
  return l / earthMeanRadiusKm;
}

// Loads and parses the ISS ephemeris text data
export async function loadIssTrajectoryData() {

  await fetch(ISS_EPHEMERIS_DATA_URL)
    .then(response => response.text())
    .then(data => {
      // Parse ISS ephemeris text data into a list of state vectors
      const lines = data.split("\r\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Wait for the start of the ephemeris data
        if (line != "COMMENT End sequence of events") {
          continue;
        }
        i++;
        while (i < lines.length) {
          // Parse state vector data
          const stateVectorLine = lines[i];
          const stateVector = stateVectorLine.split(" ");
          const timestamp: string = stateVector[0];
          const x: number = km(parseFloat(stateVector[1]));
          const y: number = km(parseFloat(stateVector[2]));
          const z: number = km(parseFloat(stateVector[3]));
          const vx: number = km(parseFloat(stateVector[4]));
          const vy: number = km(parseFloat(stateVector[5]));
          const vz: number = km(parseFloat(stateVector[6]));
          issTrajectoryData.push({
            timestamp: timestamp,
            position: {x: x, y: y, z: z},    //rotateJ2000Coords(x, y, z),
            velocity: {x: vx, y: vy, z: vz},
            adjusted: false,
          });
          i++;
        }
      }
      console.log("ISS trajectory data loaded: " + issTrajectoryData.length + " state vectors");
    });
}

// Returns the matching ISS state vector given the current timestamp
export function getCurrentIssStateVector(timestamp: string | undefined): StateVector {
  if (!issTrajectoryData) {
    return {} as StateVector;
  }

  // Get current date timestamp if none was provided
  if (!timestamp) {
    timestamp = getCurrentTimestamp();
  }

  for (let i = 1; i < issTrajectoryData.length; i++) {
    const stateVector = issTrajectoryData[i];
    if (stateVector.timestamp >= timestamp) {
      //console.log("Matching state vector t=" + stateVector.timestamp + " (m=" + timestamp + ")");
      //console.log("   x=" + issTrajectoryData[i - 1].position.x
      //  + " y=" + issTrajectoryData[i - 1].position.y
      //  + " z=" + issTrajectoryData[i - 1].position.z);
      //console.log("   vx=" + issTrajectoryData[i - 1].velocity.x + " vy=" + issTrajectoryData[i - 1].velocity.y + " vz=" + issTrajectoryData[i - 1].velocity.z);
      const previousVector = issTrajectoryData[i - 1];

      // Adjust the previous vector to the current timestamp
      if (!previousVector.adjusted) {
        const timeSinceVector = (new Date(timestamp).getTime() - new Date(previousVector.timestamp).getTime()) / 1000.0;
        console.log("Time-adjusted state vector t=" + previousVector.timestamp + " +" + timeSinceVector + "s");

        previousVector.position.x += previousVector.velocity.x * timeSinceVector;
        previousVector.position.y += previousVector.velocity.y * timeSinceVector;
        previousVector.position.z += previousVector.velocity.z * timeSinceVector;

        previousVector.adjusted = true;
      }

      return previousVector;
    }
  }
  return issTrajectoryData[issTrajectoryData.length];
}

function getCurrentTimestamp(): string {
  // Get current UTC date timestamp in the format "2023-02-28T12:00:01.213"
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  // When the number is less than 10, it is padded with a leading zero
  // without using additional functions
  return year
    + "-" + (month<10?"0"+month:month)
    + "-" + (day<10?"0"+day:day)
    + "T" + (hours<10?"0"+hours:hours)
    + ":" + (minutes<10?"0"+minutes:minutes)
    + ":" + (seconds<10?"0"+seconds:seconds)
    + "." + (milliseconds<10?"00"+milliseconds:milliseconds<100?"0"+milliseconds:milliseconds);
}