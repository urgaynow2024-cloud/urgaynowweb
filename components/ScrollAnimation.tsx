"use client";

import { useEffect, useRef } from "react";

export function useScrollAnimation(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      node.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options.threshold ?? 0.05,
        rootMargin: options.rootMargin ?? "0px 0px -50px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

export function ScrollFadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const ref = useScrollAnimation();
  const directionMap = {
    up: "translate-y-5",
    down: "-translate-y-5",
    left: "translate-x-5",
    right: "-translate-x-5",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${direction === "none" ? "" : directionMap[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function StaggeredList({
  children,
  className = "",
  stagger = 100,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const items = (
    Array.isArray(children) ? children : [children]
  ).filter(Boolean);

  return (
    <div className={className}>
      {items.map((item, i) => (
        <ScrollFadeIn
          key={i}
          delay={i * stagger}
          className="stagger"
        >
          {item}
        </ScrollFadeIn>
      ))}
    </div>
  );
}
