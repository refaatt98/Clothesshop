import { motion } from "motion/react";
import { useShop, type Flight } from "../lib/store";

/** كبة صغيرة بتطير من زر الإضافة لأيقونة السلة */
function Flyer({ flight }: { flight: Flight }) {
  const { cartIconRef, landFlight } = useShop();
  const to = cartIconRef.current?.getBoundingClientRect();
  const sx = flight.from.left + flight.from.width / 2 - 14;
  const sy = flight.from.top + flight.from.height / 2 - 14;
  const ex = to ? to.left + to.width / 2 - 14 : sx;
  const ey = to ? to.top + to.height / 2 - 14 : sy - 200;
  const midX = (sx + ex) / 2;
  const midY = Math.min(sy, ey) - 120;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[70] size-7"
      initial={{ x: sx, y: sy, scale: 0.4, opacity: 0 }}
      animate={{ x: [sx, midX, ex], y: [sy, midY, ey], scale: [0.6, 1.3, 0.5], opacity: [1, 1, 0.9], rotate: [0, 260, 540] }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      onAnimationComplete={() => landFlight(flight.id)}
    >
      <svg viewBox="0 0 30 30" className="size-full drop-shadow" aria-hidden>
        <circle cx="15" cy="15" r="13" fill={flight.color} stroke="#4a2a18" strokeOpacity=".3" />
        <g fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5">
          <path d="M5 11 C12 8 20 9 27 15" />
          <path d="M4 18 C12 14 20 16 26 21" />
          <path d="M12 3 C8 11 9 20 14 27" />
        </g>
      </svg>
    </motion.div>
  );
}

export function FlyLayer() {
  const { flights } = useShop();
  return (
    <>
      {flights.map((f) => (
        <Flyer key={f.id} flight={f} />
      ))}
    </>
  );
}
