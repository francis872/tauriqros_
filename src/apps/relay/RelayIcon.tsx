interface RelayIconProps {
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
}

/**
 * RELAY — Custom dock/app icon.
 * Design: A hexagonal frame enclosing a central hub (filled) connected
 * to three equidistant relay-node dots (top, bottom-right, bottom-left).
 * Represents the RELAY AI Workforce OS: one orchestrator relaying to many agents.
 */
export default function RelayIcon({ size = 16, className, color }: RelayIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Relay"
    >
      {/* Outer hexagon frame — very subtle, gives the "network cell" feel */}
      <path
        d="M8 1 L13.5 4.25 L13.5 11.75 L8 15 L2.5 11.75 L2.5 4.25 Z"
        stroke={color ?? 'currentColor'}
        strokeWidth="0.9"
        fill="none"
        strokeOpacity="0.35"
        strokeLinejoin="round"
      />

      {/* Center orchestrator hub */}
      <circle cx="8" cy="8" r="2.2" fill={color ?? 'currentColor'} />

      {/* 3 relay agent nodes — top, bottom-right, bottom-left */}
      <circle cx="8"    cy="2.2"  r="1.4" fill={color ?? 'currentColor'} />
      <circle cx="13"   cy="10.8" r="1.4" fill={color ?? 'currentColor'} />
      <circle cx="3"    cy="10.8" r="1.4" fill={color ?? 'currentColor'} />

      {/*
        Connection lines — from hub edge to each node edge.
        Top:          center(8,8) → node(8, 2.2) — vertical
        Bottom-right: center(8,8) → node(13, 10.8) — angled ~30° below right
        Bottom-left:  center(8,8) → node(3, 10.8) — angled ~30° below left
      */}

      {/* Hub → Top node */}
      <line
        x1="8"   y1="5.8"
        x2="8"   y2="3.6"
        stroke={color ?? 'currentColor'}
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Hub → Bottom-right node */}
      <line
        x1="9.7"  y1="9.5"
        x2="11.8" y2="10.1"
        stroke={color ?? 'currentColor'}
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Hub → Bottom-left node */}
      <line
        x1="6.3"  y1="9.5"
        x2="4.2"  y2="10.1"
        stroke={color ?? 'currentColor'}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}
