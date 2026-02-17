/**
 * CSS keyframe animations used by the login page components.
 * Rendered as an inline <style> tag.
 */
export function LoginAnimations() {
  return (
    <style>{`
      @keyframes float-slow {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(5deg); }
        66% { transform: translate(-20px, 20px) rotate(-5deg); }
      }

      @keyframes float-slower {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(-40px, 20px) rotate(-3deg); }
        66% { transform: translate(30px, -40px) rotate(3deg); }
      }

      @keyframes float-particle {
        0%, 100% {
          transform: translateY(0) translateX(0) scale(1);
          opacity: 0.6;
        }
        25% {
          transform: translateY(-20px) translateX(10px) scale(1.2);
          opacity: 0.8;
        }
        50% {
          transform: translateY(-40px) translateX(-5px) scale(1);
          opacity: 0.4;
        }
        75% {
          transform: translateY(-20px) translateX(-10px) scale(0.8);
          opacity: 0.7;
        }
      }

      @keyframes pulse-slow {
        0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); }
      }

      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
      .animate-float-slower { animation: float-slower 25s ease-in-out infinite; }
      .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }
      .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      .animate-gradient-shift { animation: gradient-shift 3s ease infinite; }
    `}</style>
  );
}
