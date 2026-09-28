import styles from "./NeuralNetworkBackground.module.css";

// Connected axons and local dendrites form a continuous, right-weighted network.
const connections = [
  "M-40 470C130 465 190 286 460 345",
  "M460 345C578 372 646 278 790 320",
  "M460 345C508 214 640 189 682 52",
  "M790 320C876 285 906 163 1050 145",
  "M790 320C931 299 965 452 1100 420",
  "M790 320C794 447 888 458 920 590",
  "M1050 145C1164 112 1221 230 1340 280",
  "M1050 145C1009 53 1141 23 1150-40",
  "M1100 420C1152 339 1284 381 1340 280",
  "M1100 420C1065 505 1003 530 920 590",
  "M1340 280C1400 234 1460 228 1490 160",
  "M1340 280C1300 423 1460 461 1450 574",
  "M1100 420C1210 438 1198 592 1352 668",
  "M920 590C808 582 695 675 588 673",
];

const dendrites = [
  "M460 345C423 314 429 276 386 254M429 298L443 262M401 267L374 271M460 345C408 368 390 404 340 404M392 386L389 422",
  "M790 320C751 280 766 248 732 220M759 262L790 242M747 240L748 206M790 320C734 352 723 391 674 404M734 374L748 404M698 398L685 434",
  "M1050 145C1069 98 1035 74 1058 34M1049 76L1019 57M1050 145C1112 159 1120 202 1164 212M1129 190L1156 176M1144 204L1143 235M1050 145C1006 135 989 106 950 105M988 122L966 145",
  "M1100 420C1078 377 1102 347 1072 317M1091 356L1120 342M1084 331L1058 329M1100 420C1154 454 1172 489 1217 482M1171 476L1178 511M1198 485L1223 507",
  "M1340 280C1289 265 1277 228 1237 219M1281 242L1290 213M1256 225L1241 244M1340 280C1355 332 1386 342 1402 384M1380 338L1410 336M1392 363L1377 389",
  "M920 590C933 539 902 519 919 478M911 523L885 502M920 590C963 614 972 647 1009 656M967 631L991 622",
];

const neurons = [
  { x: 460, y: 345, gold: false },
  { x: 790, y: 320, gold: true },
  { x: 1050, y: 145, gold: false },
  { x: 1100, y: 420, gold: true },
  { x: 1340, y: 280, gold: false },
  { x: 920, y: 590, gold: false },
];

export function NeuralNetworkBackground() {
  return (
    <div data-testid="neural-network" className={styles.background} aria-hidden="true">
      <svg className={styles.network} viewBox="0 0 1400 640" preserveAspectRatio="xMidYMid slice" fill="none" focusable="false">
        <g className={styles.connections}>
          {connections.map((path) => <path key={path} d={path} pathLength="1" />)}
        </g>
        <g className={styles.dendrites}>
          {dendrites.map((path) => <path key={path} d={path} pathLength="1" />)}
        </g>
        <g className={styles.signals}>
          {[connections[3], connections[4], connections[8]].map((path) => (
            <path key={path} d={path} pathLength="1" />
          ))}
        </g>
        <g className={styles.neurons}>
          {neurons.map(({ x, y, gold }) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} className={gold ? styles.goldNeuron : styles.navyNeuron}>
              <path d="M-13-4C-6-6-5-12 1-10C7-8 6-3 13 1C6 3 5 11-1 9C-7 8-6 3-13-4Z" />
              <circle r="2.5" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
