import confetti from "canvas-confetti";

export function confettiSchoolPride() {
  void confetti({
    particleCount: 250,
    spread: 80,
    startVelocity: 90,
    angle: 45,
    gravity: 1.5,
    scalar: 1.2,
    origin: { y: 1, x: 0 },
    shapes: ["square", "square", "circle"],
  });
  void confetti({
    particleCount: 250,
    spread: 80,
    startVelocity: 90,
    angle: 135,
    gravity: 1.5,
    scalar: 1.2,
    origin: { y: 1, x: 1 },
    shapes: ["square", "square", "circle"],
  });
}
