/**
 * Floating particles component for immersive login background.
 * Renders gradient orbs, animated particles, and a grid pattern overlay.
 */
export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-br from-[#33ffcc]/20 via-[#33ffcc]/5 to-transparent rounded-full blur-3xl animate-float-slow" />
      <div className="absolute w-[500px] h-[500px] -bottom-32 -right-32 bg-gradient-to-tl from-[#66cccc]/20 via-[#66cccc]/5 to-transparent rounded-full blur-3xl animate-float-slower" />
      <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#fe1979]/10 to-[#33ffcc]/10 rounded-full blur-3xl animate-pulse-slow" />

      {/* Floating game elements */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full bg-gradient-to-br from-[#33ffcc]/60 to-[#33ffcc]/20"
            style={{
              boxShadow: '0 0 20px rgba(51, 255, 204, 0.4)',
            }}
          />
        </div>
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(51, 255, 204, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(51, 255, 204, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
