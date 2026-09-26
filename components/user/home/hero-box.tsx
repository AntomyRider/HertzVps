"use client";

const HeroPizzaBox = () => {
  return (
    <div className="group relative aspect-[1600/940] w-full cursor-pointer select-none overflow-hidden rounded-md bg-[#09090b]">
      <svg
        viewBox="0 0 1600 940"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="Hertz Manager 3D Matte Black Packaging Box with Geometric H Logo"
      >
        <defs>
          <style>{`
            @keyframes hertz-char-laser-seq {
              0% {
                stroke-dashoffset: 128;
                opacity: 0;
              }
              2% {
                opacity: 1;
              }
              11% {
                opacity: 1;
              }
              14% {
                stroke-dashoffset: -28;
                opacity: 0;
              }
              100% {
                stroke-dashoffset: -28;
                opacity: 0;
              }
            }
            .char-laser {
              opacity: 0;
              stroke-dasharray: 28 100;
              stroke-dashoffset: 128;
              animation: hertz-char-laser-seq 6.6s infinite linear;
            }
          `}</style>

          {/* Subtle High-Voltage Blue Electric Glow Filter */}
          <filter
            id="electric-zap-glow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="1.4"
              floodColor="#e0f2fe"
              floodOpacity="0.95"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4.5"
              floodColor="#3b82f6"
              floodOpacity="0.85"
            />
          </filter>

          {/* Procedural Fine Matte Cardboard / Studio Surface Grain Filter */}
          <filter
            id="hertz-matte-grain"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              seed="14"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="
                0 0 0 0 1
                0 0 0 0 1
                0 0 0 0 1
                0 0 0 0.055 0"
              in="noise"
              result="coloredNoise"
            />
            <feBlend
              mode="overlay"
              in="coloredNoise"
              in2="SourceGraphic"
              result="grained"
            />
          </filter>

          {/* Deep Ambient Shadow Under the Box Lid on the Studio Floor */}
          <filter
            id="box-floor-shadow"
            x="-20%"
            y="-20%"
            width="150%"
            height="150%"
          >
            <feDropShadow
              dx="-42"
              dy="38"
              stdDeviation="36"
              floodColor="#000000"
              floodOpacity="0.92"
            />
            <feDropShadow
              dx="-14"
              dy="16"
              stdDeviation="12"
              floodColor="#000000"
              floodOpacity="0.85"
            />
          </filter>

          {/* Soft 3D Extrusion Cast Shadow onto the Box Lid Surface */}
          <filter
            id="logo-cast-shadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="-10"
              dy="14"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity="0.82"
            />
            <feDropShadow
              dx="-3"
              dy="5"
              stdDeviation="2.5"
              floodColor="#000000"
              floodOpacity="0.9"
            />
          </filter>

          {/* Subtle White/Blue Top-Face Glow for 3D H Blocks */}
          <filter
            id="h-block-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor="#93c5fd"
              floodOpacity="0.22"
            />
          </filter>

          {/* Studio Floor Lighting Gradient (Top-Left to Bottom-Right) */}
          <linearGradient
            id="studio-floor-grad"
            x1="80"
            y1="40"
            x2="950"
            y2="900"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1e1e22" />
            <stop offset="38%" stopColor="#121215" />
            <stop offset="75%" stopColor="#09090b" />
            <stop offset="100%" stopColor="#050507" />
          </linearGradient>

          {/* Matte Black Box Lid Surface Gradient */}
          <linearGradient
            id="box-lid-surface"
            x1="540"
            y1="80"
            x2="1520"
            y2="920"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2b2b30" />
            <stop offset="28%" stopColor="#212126" />
            <stop offset="62%" stopColor="#17171b" />
            <stop offset="88%" stopColor="#101013" />
            <stop offset="100%" stopColor="#0b0b0d" />
          </linearGradient>

          {/* Subtle Specular Sheen near the Left Crease of the Box Lid */}
          <linearGradient
            id="box-left-sheen"
            x1="360"
            y1="300"
            x2="880"
            y2="560"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* 3D White Top Face Gradient for Geometric H Blocks */}
          <linearGradient
            id="h-top-face"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>

          {/* Dark Embossed Cross Bar Top Surface Gradient */}
          <linearGradient
            id="dark-bar-top"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#232328" />
            <stop offset="50%" stopColor="#1b1b20" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>

          {/* Vignette Overlay Around Frame Edges */}
          <radialGradient
            id="frame-vignette"
            cx="52%"
            cy="48%"
            r="65%"
            fx="45%"
            fy="42%"
          >
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="88%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.82" />
          </radialGradient>
          {/* Bottom Fade-to-Black Gradient so the Box Blends with #000000 BG */}
          <linearGradient
            id="bottom-bg-fade"
            x1="800"
            y1="580"
            x2="800"
            y2="940"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0.68" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* ============================================================
            1. STUDIO MATTE BACKDROP FLOOR
           ============================================================ */}
        <rect
          x="0"
          y="0"
          width="1600"
          height="940"
          fill="url(#studio-floor-grad)"
        />

        {/* ============================================================
            2. ANGLED MATTE BLACK PIZZA / PACKAGING BOX LID
               Corner at (215, 680)
               Top-Left Edge: (735, -60) -> (215, 680)
               Bottom Edge:   (215, 680) -> (995, 970)
           ============================================================ */}
        <g filter="url(#box-floor-shadow)">
          {/* 3D Box Side Thickness / Lip (Left Wall) */}
          <polygon
            points="735,-60 215,680 203,686 723,-54"
            fill="#0d0d10"
          />

          {/* 3D Box Side Thickness / Lip (Bottom Underside Wall) */}
          <polygon
            points="215,680 995,970 983,982 203,686"
            fill="#070709"
          />

          {/* Main Matte Black Box Lid Top Surface */}
          <polygon
            points="735,-60 1660,-60 1660,970 995,970 215,680"
            fill="url(#box-lid-surface)"
          />

          {/* Soft Studio Light Falloff Across Left Box Edge */}
          <polygon
            points="735,-60 1200,-60 720,860 215,680"
            fill="url(#box-left-sheen)"
          />

          {/* Crisp 1.5px Crease Highlight Along Top-Left Box Lid Edge Only */}
          <line
            x1="735"
            y1="-60"
            x2="215"
            y2="680"
            stroke="#383840"
            strokeWidth="1.6"
            strokeOpacity="0.75"
          />

          {/* Subtle Inner Packaging Fold Score Line (Top-Left Edge Only) */}
          <line
            x1="758"
            y1="-60"
            x2="246"
            y2="668"
            stroke="#0e0e11"
            strokeWidth="1.2"
            strokeOpacity="0.65"
          />
          <line
            x1="759.5"
            y1="-60"
            x2="247.5"
            y2="667.5"
            stroke="#2c2c33"
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />
        </g>

        {/* ============================================================
            3. BOX SURFACE PLANE GROUP (ISOMETRIC / PERSPECTIVE MATRIX)
               Origin (0,0) sits on the box lid at (690, 515).
               +X axis runs parallel to bottom box edge: (0.937, 0.349)
               +Y axis runs parallel to left box edge downward: (-0.575, 0.818)
               3D Extrusion rises by (-12, -16) in local coordinates.
           ============================================================ */}
        <g transform="matrix(0.937 0.349 -0.575 0.818 690 515)">
          {/* ----------------------------------------------------------
              3A. DARK EMBOSSED 3D "H" BASE PLATFORM (NOT AN X/CROSS)
                  Monumental H-shaped dark matte base with 3D side bevels
                  and slotted inner recessed trenches along both legs & bridge.
                  Left Leg:  x = -175..-65, y = -185..185
                  Right Leg: x =  65..175,  y = -185..185
                  Bridge:    x = -65..65,   y = -48..48
             ---------------------------------------------------------- */}
          <g filter="url(#logo-cast-shadow)">
            {/* === 3D EXTRUSION SIDE WALLS OF THE DARK "H" BASE === */}
            {/* Top Bevel Rim Walls */}
            <polygon
              points="-175,-185 -65,-185 -75,-199 -185,-199"
              fill="#32323b"
            />
            <polygon
              points="65,-185 175,-185 165,-199 55,-199"
              fill="#32323b"
            />
            <polygon
              points="-65,-48 65,-48 55,-62 -75,-62"
              fill="#2d2d36"
            />

            {/* Left-Facing 3D Side Extrusion Walls */}
            <polygon
              points="-175,-185 -175,185 -185,171 -185,-199"
              fill="#141418"
            />
            <polygon
              points="65,-185 65,-48 55,-62 55,-199"
              fill="#121216"
            />
            <polygon
              points="65,48 65,185 55,171 55,34"
              fill="#121216"
            />

            {/* Bottom-Facing 3D Side Extrusion Walls */}
            <polygon
              points="-175,185 -65,185 -75,171 -185,171"
              fill="#09090c"
            />
            <polygon
              points="65,185 175,185 165,171 55,171"
              fill="#09090c"
            />
            <polygon
              points="-65,48 65,48 55,34 -75,34"
              fill="#0a0a0d"
            />

            {/* Right-Facing 3D Side Extrusion Walls */}
            <polygon
              points="-65,-185 -65,-48 -75,-62 -75,-199"
              fill="#08080a"
            />
            <polygon
              points="-65,48 -65,185 -75,171 -75,34"
              fill="#08080a"
            />
            <polygon
              points="175,-185 175,185 165,171 165,-199"
              fill="#08080a"
            />

            {/* === RAISED TOP SURFACE OF DARK "H" BASE (Shifted -10, -14) === */}
            <g transform="translate(-10, -14)">
              {/* Outer H Base Silhouette */}
              <path
                d="M -175 -185 H -65 V -48 H 65 V -185 H 175 V 185 H 65 V 48 H -65 V 185 H -175 Z"
                fill="url(#dark-bar-top)"
                stroke="#32323b"
                strokeWidth="1.5"
              />

              {/* Slotted Debossed Trench inside Left Leg of H Base */}
              <rect
                x="-153"
                y="-162"
                width="66"
                height="324"
                fill="#101014"
                stroke="#27272f"
                strokeWidth="1.2"
              />
              <line
                x1="-153"
                y1="-162"
                x2="-87"
                y2="-162"
                stroke="#070709"
                strokeWidth="2.2"
              />
              <line
                x1="-153"
                y1="-162"
                x2="-153"
                y2="162"
                stroke="#070709"
                strokeWidth="2.2"
              />

              {/* Slotted Debossed Trench inside Right Leg of H Base */}
              <rect
                x="87"
                y="-162"
                width="66"
                height="324"
                fill="#101014"
                stroke="#27272f"
                strokeWidth="1.2"
              />
              <line
                x1="87"
                y1="-162"
                x2="153"
                y2="-162"
                stroke="#070709"
                strokeWidth="2.2"
              />
              <line
                x1="87"
                y1="-162"
                x2="87"
                y2="162"
                stroke="#070709"
                strokeWidth="2.2"
              />

              {/* Slotted Debossed Trench across the H Bridge */}
              <rect
                x="-88"
                y="-22"
                width="176"
                height="44"
                fill="#121216"
                stroke="#292932"
                strokeWidth="1.2"
              />
              <line
                x1="-88"
                y1="-22"
                x2="88"
                y2="-22"
                stroke="#070709"
                strokeWidth="2"
              />
            </g>
          </g>

          {/* ----------------------------------------------------------
              3B. 3D EXTRUDED WHITE GEOMETRIC BLOCK "H" LOGO
                  Mounted directly on top of the dark 3D H base platform:
                  - Left Stencil H-Column  (x: -138..-92, y: -138..138)
                  - Center H-Bridge        (x: -92..92,   y: -20..20)
                  - Right Stencil H-Column (x:  92..138,  y: -138..138,
                    with a geometric stencil split giving it the signature
                    high-tech isometric block look)
                  Base at (-10,-14), Top Face raised to (-26,-36).
             ---------------------------------------------------------- */}
          <g filter="url(#logo-cast-shadow)">
            {/* === LEFT PILLAR OF 3D "H" (3D Side Walls) === */}
            <polygon
              points="-148,-152 -102,-152 -118,-174 -164,-174"
              fill="#cbd5e1"
            />
            <polygon
              points="-148,-152 -148,124 -164,102 -164,-174"
              fill="#94a3b8"
            />
            <polygon
              points="-148,124 -102,124 -118,102 -164,102"
              fill="#475569"
            />
            <polygon
              points="-102,-152 -102,124 -118,102 -118,-174"
              fill="#334155"
            />

            {/* === CENTER BRIDGE OF 3D "H" (3D Side Walls) === */}
            <polygon
              points="-102,-34 82,-34 66,-56 -118,-56"
              fill="#93c5fd"
            />
            <polygon
              points="-102,6 82,6 66,-16 -118,-16"
              fill="#2563eb"
            />

            {/* === RIGHT PILLAR OF 3D "H" — UPPER SEGMENT (3D Side Walls) === */}
            <polygon
              points="82,-152 128,-152 112,-174 66,-174"
              fill="#cbd5e1"
            />
            <polygon
              points="82,-152 82,-48 66,-70 66,-174"
              fill="#94a3b8"
            />
            <polygon
              points="82,-48 128,-48 112,-70 66,-70"
              fill="#475569"
            />
            <polygon
              points="128,-152 128,-48 112,-70 112,-174"
              fill="#334155"
            />

            {/* === RIGHT PILLAR OF 3D "H" — LOWER SEGMENT (3D Side Walls) === */}
            <polygon
              points="82,-34 128,-34 112,-56 66,-56"
              fill="#cbd5e1"
            />
            <polygon
              points="82,6 82,124 66,102 66,-16"
              fill="#94a3b8"
            />
            <polygon
              points="82,124 128,124 112,102 66,102"
              fill="#475569"
            />
            <polygon
              points="128,-34 128,124 112,102 112,-56"
              fill="#334155"
            />

            {/* === RAISED TOP FACES OF THE 3D "H" LOGO (at -26, -36) === */}
            <g transform="translate(-26, -36)" filter="url(#h-block-glow)">
              {/* Left Pillar + Bridge + Lower Right Interlocking H Block */}
              <path
                d="M -138 -138 H -92 V -20 H 138 V 138 H 92 V 20 H -92 V 138 H -138 Z"
                fill="url(#h-top-face)"
                stroke="#ffffff"
                strokeWidth="1.3"
              />

              {/* Blue Accent Line Along H Center Bridge */}
              <rect
                x="-88"
                y="-6"
                width="176"
                height="12"
                fill="#dbeafe"
              />

              {/* Upper Right Stencil Pillar Block of the H */}
              <rect
                x="92"
                y="-138"
                width="46"
                height="104"
                fill="url(#h-top-face)"
                stroke="#ffffff"
                strokeWidth="1.3"
              />
            </g>
          </g>

          {/* ----------------------------------------------------------
              3C. DEBOSSED LOWERCASE "ertz" + "Manager" ON BOX SURFACE
                  Row 1: "ertz" continuing directly from the 3D "H" -> "Hertz"
                  Row 2: "Manager" replacing "V2"
                  Uses inset shadow (-1.8,-2.2 #08080a) + bevel (+1.6,+1.6 #2f2f38)
                  to replicate the stamped matte cardboard look.
             ---------------------------------------------------------- */}
          <g transform="translate(212, -32) scale(1.12)">
            {/* === TOP-LEFT DEBOSSED INNER SHADOW LAYER === */}
            <g transform="translate(-1.8, -2.2)" fill="#08080a">
              {/* Row 1: lowercase 'ertz' */}
              {/* e */}
              <path d="M0,16 H52 V46 H16 V54 H52 V68 H0 V16 Z M16,28 V35 H36 V28 Z" />
              {/* r */}
              <path d="M70,16 H116 V30 H86 V68 H70 V16 Z" />
              {/* t */}
              <path d="M136,0 H152 V16 H174 V29 H152 V54 H174 V68 H136 V29 H124 V16 H136 V0 Z" />
              {/* z */}
              <path d="M190,16 H242 V30 L212,55 H242 V68 H190 V54 L220,29 H190 Z" />

              {/* Row 2: 'Manager' */}
              <g transform="translate(0, 88) scale(0.66)">
                {/* M */}
                <path d="M0,0 H16 L32,28 L48,0 H64 V68 H49 V26 L32,52 L15,26 V68 H0 Z" />
                {/* a */}
                <path d="M78,16 H126 V68 H78 V38 H111 V28 H78 V16 Z M92,48 V57 H111 V48 Z" />
                {/* n */}
                <path d="M140,16 H186 V68 H171 V29 H155 V68 H140 V16 Z" />
                {/* a */}
                <path d="M200,16 H248 V68 H200 V38 H233 V28 H200 V16 Z M214,48 V57 H233 V48 Z" />
                {/* g */}
                <path d="M262,16 H310 V82 H262 V70 H295 V60 H262 V16 Z M277,28 V48 H295 V28 Z" />
                {/* e */}
                <path d="M324,16 H372 V46 H339 V56 H372 V68 H324 V16 Z M339,28 V35 H357 V28 Z" />
                {/* r */}
                <path d="M386,16 H426 V29 H401 V68 H386 V16 Z" />
              </g>
            </g>

            {/* === BOTTOM-RIGHT BEVEL HIGHLIGHT LAYER === */}
            <g transform="translate(1.6, 1.6)" fill="#2f2f38" opacity="0.82">
              {/* Row 1: lowercase 'ertz' */}
              {/* e */}
              <path d="M0,16 H52 V46 H16 V54 H52 V68 H0 V16 Z M16,28 V35 H36 V28 Z" />
              {/* r */}
              <path d="M70,16 H116 V30 H86 V68 H70 V16 Z" />
              {/* t */}
              <path d="M136,0 H152 V16 H174 V29 H152 V54 H174 V68 H136 V29 H124 V16 H136 V0 Z" />
              {/* z */}
              <path d="M190,16 H242 V30 L212,55 H242 V68 H190 V54 L220,29 H190 Z" />

              {/* Row 2: 'Manager' */}
              <g transform="translate(0, 88) scale(0.66)">
                {/* M */}
                <path d="M0,0 H16 L32,28 L48,0 H64 V68 H49 V26 L32,52 L15,26 V68 H0 Z" />
                {/* a */}
                <path d="M78,16 H126 V68 H78 V38 H111 V28 H78 V16 Z M92,48 V57 H111 V48 Z" />
                {/* n */}
                <path d="M140,16 H186 V68 H171 V29 H155 V68 H140 V16 Z" />
                {/* a */}
                <path d="M200,16 H248 V68 H200 V38 H233 V28 H200 V16 Z M214,48 V57 H233 V48 Z" />
                {/* g */}
                <path d="M262,16 H310 V82 H262 V70 H295 V60 H262 V16 Z M277,28 V48 H295 V28 Z" />
                {/* e */}
                <path d="M324,16 H372 V46 H339 V56 H372 V68 H324 V16 Z M339,28 V35 H357 V28 Z" />
                {/* r */}
                <path d="M386,16 H426 V29 H401 V68 H386 V16 Z" />
              </g>
            </g>

            {/* === MAIN STAMPED MATTE CHARCOAL LETTER FILL === */}
            <g fill="#23232a">
              {/* Row 1: lowercase 'ertz' */}
              {/* e */}
              <path d="M0,16 H52 V46 H16 V54 H52 V68 H0 V16 Z M16,28 V35 H36 V28 Z" />
              {/* r */}
              <path d="M70,16 H116 V30 H86 V68 H70 V16 Z" />
              {/* t */}
              <path d="M136,0 H152 V16 H174 V29 H152 V54 H174 V68 H136 V29 H124 V16 H136 V0 Z" />
              {/* z */}
              <path d="M190,16 H242 V30 L212,55 H242 V68 H190 V54 L220,29 H190 Z" />

              {/* Row 2: 'Manager' */}
              <g transform="translate(0, 88) scale(0.66)">
                {/* M */}
                <path d="M0,0 H16 L32,28 L48,0 H64 V68 H49 V26 L32,52 L15,26 V68 H0 Z" />
                {/* a */}
                <path d="M78,16 H126 V68 H78 V38 H111 V28 H78 V16 Z M92,48 V57 H111 V48 Z" />
                {/* n */}
                <path d="M140,16 H186 V68 H171 V29 H155 V68 H140 V16 Z" />
                {/* a */}
                <path d="M200,16 H248 V68 H200 V38 H233 V28 H200 V16 Z M214,48 V57 H233 V48 Z" />
                {/* g */}
                <path d="M262,16 H310 V82 H262 V70 H295 V60 H262 V16 Z M277,28 V48 H295 V28 Z" />
                {/* e */}
                <path d="M324,16 H372 V46 H339 V56 H372 V68 H324 V16 Z M339,28 V35 H357 V28 Z" />
                {/* r */}
                <path d="M386,16 H426 V29 H401 V68 H386 V16 Z" />
              </g>
            </g>

            {/* === CONTINUOUS SEQUENTIAL LASER RUNNING CHARACTER-BY-CHARACTER ALONG "ertz" & "Manager" === */}
            <g
              className="pointer-events-none"
              filter="url(#electric-zap-glow)"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Row 1: Sequential Laser on 'e' -> 'r' -> 't' -> 'z' */}
              <g stroke="#93c5fd" strokeWidth="1.5">
                {/* 1. 'e' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "0s" }}
                  d="M0,16 H52 V46 H16 V54 H52 V68 H0 V16 Z M16,28 V35 H36 V28 Z"
                />
                {/* 2. 'r' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "0.55s" }}
                  d="M70,16 H116 V30 H86 V68 H70 V16 Z"
                />
                {/* 3. 't' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "1.10s" }}
                  d="M136,0 H152 V16 H174 V29 H152 V54 H174 V68 H136 V29 H124 V16 H136 V0 Z"
                />
                {/* 4. 'z' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "1.65s" }}
                  d="M190,16 H242 V30 L212,55 H242 V68 H190 V54 L220,29 H190 Z"
                />
              </g>

              {/* Row 2: Sequential Laser on 'M' -> 'a' -> 'n' -> 'a' -> 'g' -> 'e' -> 'r' */}
              <g
                transform="translate(0, 88) scale(0.66)"
                stroke="#60a5fa"
                strokeWidth="2.1"
              >
                {/* 5. 'M' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "2.20s" }}
                  d="M0,0 H16 L32,28 L48,0 H64 V68 H49 V26 L32,52 L15,26 V68 H0 Z"
                />
                {/* 6. 'a' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "2.75s" }}
                  d="M78,16 H126 V68 H78 V38 H111 V28 H78 V16 Z M92,48 V57 H111 V48 Z"
                />
                {/* 7. 'n' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "3.30s" }}
                  d="M140,16 H186 V68 H171 V29 H155 V68 H140 V16 Z"
                />
                {/* 8. 'a' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "3.85s" }}
                  d="M200,16 H248 V68 H200 V38 H233 V28 H200 V16 Z M214,48 V57 H233 V48 Z"
                />
                {/* 9. 'g' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "4.40s" }}
                  d="M262,16 H310 V82 H262 V70 H295 V60 H262 V16 Z M277,28 V48 H295 V28 Z"
                />
                {/* 10. 'e' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "4.95s" }}
                  d="M324,16 H372 V46 H339 V56 H372 V68 H324 V16 Z M339,28 V35 H357 V28 Z"
                />
                {/* 11. 'r' */}
                <path
                  pathLength="100"
                  className="char-laser"
                  style={{ animationDelay: "5.50s" }}
                  d="M386,16 H426 V29 H401 V68 H386 V16 Z"
                />
              </g>
            </g>
          </g>
        </g>

        {/* ============================================================
            4. GLOBAL MATTE PAPER GRAIN & STUDIO VIGNETTE OVERLAY
           ============================================================ */}
        <rect
          x="0"
          y="0"
          width="1600"
          height="940"
          fill="#808080"
          opacity="0.22"
          filter="url(#hertz-matte-grain)"
          style={{ mixBlendMode: "overlay" }}
        />

        <rect
          x="0"
          y="0"
          width="1600"
          height="940"
          fill="url(#frame-vignette)"
        />

        {/* Smooth Bottom Fade-to-Black so the Box Melts into the #000000 Page BG */}
        <rect
          x="0"
          y="560"
          width="1600"
          height="380"
          fill="url(#bottom-bg-fade)"
        />
      </svg>
    </div>
  );
};

export default HeroPizzaBox;
