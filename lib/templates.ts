export interface Template {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  vibe: string;
}

export const templates: Template[] = [
  {
    id: "classic-green",
    name: "Classic Green",
    primary: "#1A3D2B",
    secondary: "#C9A84C",
    bg: "#F8F5EE",
    text: "#1A3D2B",
    vibe: "Traditional, premium, Augusta-inspired",
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    primary: "#0D0D0D",
    secondary: "#52B788",
    bg: "#1A1A1A",
    text: "#FFFFFF",
    vibe: "Modern, sleek, night golf vibes",
  },
  {
    id: "desert-sand",
    name: "Desert Sand",
    primary: "#8B6914",
    secondary: "#E8D5A0",
    bg: "#FAF5E4",
    text: "#5C4308",
    vibe: "Warm, SoCal country club feel",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary: "#1A3D5C",
    secondary: "#52B8C4",
    bg: "#EFF8FA",
    text: "#1A3D5C",
    vibe: "Coastal, fresh, beach golf aesthetic",
  },
];

export function getTemplate(id: string): Template {
  return templates.find((t) => t.id === id) ?? templates[0];
}
