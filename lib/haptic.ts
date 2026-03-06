/** Trigger haptic feedback if supported */
export function haptic(style: "light" | "medium" | "heavy" = "light") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return
  const ms = style === "heavy" ? 30 : style === "medium" ? 15 : 8
  navigator.vibrate(ms)
}
