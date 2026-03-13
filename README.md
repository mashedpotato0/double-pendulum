# Double Pendulum Simulation

An interactive double pendulum simulator running in the browser. Uses the HTML5 Canvas API and JavaScript to numerically integrate the equations of motion and visualize the system's chaotic behavior.

## Features

- **Chaotic simulation** — Up to 256 pendulums simulated simultaneously, each with a slightly different initial angle, demonstrating sensitivity to initial conditions.
- **Real-time controls** — Adjust all physical parameters on the fly using sliders:
  - Rod lengths (L1, L2)
  - Bob masses (m1, m2)
  - Gravity (g)
  - Air resistance / damping
  - Initial angle
  - Number of concurrent pendulums (1–256)
  - Trail / path length
- **Visual toggles** — Show/hide the connecting rods and the bobs independently.
- **Pause / Resume / Reset** controls.
- Responsive design with mobile support.

## How to Run

Simply open `index.html` in any modern web browser. No server or build step required.

```
double-pendulum/
├── index.html         # UI, layout, sliders
└── doublePendulum.js  # Physics engine and canvas rendering
```

## Physics

The simulation solves the **Lagrangian equations of motion** for a double pendulum using a 4th-order Runge-Kutta (RK4) numerical integrator. The state variables are the two angles (θ₁, θ₂) and their angular velocities (ω₁, ω₂).
