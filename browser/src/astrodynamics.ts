// Modified and converted to Typescript from http://www.stargazing.net/kepler/jsmoon.html

//
// This page works out some values of interest to lunar-tics
// like me. The central formula for Moon position is approximate.
// Finer details like physical (as opposed to optical)
// libration and the nutation have been neglected. Formulas have
// been simplified from Meeus 'Astronomical Algorithms' (1st Ed)
// Chapter 51 (sub-earth and sub-solar points, PA of pole and
// Bright Limb, Illuminated fraction). The libration figures
// are usually 0.05 to 0.2 degree different from the results
// given by Harry Jamieson's 'Lunar Observer's Tool Kit' DOS
// program. Some of the code is adapted from a BASIC program
// by George Rosenberg (ALPO).
//
// I have coded this page in a 'BASIC like' way - I intend to make
// far more use of appropriately defined global objects when I
// understand how they work!
//
// Written while using Netscape Gold 3.04 to keep cross-platform,
// Tested on Navigator Gold 2.02, Communicator 4.6, MSIE 5
//
// Round doesn't seem to work on Navigator 2 - and if you use
// too many nested tables, you get the text boxes not showing
// up in Netscape 3, and you get 'undefined' errors for formbox
// names on Netscape 2. Current layout seems OK.
//
// You must put all the form.name.value = variable statements
// together at the _end_ of the function, as the order of these
// statements seems to be significant.
//
// Keith Burnett
// http://www.xylem.demon.co.uk/kepler/
// keith@xylem.demon.co.uk
//

//
// calculateEquatorialCoords (originally doCalcs) is written like a BASIC
// program - most of the calculation occurs in this function, although a few
// things are split off into separate functions. This function also reads the
// date, does some basic error checking, and writes all the results!
//

function calculateEquatorialCoords(datetime: number) {
    var g, days, t, L1, M1, C1, V1, Ec1, R1, Th1, Om1, Lam1, Obl, Ra1, Dec1;
    var F, L2, Om2, M2, D, R2, R3, Bm, Lm, HLm, HBm, Ra2, Dec2, EL, EB, W, X, Y, A;
    var D2, I, SL, SB;
    var Co, SLt, Psi, Il, K, P1, P2, y, m, d, bit, h, min, bk;
    //
    //  Get date and time code from user, isolate the year, month, day and hours
    //  and minutes, and do some basic error checking! This only works for AD years
    //
    g = datetime;
    y = Math.floor(g / 10000);
    m = Math.floor((g - y * 10000) / 100);
    d = Math.floor(g - y * 10000 - m * 100);
    bit = (g - Math.floor(g)) * 100;
    h = Math.floor(bit);
    min = Math.floor(bit * 100 - h * 100 + 0.5);

    //
    //  primative error checking - accounting for right number of
    //  days per month including leap years. Using bk variable to
    //  prevent multiple alerts. See functions isleap(y)
    //  and goodmonthday(y, m, d).
    //
    bk = 0;

    if (g < 16000000) {
        bk = 1;
        console.log("Routines are not accurate enough to work back that" +
            " far - answers are meaningless!");
    }
    if (g > 23000000) {
        bk = 1;
        console.log("Routines are not accurate enough to work far into the future" +
            " - answers are meaningless!");
    }
    if (((m < 1) || (m > 12)) && (bk != 1)) {
        bk = 1;
        console.log("Months are not right - type date again");
    }
    if ((goodmonthday(y, m, d) == 0) && (bk != 1)) {
        bk = 1;
        console.log("Wrong number of days for the month or not a leap year - type date again");
    }
    if ((h > 23) && (bk != 1)) {
        bk = 1;
        console.log("Hours are not right - type date again");
    }
    if ((min > 59) && (bk != 1)) {
        console.log("Minutes are not right - type date again");
    }

    //
    //  Get the number of days since J2000.0 using day2000() function
    //
    days = day2000(y, m, d, h + min / 60);
    t = days / 36525;

    //
    //  Sun formulas
    //
    //  L1  - Mean longitude
    //  M1  - Mean anomaly
    //  C1  - Equation of centre
    //  V1  - True anomaly
    //  Ec1 - Eccentricity
    //  R1  - Sun distance
    //  Th1 - Theta (true longitude)
    //  Om1 - Long Asc Node (Omega)
    //  Lam1- Lambda (apparent longitude)
    //  Obl - Obliquity of ecliptic
    //  Ra1 - Right Ascension
    //  Dec1- Declination
    //

    L1 = range(280.466 + 36000.8 * t);
    M1 = range(357.529 + 35999 * t - 0.0001536 * t * t + t * t * t / 24490000);
    C1 = (1.915 - 0.004817 * t - 0.000014 * t * t) * dsin(M1);
    C1 = C1 + (0.01999 - 0.000101 * t) * dsin(2 * M1);
    C1 = C1 + 0.00029 * dsin(3 * M1);
    V1 = M1 + C1;
    Ec1 = 0.01671 - 0.00004204 * t - 0.0000001236 * t * t;
    R1 = 0.99972 / (1 + Ec1 * dcos(V1));
    Th1 = L1 + C1;
    Om1 = range(125.04 - 1934.1 * t);
    Lam1 = Th1 - 0.00569 - 0.00478 * dsin(Om1);
    Obl = (84381.448 - 46.815 * t) / 3600;
    Ra1 = datan2(dsin(Th1) * dcos(Obl) - dtan(0) * dsin(Obl), dcos(Th1));
    Dec1 = dasin(dsin(0) * dcos(Obl) + dcos(0) * dsin(Obl) * dsin(Th1));

    //
    //  Moon formulas
    //
    //  F   - Argument of latitude (F)
    //  L2  - Mean longitude (L')
    //  Om2 - Long. Asc. Node (Om')
    //  M2  - Mean anomaly (M')
    //  D   - Mean elongation (D)
    //  D2  - 2 * D
    //  R2  - Lunar distance (Earth - Moon distance)
    //  R3  - Distance ratio (Sun / Moon)
    //  Bm  - Geocentric Latitude of Moon
    //  Lm  - Geocentric Longitude of Moon
    //  HLm - Heliocentric longitude
    //  HBm - Heliocentric latitude
    //  Ra2 - Lunar Right Ascension
    //  Dec2- Declination
    //

    F = range(93.2721 + 483202 * t - 0.003403 * t * t - t * t * t / 3526000);
    L2 = range(218.316 + 481268 * t);
    Om2 = range(125.045 - 1934.14 * t + 0.002071 * t * t + t * t * t / 450000);
    M2 = range(134.963 + 477199 * t + 0.008997 * t * t + t * t * t / 69700);
    D = range(297.85 + 445267 * t - 0.00163 * t * t + t * t * t / 545900);
    D2 = 2 * D;
    R2 = 1 + (-20954 * dcos(M2) - 3699 * dcos(D2 - M2) - 2956 * dcos(D2)) / 385000;
    R3 = (R2 / R1) / 379.168831168831;
    Bm = 5.128 * dsin(F) + 0.2806 * dsin(M2 + F);
    Bm = Bm + 0.2777 * dsin(M2 - F) + 0.1732 * dsin(D2 - F);
    Lm = 6.289 * dsin(M2) + 1.274 * dsin(D2 - M2) + 0.6583 * dsin(D2);
    Lm = Lm + 0.2136 * dsin(2 * M2) - 0.1851 * dsin(M1) - 0.1143 * dsin(2 * F);
    Lm = Lm + 0.0588 * dsin(D2 - 2 * M2)
    Lm = Lm + 0.0572 * dsin(D2 - M1 - M2) + 0.0533 * dsin(D2 + M2);
    Lm = Lm + L2;
    Ra2 = datan2(dsin(Lm) * dcos(Obl) - dtan(Bm) * dsin(Obl), dcos(Lm));
    Dec2 = dasin(dsin(Bm) * dcos(Obl) + dcos(Bm) * dsin(Obl) * dsin(Lm));
    HLm = range(Lam1 + 180 + (180 / Math.PI) * R3 * dcos(Bm) * dsin(Lam1 - Lm));
    HBm = R3 * Bm;


    //
    //  Selenographic coords of the sub Earth point
    //  This gives you the (geocentric) libration
    //  approximating to that listed in most almanacs
    //  Topocentric libration can be up to a degree
    //  different either way
    //
    //  Physical libration ignored, as is nutation.
    //
    //  I   - Inclination of (mean) lunar orbit to ecliptic
    //  EL  - Selenographic longitude of sub Earth point
    //  EB  - Sel Lat of sub Earth point
    //  W   - angle variable
    //  X   - Rectangular coordinate
    //  Y   - Rectangular coordinate
    //  A   - Angle variable (see Meeus ch 51 for notation)
    //
    I = 1.54242;
    W = Lm - Om2;
    Y = dcos(W) * dcos(Bm);
    X = dsin(W) * dcos(Bm) * dcos(I) - dsin(Bm) * dsin(I);
    A = datan2(X, Y);
    EL = A - F;
    EB = dasin(-dsin(W) * dcos(Bm) * dsin(I) - dsin(Bm) * dcos(I));

    //
    //  Selenographic coords of sub-solar point. This point is
    //  the 'pole' of the illuminated hemisphere of the Moon
    //  and so describes the position of the terminator on the
    //  lunar surface. The information is communicated through
    //  numbers like the colongitude, and the longitude of the
    //  terminator.
    //
    //  SL  - Sel Long of sub-solar point
    //  SB  - Sel Lat of sub-solar point
    //  W, Y, X, A  - temporary variables as for sub-Earth point
    //  Co  - Colongitude of the Sun
    //  SLt - Selenographic longitude of terminator
    //  riset - Lunar sunrise or set
    //

    W = range(HLm - Om2);
    Y = dcos(W) * dcos(HBm);
    X = dsin(W) * dcos(HBm) * dcos(I) - dsin(HBm) * dsin(I);
    A = datan2(X, Y);
    SL = range(A - F);
    SB = dasin(-dsin(W) * dcos(HBm) * dsin(I) - dsin(HBm) * dcos(I));

    if (SL < 90) {
        Co = 90 - SL;
    }
    else {
        Co = 450 - SL;
    }

    if ((Co > 90) && (Co < 270)) {
        SLt = 180 - Co;
    }
    else {
        if (Co < 90) {
            SLt = 0 - Co;
        }
        else {
            SLt = 360 - Co;
        }
    }

    //
    //  Calculate the illuminated fraction, the position angle of the bright
    //  limb, and the position angle of the Moon's rotation axis. All position
    //  angles relate to the North Celestial Pole - you need to work out the
    //  'Parallactic angle' to calculate the orientation to your local zenith.
    //

    //  Iluminated fraction
    A = dcos(Bm) * dcos(Lm - Lam1);
    Psi = 90 - datan(A / Math.sqrt(1 - A * A));
    X = R1 * dsin(Psi);
    Y = R3 - R1 * A;
    Il = datan2(X, Y);
    K = (1 + dcos(Il)) / 2;

    //  PA bright limb
    X = dsin(Dec1) * dcos(Dec2) - dcos(Dec1) * dsin(Dec2) * dcos(Ra1 - Ra2);
    Y = dcos(Dec1) * dsin(Ra1 - Ra2);
    P1 = datan2(Y, X);

    //  PA Moon's rotation axis
    //  Neglects nutation and physical libration, so Meeus' angle
    //  V is just Om2
    X = dsin(I) * dsin(Om2);
    Y = dsin(I) * dcos(Om2) * dcos(Obl) - dcos(I) * dsin(Obl);
    W = datan2(X, Y);
    A = Math.sqrt(X * X + Y * Y) * dcos(Ra2 - W);
    P2 = dasin(A / dcos(EB));

    //
    //  Write Sun numbers to results dict
    //
    var result: any = {};

    result.daynumber = round(days, 4);
    result.julday = round(days + 2451545.0, 4);
    result.SunDistance = round(R1, 4);
    result.SunRa = round(Ra1 / 15, 3);
    result.SunDec = round(Dec1, 2);
    //console.log("Sun  ra=" + result.SunRa + " dec=" + result.SunDec + " r=" + result.SunDistance);

    //
    //  Write Moon numbers to form
    //

    result.MoonDist = round(R2 * 60.268511, 2);
    result.MoonRa = round(Ra2 / 15, 3);
    result.MoonDec = round(Dec2, 2);
    //console.log("Moon ra=" + result.MoonRa + " dec=" + result.MoonDec + " r=" + result.MoonDist);

    //
    //  Print the libration numbers
    //

    result.SelLatEarth = round(EB, 1);
    result.SelLongEarth = round(EL, 1);

    //
    //  Print the Sub-solar numbers
    //

    result.SelLatSun = round(SB, 1);
    result.SelLongSun = round(SL, 1);
    result.SelColongSun = round(Co, 2);
    result.SelLongTerm = round(SLt, 1);

    //
    //  Print the rest - position angles and illuminated fraction
    //

    result.SelIlum = round(K, 3);
    result.SelPaBl = round(P1, 1);
    result.SelPaPole = round(P2, 1);

    return result;
}

//
// this is the usual days since J2000 function
//

function day2000(y: number, m: number, d: number, h: number) {
    var d1, a, b, c, greg;
    greg = y * 10000 + m * 100 + d;
    if (m == 1 || m == 2) {
        y = y - 1;
        m = m + 12;
    }
    //  reverts to Julian calendar before 4th Oct 1582
    //  no good for UK, America or Sweeden!

    if (greg > 15821004) {
        a = Math.floor(y / 100);
        b = 2 - a + Math.floor(a / 4)
    }
    else {
        b = 0;
    }
    c = Math.floor(365.25 * y);
    d1 = Math.floor(30.6001 * (m + 1));
    return (b + c + d1 - 730550.5 + d + h / 24);
}

//
//  Leap year detecting function (gregorian calendar)
//  returns 1 for leap year and 0 for non-leap year
//

function isleap(y: number) {
    var a;
    //  assume not a leap year...
    a = 0;
    //  ...flag leap year candidates...
    if (y % 4 == 0) a = 1;
    //  ...if year is a century year then not leap...
    if (y % 100 == 0) a = 0;
    //  ...except if century year divisible by 400...
    if (y % 400 == 0) a = 1;
    //  ...and so done according to Gregory's wishes
    return a;
}

//
//  Month and day number checking function
//  This will work OK for Julian or Gregorian
//  providing isleap() is defined appropriately
//  Returns 1 if Month and Day combination OK,
//  and 0 if month and day combination impossible
//
function goodmonthday(y: number, m: number, d: number) {
    var a, leap;
    leap = isleap(y);
    //  assume OK
    a = 1;
    //  first deal with zero day number!
    if (d == 0) a = 0;
    //  Sort Feburary next
    if ((m == 2) && (leap == 1) && (d > 29)) a = 0;
    if ((m == 2) && (d > 28) && (leap == 0)) a = 0;
    //  then the rest of the months - 30 days...
    if (((m == 4) || (m == 6) || (m == 9) || (m == 11)) && d > 30) a = 0;
    //  ...31 days...
    if (d > 31) a = 0;
    //  ...and so done
    return a;
}

//
// Trigonometric functions working in degrees - this just
// makes implementing the formulas in books easier at the
// cost of some wasted multiplications.
// The 'range' function brings angles into range 0 to 360,
// and an atan2(x,y) function returns arctan in correct
// quadrant. ipart(x) returns smallest integer nearest zero
//

function dsin(x: number) {
    return Math.sin(Math.PI / 180 * x)
}

function dcos(x: number) {
    return Math.cos(Math.PI / 180 * x)
}

function dtan(x: number) {
    return Math.tan(Math.PI / 180 * x)
}

function dasin(x: number) {
    return 180 / Math.PI * Math.asin(x)
}

// @ts-ignore unused function
function dacos(x: number) {
    return 180 / Math.PI * Math.acos(x)
}

function datan(x: number) {
    return 180 / Math.PI * Math.atan(x)
}

function datan2(y: number, x: number) {
    var a;
    if ((x == 0) && (y == 0)) {
        return 0;
    }
    else {
        a = datan(y / x);
        if (x < 0) {
            a = a + 180;
        }
        if (y < 0 && x > 0) {
            a = a + 360;
        }
        return a;
    }
}

function ipart(x: number) {
    var a;
    if (x > 0) {
        a = Math.floor(x);
    }
    else {
        a = Math.ceil(x);
    }
    return a;
}

function range(x: number) {
    var a, b
    b = x / 360;
    a = 360 * (b - ipart(b));
    if (a < 0) {
        a = a + 360
    }
    return a
}

//
// round rounds the number num to dp decimal places
// the second line is some C like jiggery pokery I
// found in an O'Reilly book which means if dp is null
// you get 2 decimal places.
//
function round(num: number, dp: number) {
    //   dp = (!dp ? 2: dp);
    return Math.round(num * Math.pow(10, dp)) / Math.pow(10, dp);
}

// Inspired from https://math.stackexchange.com/questions/2196866/how-to-calculate-spherical-coordinate-x-y-z-of-a-star-from-magnitude-declin
function positionFromEquatorialCoords(ra: number, dec: number, r: number) {

    // Declination is in degrees, we need radians (?)
    dec = dec / 57.29578;

    // Right ascension is in hours, do we need degrees instead? 24h → 360deg
    ra *= 15;
    ra /= 57.29578;
    ra = - ra;

    const x = r * Math.cos(dec) * Math.cos(ra);
    const y = r * Math.cos(dec) * Math.sin(ra);
    const z = r * Math.sin(dec);

    return rotateJ2000Coords(x, y, z);

    // WebGL x, y, z axes don't correspond to astronomical conventions
    // https://www.jameswatkins.me/posts/converting-equatorial-to-cartesian.html
    //return {
    //    x: y,
    //   y: z,
    //    z: -x,
    //};
}

export function rotateJ2000Coords(x_j2000: number, y_j2000: number, z_j2000: number) {

  // Get the current time in Julian Date (JD)
  const now = new Date();
  const JD = (now.getTime() / 86400000.0) + 2440587.5;

  // Define the transformation matrix from J2000 to the current time
  const T = [
    [0.9999999999999928, -0.0000000707827970, 0.0000000805627700],
    [0.0000000707827970, 0.9999999999999974, -0.0000000356813400],
    [-0.0000000805627700, 0.0000000356813400, 0.9999999999999969]
  ];

  // Apply the transformation matrix to the J2000 coordinates
  const x_now = T[0][0] * x_j2000 + T[0][1] * y_j2000 + T[0][2] * z_j2000;
  const y_now = T[1][0] * x_j2000 + T[1][1] * y_j2000 + T[1][2] * z_j2000;
  const z_now = T[2][0] * x_j2000 + T[2][1] * y_j2000 + T[2][2] * z_j2000;

  // Define the rotation matrix for the Earth's rotation
  const theta = 2 * Math.PI * (JD - 2451545) / 365.25;
  const R = [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ];

  // Apply the rotation matrix to the coordinates
  const x = R[0][0] * x_now + R[0][1] * y_now + R[0][2] * z_now;
  const y = R[1][0] * x_now + R[1][1] * y_now + R[1][2] * z_now;
  const z = R[2][0] * x_now + R[2][1] * y_now + R[2][2] * z_now;

  return {
      x: x,
      y: z,
      z: -y,
  };

}

// Returns date and time in the (weird) format `YYYYMMDD.hhmm`, f.ex. 20221121.1858
export function getUTCDatetime() : number {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = 1 + now.getUTCMonth();
    const day = now.getUTCDate();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const dateStr = 10000 * year + 100 * month + day + "."
                  + (hours < 10 ? "0" + hours : hours)
                  + (minutes < 10 ? "0" + minutes : minutes);
    return parseFloat(dateStr);
}

export function getSunMoonPositions(desiredDatetime?: number) {
    const datetime = desiredDatetime == undefined ? getUTCDatetime() : desiredDatetime;

    const eqc: any = calculateEquatorialCoords(datetime);
    //console.log("Sun  ra="+eqc.SunRa+" dec="+eqc.SunDec);
    //console.log("Moon ra="+eqc.MoonRa+" dec="+eqc.MoonDec);

    // Sun distance is in AU, where 1 AU is the Sun-Earth average distance
    // To convert to this 3D space distance, we convert the Sun distance in Earth radii
    eqc.SunDistance *= 50; //  ~ realistic should be 23171.0
    const sun = positionFromEquatorialCoords(eqc.SunRa, eqc.SunDec, eqc.SunDistance);

    // Moon distance is in Earth radii, or ~30.0 Earth diameters
    // Make it closer though, or it won't even be rendered
    eqc.MoonDist /= 6;

    const moon = positionFromEquatorialCoords(eqc.MoonRa, eqc.MoonDec, eqc.MoonDist);

    //console.log("Sun  x="+sun.x+" y="+sun.y+" z="+sun.z);
    //console.log("Moon x="+moon.x+" y="+moon.y+" z="+moon.z);

    return {
        eqc: eqc,
        sun: sun,
        moon: moon,
    }
}
