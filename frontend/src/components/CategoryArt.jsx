import React from 'react';

// Hand-drawn SVG firework illustrations, one per catalog category.
// Themed bright colours that pop on the card gradients. No external images.

const G = '#FFD54A';   // gold
const W = '#FFFFFF';
const O = '#FF8A3D';   // orange
const P = '#FF5FA2';   // pink
const C = '#6EE7FF';   // cyan
const GR = '#7CF29B';  // green

// A radial burst: n spokes from (cx,cy) with coloured tips.
const Burst = ({ cx, cy, r, n = 12, colors = [G, W], sw = 2.2, dot = 2.2 }) => {
  const lines = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x2 = cx + Math.cos(a) * r, y2 = cy + Math.sin(a) * r;
    const x1 = cx + Math.cos(a) * r * 0.28, y1 = cy + Math.sin(a) * r * 0.28;
    const col = colors[i % colors.length];
    lines.push(<line key={'l' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={sw} strokeLinecap="round" />);
    lines.push(<circle key={'d' + i} cx={x2} cy={y2} r={dot} fill={col} />);
  }
  return <g>{lines}<circle cx={cx} cy={cy} r={dot * 1.3} fill={W} /></g>;
};

const Sparkles = ({ pts }) => (
  <g>{pts.map(([x, y, s, c], i) => (
    <g key={i} fill={c || W} opacity="0.95">
      <path d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`} />
    </g>
  ))}</g>
);

const art = {
  'Sparklers': (
    <g>
      <line x1="30" y1="92" x2="66" y2="54" stroke="#C9A227" strokeWidth="4" strokeLinecap="round" />
      <Burst cx={70} cy={50} r={26} n={16} colors={[G, W, O]} sw={2} dot={2} />
      <Sparkles pts={[[26, 40, 5, G], [100, 78, 5, O], [96, 34, 4, W]]} />
    </g>
  ),
  'Flower Pots': (
    <g>
      {/* fountain spray */}
      {[...Array(11)].map((_, i) => {
        const a = (-Math.PI / 2) + ((i - 5) / 5) * 0.9;
        const len = 46 - Math.abs(i - 5) * 3;
        const x2 = 60 + Math.cos(a) * len, y2 = 74 + Math.sin(a) * len;
        return <line key={i} x1="60" y1="74" x2={x2} y2={y2} stroke={[G, O, W, G, O][i % 5]} strokeWidth="2.4" strokeLinecap="round" />;
      })}
      {[...Array(9)].map((_, i) => <circle key={'d' + i} cx={34 + i * 6.5} cy={26 + (i % 2) * 6} r="1.8" fill={[W, G, O][i % 3]} />)}
      {/* pot */}
      <path d="M48 76 L72 76 L68 94 L52 94 Z" fill="#B45309" stroke={G} strokeWidth="1.5" />
    </g>
  ),
  'Chakkar & Wheels': (
    <g>
      <circle cx="60" cy="60" r="24" fill="none" stroke={G} strokeWidth="3" strokeDasharray="6 5" />
      <circle cx="60" cy="60" r="12" fill="none" stroke={W} strokeWidth="2.5" />
      <circle cx="60" cy="60" r="3.2" fill={G} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return <path key={i} d={`M${60 + Math.cos(a) * 26} ${60 + Math.sin(a) * 26} q${Math.cos(a + 1.3) * 14} ${Math.sin(a + 1.3) * 14} ${Math.cos(a + 0.5) * 20} ${Math.sin(a + 0.5) * 20}`} fill="none" stroke={[O, P, C, G][i]} strokeWidth="2.4" strokeLinecap="round" />;
      })}
      <Sparkles pts={[[26, 30, 4, O], [96, 90, 4, C]]} />
    </g>
  ),
  'Aerial Shots': (
    <g>
      <Burst cx={60} cy={48} r={34} n={20} colors={[G, P, C, W]} sw={2} dot={2.3} />
      <Sparkles pts={[[24, 86, 5, O], [98, 80, 5, G], [30, 24, 4, C]]} />
    </g>
  ),
  'Fancy Shots': (
    <g>
      <Burst cx={42} cy={40} r={18} n={12} colors={[P, W]} sw={1.8} dot={1.8} />
      <Burst cx={82} cy={34} r={16} n={12} colors={[C, G]} sw={1.8} dot={1.8} />
      <Burst cx={66} cy={58} r={14} n={10} colors={[O, W]} sw={1.6} dot={1.6} />
      {/* multi-shot cake */}
      <rect x="40" y="76" width="40" height="18" rx="3" fill="#7F1D1D" stroke={G} strokeWidth="1.5" />
      {[48, 60, 72].map((x) => <line key={x} x1={x} y1="76" x2={x} y2="68" stroke={G} strokeWidth="2" strokeLinecap="round" />)}
    </g>
  ),
  'Bombs': (
    <g>
      <circle cx="58" cy="66" r="22" fill="#1F2937" stroke={G} strokeWidth="2" />
      <circle cx="51" cy="59" r="5" fill="rgba(255,255,255,0.35)" />
      <path d="M72 50 q10 -8 8 -20" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" />
      <Burst cx={82} cy={28} r={12} n={10} colors={[O, G, W]} sw={1.8} dot={1.8} />
    </g>
  ),
  'Rockets': (
    <g>
      <g transform="rotate(38 60 60)">
        <path d="M60 30 q7 10 7 24 L53 54 q0 -14 7 -24 Z" fill={W} stroke={G} strokeWidth="1.5" />
        <circle cx="60" cy="44" r="3.2" fill={C} />
        <path d="M53 54 l-7 8 l7 -2 Z" fill={O} />
        <path d="M67 54 l7 8 l-7 -2 Z" fill={O} />
        <path d="M56 62 q4 10 4 18 q0 -8 4 -18 Z" fill={G} opacity="0.9" />
      </g>
      <Sparkles pts={[[30, 34, 4, G], [92, 44, 4, P], [40, 92, 4, C]]} />
    </g>
  ),
  'Fancy Novelties': (
    <g>
      <rect x="40" y="60" width="40" height="32" rx="3" fill="#6D28D9" stroke={G} strokeWidth="1.5" />
      <rect x="40" y="60" width="40" height="10" rx="2" fill="#4C1D95" stroke={G} strokeWidth="1" />
      <line x1="60" y1="60" x2="60" y2="92" stroke={G} strokeWidth="2" />
      <path d="M60 60 q-10 -10 -4 -16 q6 -4 4 16" fill={P} />
      <path d="M60 60 q10 -10 4 -16 q-6 -4 -4 16" fill={P} />
      <Burst cx={60} cy={34} r={16} n={12} colors={[G, W, O]} sw={1.8} dot={1.8} />
    </g>
  ),
};

const CategoryArt = ({ name }) => (
  <svg viewBox="0 0 120 120" role="img" aria-label={name} style={{ display: 'block', width: '100%', height: 'auto' }}>
    {art[name] || <Burst cx={60} cy={60} r={30} n={16} colors={[G, W, O]} />}
  </svg>
);

export default CategoryArt;
