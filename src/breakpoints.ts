export type Breakpoint = {
  name: string;
  width: number;
};

export const breakpoints: Breakpoint[] = [
  { name: "3xl", width: 1768 }, // 110.5rem
  { name: "2xl", width: 1440 }, // 90rem
  { name: "xl", width: 1280 },  // 80rem
  { name: "lg", width: 1024 },  // 64rem
  { name: "md", width: 768 },   // 48rem
  { name: "sm", width: 640 },   // 40rem
  { name: "xs", width: 480 },   // 30rem
  { name: "2xs", width: 375 }   // 23.4375rem
];
