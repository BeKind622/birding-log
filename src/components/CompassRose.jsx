export default function CompassRose({ heading, size = 80 }) {
  const deg = heading ?? 0
  const r = (angle) => ({
    x: (v) => 50 + v * Math.sin(angle * Math.PI / 180),
    y: (v) => 50 - v * Math.cos(angle * Math.PI / 180),
  })

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="46" fill="#f0f4ee" stroke="#c8d6c5" strokeWidth="2" />
      {/* Tick marks for cardinal directions */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const isMajor = a % 90 === 0
        const inner = isMajor ? 38 : 41
        const pt = r(a)
        return (
          <line
            key={a}
            x1={pt.x(inner)} y1={pt.y(inner)}
            x2={pt.x(44)}    y2={pt.y(44)}
            stroke={isMajor ? '#888' : '#bbb'}
            strokeWidth={isMajor ? 2 : 1}
          />
        )
      })}
      {/* Cardinal labels */}
      <text x="50"  y="13"  textAnchor="middle" fontSize="11" fill="#c62828" fontWeight="bold">N</text>
      <text x="87"  y="54"  textAnchor="middle" fontSize="9"  fill="#666">E</text>
      <text x="50"  y="93"  textAnchor="middle" fontSize="9"  fill="#666">S</text>
      <text x="13"  y="54"  textAnchor="middle" fontSize="9"  fill="#666">W</text>
      {/* Rotating needle */}
      <g transform={`rotate(${deg}, 50, 50)`}>
        <polygon points="50,14 46.5,50 53.5,50" fill="#c62828" />
        <polygon points="50,86 46.5,50 53.5,50" fill="#bbb" />
        <circle cx="50" cy="50" r="4" fill="white" stroke="#555" strokeWidth="1.5" />
      </g>
      {heading == null && (
        <text x="50" y="57" textAnchor="middle" fontSize="8" fill="#aaa">no signal</text>
      )}
    </svg>
  )
}
