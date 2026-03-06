/** Lightweight confetti burst — no dependencies */
export function fireConfetti() {
  const COUNT = 80
  const COLORS = ["#16A34A", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"]
  const container = document.createElement("div")
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
    overflow: "hidden",
  })
  document.body.appendChild(container)

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("div")
    const size = 6 + Math.random() * 6
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const x = 40 + Math.random() * 20 // start near center (40-60% of screen)
    const drift = (Math.random() - 0.5) * 200
    const duration = 800 + Math.random() * 1200
    const delay = Math.random() * 200
    const rotation = Math.random() * 720 - 360

    Object.assign(el.style, {
      position: "absolute",
      left: `${x}%`,
      top: "50%",
      width: `${size}px`,
      height: `${size * (Math.random() > 0.5 ? 1 : 0.6)}px`,
      backgroundColor: color,
      borderRadius: Math.random() > 0.5 ? "50%" : "1px",
      opacity: "1",
      transform: "translateY(0) rotate(0deg)",
      animation: `cs-confetti ${duration}ms ${delay}ms ease-out forwards`,
      ["--drift" as string]: `${drift}px`,
      ["--rotation" as string]: `${rotation}deg`,
    })
    container.appendChild(el)
  }

  // Inject keyframes if not already present
  if (!document.getElementById("cs-confetti-style")) {
    const style = document.createElement("style")
    style.id = "cs-confetti-style"
    style.textContent = `
      @keyframes cs-confetti {
        0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(-400px) translateX(var(--drift)) rotate(var(--rotation)) scale(0.3); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  setTimeout(() => container.remove(), 2500)
}
