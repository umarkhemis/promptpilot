import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export const animationClasses = {
  fadeIn: "animate-on-scroll",
  slideUp: "animate-on-scroll",
  slideInLeft: "animate-on-scroll-left",
  slideInRight: "animate-on-scroll-right",
} as const;

export const staggerDelays = [
  "",
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
] as const;

export function getStaggerClass(index: number) {
  return staggerDelays[Math.min(index, staggerDelays.length - 1)];
}
