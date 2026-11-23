import React from 'react';

export function Mascot({ pose = 'wave' }) {
  return (
    <svg
      viewBox="0 0 440 500"
      role="img"
      aria-label="Illustration of a smiling girl developer in a hoodie with a laptop"
    >
      <defs>
        <linearGradient id="hoodieG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#26263d" />
          <stop offset="1" stopColor="#0d0d16" />
        </linearGradient>
        <linearGradient id="hairG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#32264d" />
          <stop offset="1" stopColor="#100c1a" />
        </linearGradient>
      </defs>

      {/* Torso & Hoodie */}
      <path
        d="M120 392C120 332 160 312 222 312C284 312 324 332 324 392Z"
        fill="#0b0b12"
        stroke="#38bdf8"
        strokeWidth="4"
      />
      <path
        d="M30 500C30 420 74 372 150 352L222 374L294 352C370 372 414 420 414 500Z"
        fill="url(#hoodieG)"
        stroke="#38bdf8"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M150 352C170 384 200 394 222 394C244 394 274 384 294 352"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Hair back & bun */}
      <path
        d="M130 268C108 160 160 108 222 108C284 108 336 160 314 268C324 316 314 358 296 386L272 322L172 322L148 386C130 358 120 316 130 268Z"
        fill="url(#hairG)"
        stroke="#38bdf8"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="222" cy="84" r="33" fill="url(#hairG)" stroke="#38bdf8" strokeWidth="4" />
      <path
        d="M202 70C208 60 220 56 234 60"
        stroke="#7d6bb0"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="222" cy="114" rx="27" ry="8" fill="#8b5cf6" stroke="#120c1f" strokeWidth="2" />

      {/* Neck & Ears */}
      <rect x="198" y="296" width="48" height="64" rx="14" fill="#e8a583" />
      <ellipse cx="143" cy="246" rx="9" ry="14" fill="#f0b08c" />
      <ellipse cx="301" cy="246" rx="9" ry="14" fill="#f0b08c" />
      <circle cx="143" cy="264" r="4.5" fill="#fde047" />
      <circle cx="301" cy="264" r="4.5" fill="#fde047" />

      {/* Head & Blush */}
      <path
        d="M142 222C142 154 190 142 222 142C254 142 302 154 302 222C302 282 262 324 222 324C182 324 142 282 142 222Z"
        fill="#f6bf9d"
      />
      <ellipse cx="172" cy="270" rx="17" ry="9" fill="#f472b6" opacity=".45" />
      <ellipse cx="272" cy="270" rx="17" ry="9" fill="#f472b6" opacity=".45" />

      {/* Eyes & Lids */}
      <ellipse cx="190" cy="242" rx="15" ry="18" fill="#fff" />
      <ellipse cx="254" cy="242" rx="15" ry="18" fill="#fff" />
      <ellipse cx="190" cy="243" rx="11" ry="15" fill="#3b2a6b" />
      <ellipse cx="254" cy="243" rx="11" ry="15" fill="#3b2a6b" />
      <circle cx="190" cy="244" r="6" fill="#120c1f" />
      <circle cx="254" cy="244" r="6" fill="#120c1f" />
      <circle cx="186" cy="237" r="4" fill="#fff" />
      <circle cx="250" cy="237" r="4" fill="#fff" />
      <ellipse className="lid" cx="190" cy="242" rx="17" ry="20" fill="#f6bf9d" />
      <ellipse className="lid" cx="254" cy="242" rx="17" ry="20" fill="#f6bf9d" />

      {/* Eyelashes & Brows */}
      <path d="M172 236Q190 219 208 236" stroke="#120c1f" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M236 236Q254 219 272 236" stroke="#120c1f" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M170 212Q188 202 208 210" stroke="#120c1f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M236 210Q256 202 274 212" stroke="#120c1f" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Nose & Mouth */}
      <path d="M222 262Q227 269 220 271" stroke="#d98e6d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M198 286Q222 318 246 286Q222 294 198 286Z" fill="#8f2d45" />
      <path d="M204 288Q222 294 240 288L238 293Q222 299 206 293Z" fill="#fff" />

      {/* Front Hair & Bangs */}
      <path
        d="M136 238C124 150 170 118 222 118C276 118 322 150 308 238C300 200 284 176 258 162C240 172 206 172 186 160C164 176 146 200 136 238Z"
        fill="url(#hairG)"
        stroke="#120c1f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M170 142C190 130 214 126 238 130" stroke="#7d6bb0" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path
        d="M138 238C132 280 138 320 152 346C158 312 154 270 160 232Z"
        fill="url(#hairG)"
        stroke="#120c1f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M306 238C312 280 306 320 292 346C286 312 290 270 284 232Z"
        fill="url(#hairG)"
        stroke="#120c1f"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Hair Clip */}
      <path
        d="M262 150L288 140L278 161L294 159L262 192L270 168L256 170Z"
        fill="#fde047"
        stroke="#120c1f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Hoodie Cords */}
      <path d="M202 394L198 450" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <path d="M242 394L246 446" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <circle cx="198" cy="455" r="5" fill="#8b5cf6" />
      <circle cx="246" cy="451" r="5" fill="#8b5cf6" />

      {/* Handwritten quotes */}
      <text
        x="338"
        y="452"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="25"
        fontWeight="700"
        fill="#a78bfa"
        transform="rotate(-8 338 452)"
      >
        git push
      </text>
      <text
        x="340"
        y="478"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="25"
        fontWeight="700"
        fill="#38bdf8"
        transform="rotate(-8 340 478)"
      >
        team up :)
      </text>

      {/* Right Arm & Hand Poses */}
      <path d="M352 404C372 344 368 302 352 266" fill="none" stroke="#38bdf8" strokeWidth="58" strokeLinecap="round" />
      <path d="M352 404C372 344 368 302 352 266" fill="none" stroke="#1a1a2a" strokeWidth="48" strokeLinecap="round" />
      <ellipse cx="352" cy="262" rx="27" ry="10" fill="#0f0f18" stroke="#38bdf8" strokeWidth="3" />

      <g transform="translate(352 256)">
        {/* Wave pose */}
        <g className={`pose ${pose === 'wave' ? 'on' : 'off'}`}>
          <g className="hand wave" fill="#f6bf9d" stroke="#c9825f" strokeWidth="2">
            <rect x="-27" y="-92" width="13" height="46" rx="6.5" transform="rotate(-12 -20 -50)" />
            <rect x="-9" y="-106" width="14" height="58" rx="7" />
            <rect x="8" y="-98" width="13" height="52" rx="6.5" transform="rotate(8 14 -50)" />
            <rect x="22" y="-82" width="12" height="42" rx="6" transform="rotate(18 28 -45)" />
            <ellipse cx="0" cy="-28" rx="27" ry="29" />
            <ellipse cx="-30" cy="-26" rx="9" ry="19" transform="rotate(-38 -30 -26)" />
          </g>
        </g>
        {/* Peace pose */}
        <g className={`pose ${pose === 'peace' ? 'on' : 'off'}`}>
          <g className="hand nod" fill="#f6bf9d" stroke="#c9825f" strokeWidth="2">
            <rect x="-25" y="-100" width="13" height="58" rx="6.5" transform="rotate(-16 -18 -46)" />
            <rect x="-1" y="-106" width="14" height="62" rx="7" transform="rotate(14 6 -46)" />
            <ellipse cx="0" cy="-28" rx="27" ry="29" />
            <ellipse cx="17" cy="-42" rx="10" ry="12" />
            <ellipse cx="28" cy="-32" rx="8" ry="10" />
            <ellipse cx="11" cy="-24" rx="15" ry="8" transform="rotate(-24 11 -24)" />
          </g>
        </g>
      </g>

      {/* Left Arm & Laptop */}
      <path d="M44 462C46 432 62 412 92 402" fill="none" stroke="#38bdf8" strokeWidth="54" strokeLinecap="round" />
      <path d="M44 462C46 432 62 412 92 402" fill="none" stroke="#1a1a2a" strokeWidth="44" strokeLinecap="round" />
      <path
        d="M62 500L90 398Q92 392 98 392L278 392Q284 392 286 398L318 500Z"
        fill="#3a3a4c"
        stroke="#e4e4f2"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <text
        x="190"
        y="436"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="34"
        fontWeight="700"
        fill="#38bdf8"
      >
        &lt;/&gt;
      </text>
      <text
        x="190"
        y="470"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="22"
        fontWeight="700"
        fill="#ececf8"
      >
        Code. Connect.
      </text>
      <text
        x="190"
        y="492"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="22"
        fontWeight="700"
        fill="#ececf8"
      >
        Collaborate.
      </text>
      <ellipse cx="104" cy="394" rx="23" ry="14" fill="#f6bf9d" stroke="#c9825f" strokeWidth="2" />
    </svg>
  );
}

export default Mascot;
