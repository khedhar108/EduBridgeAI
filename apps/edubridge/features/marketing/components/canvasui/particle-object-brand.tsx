"use client";

import { cn } from "@repo/ui/lib/utils";
import {
  ParticleObject,
  type ParticleObjectOptions,
} from "@repo/ui/components/canvasui/ParticleObject";
import { DEFAULT_BRAND_MARK } from "./brand-mark";

export type ParticleObjectBrandProps = ParticleObjectOptions & {
  className?: string;
};

/**
 * Single reusable outer layer for particle-object brand marks.
 * Swap the design by changing `src` or `DEFAULT_BRAND_MARK` (defaults to /brand/logo-mark.svg).
 */
export function ParticleObjectBrand({
  className,
  src = DEFAULT_BRAND_MARK,
  count = 16000,
  size = 2,
  color = "",
  orbit = false,
  zoom = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  drift = 1.15,
  floatIntensity = 1.4,
  rotationIntensity = 0.55,
  floatSpeed = 1.2,
  spring = 0.85,
  damping = 0.42,
  background = "",
  scale = 2.8,
  cameraDistance = 4.2,
  ...options
}: ParticleObjectBrandProps) {
  return (
    <ParticleObject
      className={cn("h-full w-full", className)}
      src={src}
      count={count}
      size={size}
      color={color}
      orbit={orbit}
      zoom={zoom}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      drift={drift}
      floatIntensity={floatIntensity}
      rotationIntensity={rotationIntensity}
      floatSpeed={floatSpeed}
      spring={spring}
      damping={damping}
      background={background}
      scale={scale}
      cameraDistance={cameraDistance}
      {...options}
    />
  );
}
