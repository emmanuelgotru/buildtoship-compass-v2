import { useEffect, useState } from 'react';

export default function Confetti({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ['#22D3EE', '#818CF8', '#A78BFA', '#F472B6', '#34D399'][Math.floor(Math.random() * 5)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);
      const t = setTimeout(() => setParticles([]), 4000);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!active && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-0 w-2 h-2 rounded-sm"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20vh) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
