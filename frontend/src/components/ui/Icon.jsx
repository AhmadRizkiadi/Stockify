const iconPaths = {
  dashboard: [
    "M3 3h7v7H3z",
    "M14 3h7v7h-7z",
    "M3 14h7v7H3z",
    "M14 14h7v7h-7z",
  ],
  package: [
    "m7.5 4.27 9 5.15",
    "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
    "m3.3 7 8.7 5 8.7-5",
    "M12 22V12",
  ],
  tag: [
    "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
    "M7 7h.01",
  ],
  arrowDown: ["M12 3v14", "M5 12l7 7 7-7", "M5 21h14"],
  arrowUp: ["M12 21V7", "M5 12l7-7 7 7", "M5 3h14"],
  history: [
    "M3 12a9 9 0 1 0 3-6.7L3 8",
    "M3 3v5h5",
    "M12 7v5l3 2",
  ],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  logout: ["M10 17l5-5-5-5", "M15 12H3", "M21 19V5a2 2 0 0 0-2-2h-6"],
  refresh: [
    "M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5",
    "M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5",
  ],
  search: [
    "m21 21-4.35-4.35",
    "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16",
  ],
};

export function Icon({ name, size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {(iconPaths[name] || []).map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
