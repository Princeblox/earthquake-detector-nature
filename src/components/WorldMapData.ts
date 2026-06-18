export interface ContinentPath {
  name: string;
  d: string;
}

// Highly stylized, ultra-crisp continental outlines for Equirectangular projection (1000x500 box)
export const continentPaths: ContinentPath[] = [
  {
    name: "North America",
    d: `M 150 100 L 180 80 L 220 70 L 260 70 L 290 85 L 295 110 L 280 120 L 250 125 
        L 245 135 L 230 145 L 200 150 L 195 170 L 220 185 L 235 220 L 245 250 L 248 260 
        L 230 255 L 210 245 L 205 230 L 195 210 L 175 180 L 165 170 L 155 160 L 150 145 
        L 142 160 L 135 180 L 115 150 L 110 130 L 125 110 Z`
  },
  {
    name: "Greenland",
    d: `M 320 60 L 350 50 L 380 50 L 390 65 L 370 85 L 340 90 L 325 80 Z`
  },
  {
    name: "South America",
    d: `M 248 261 L 260 270 L 280 290 L 295 310 L 315 340 L 310 370 L 295 400 L 285 430 
        L 275 460 L 268 475 L 262 470 L 262 450 L 255 420 L 245 380 L 235 340 L 228 310 
        L 232 290 L 240 275 Z`
  },
  {
    name: "Africa",
    d: `M 450 220 L 480 210 L 510 215 L 535 235 L 550 250 L 560 275 L 558 300 L 545 330 
        L 535 360 L 515 390 L 500 410 L 492 410 L 490 380 L 485 350 L 478 320 L 468 310 
        L 458 305 L 452 285 L 438 275 L 434 255 L 432 240 L 440 225 Z`
  },
  {
    name: "Eurasia",
    d: `M 410 180 L 420 160 L 450 130 L 480 110 L 540 100 L 600 100 L 660 110 L 720 105 
        L 780 110 L 820 120 L 850 140 L 855 165 L 830 180 L 805 175 L 780 190 L 760 210 
        L 755 235 L 730 250 L 700 255 L 680 230 L 650 220 L 630 210 L 590 220 L 570 205 
        L 540 205 L 515 195 L 480 200 L 455 190 Z`
  },
  {
    name: "India & Indochina",
    d: `M 610 215 L 625 240 L 635 255 L 640 240 L 652 230 L 665 255 L 675 270 L 685 245 L 678 225 Z`
  },
  {
    name: "Australia & Indonesia",
    d: `M 750 320 L 780 310 L 815 325 L 830 350 L 815 380 L 778 385 L 750 365 L 742 340 Z`
  },
  {
    name: "Antarctica",
    d: `M 150 480 L 300 482 L 450 485 L 600 483 L 750 480 L 850 485 L 900 490 L 100 490 Z`
  }
];

// Stylized grid graticule lines
export const getGraticules = () => {
  const lines = [];
  // Longitude grid lines
  for (let lon = -150; lon <= 150; lon += 30) {
    const x = ((lon + 180) / 360) * 1000;
    lines.push({ x1: x, y1: 20, x2: x, y2: 480, label: `${lon}°` });
  }
  // Latitude grid lines
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * 500;
    lines.push({ x1: 50, y1: y, x2: 950, y2: y, label: `${lat}°` });
  }
  return lines;
};
