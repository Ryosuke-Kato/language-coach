// Runtime shim for local development — Turbopack resolves .js imports to this file.
// Edit cursor/identity.dev.ts to change the simulated viewer; this file mirrors it.
// Never write a real person's identity here.

export const DEV_VIEWER = {
  sub: "user:dev",
  email: "dev@example.com",
  name: "Dev Viewer",
  teamId: 1,
  teamRole: "admin",
};
