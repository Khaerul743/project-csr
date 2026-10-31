"use client";

import React, { useEffect, useRef, useState } from "react";

export type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "fade";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  threshold?: number; // 0 to 1
  once?: boolean;
  className?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 850,
  threshold = 0.06,
  once = true,
  className = "",
  as: Component = "div",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        // Start animating slightly before it reaches the viewport line for a natural mid-scroll experience
        rootMargin: "0px 0px -25px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  // Gentle 3D GPU-accelerated displacement transforms
  const getTransformStyles = (visible: boolean): string => {
    if (visible) {
      return "translate3d(0, 0, 0) scale(1)";
    }

    switch (animation) {
      case "fade-up":
        return "translate3d(0, 22px, 0) scale(1)";
      case "fade-down":
        return "translate3d(0, -22px, 0) scale(1)";
      case "fade-left":
        return "translate3d(22px, 0, 0) scale(1)";
      case "fade-right":
        return "translate3d(-22px, 0, 0) scale(1)";
      case "zoom-in":
        return "translate3d(0, 16px, 0) scale(0.97)";
      case "fade":
      default:
        return "translate3d(0, 0, 0) scale(1)";
    }
  };

  // Ultra-smooth dual-curve transition:
  // Opacity fades in over 70% of duration, while transform gracefully glides into place with a subtle deceleration tail
  const opacityDuration = Math.round(duration * 0.72);
  const transformDuration = duration;

  const currentStyles: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: getTransformStyles(isVisible),
    transition: `opacity ${opacityDuration}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms, transform ${transformDuration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: isVisible ? "auto" : "opacity, transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return (
    <Component
      ref={elementRef}
      style={currentStyles}
      className={`transform-gpu ${className}`}
    >
      {children}
    </Component>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number; // ms between each child
  baseDelay?: number;
  animation?: AnimationType;
  duration?: number;
  className?: string;
  as?: React.ElementType;
}

export function StaggerContainer({
  children,
  staggerDelay = 80,
  baseDelay = 0,
  animation = "fade-up",
  duration = 850,
  className = "",
  as: Component = "div",
}: StaggerContainerProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <Component className={className}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <ScrollReveal
            key={index}
            animation={animation}
            delay={baseDelay + index * staggerDelay}
            duration={duration}
          >
            {child}
          </ScrollReveal>
        );
      })}
    </Component>
  );
}
