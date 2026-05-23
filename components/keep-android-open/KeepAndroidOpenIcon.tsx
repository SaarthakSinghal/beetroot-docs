"use client";

import { Bot, TriangleAlert } from "lucide-react";

type Props = {
  /** Nudge badge horizontally (+ moves right, - moves left). Default: 6 */
  badgeX?: number;
  /** Nudge badge vertically (+ moves down, - moves up). Default: -2 */
  badgeY?: number;
  /** Badge size in px. Default: 10 */
  badgeSize?: number;
  /** Bot icon size in px. Default: 14 */
  iconSize?: number;
};

export function KeepAndroidOpenIcon({
  badgeX = 6,
  badgeY = -12,
  badgeSize = 12,
  iconSize = 20,
}: Props) {
  return (
    <span className="relative inline-flex size-full items-center justify-center">
      <Bot style={{ width: iconSize, height: iconSize }} aria-hidden="true" />

      {/* Badge */}
      <span
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(${badgeX}px, ${badgeY}px)`,
        }}
        aria-hidden="true"
      >
        <TriangleAlert
          style={{ width: badgeSize, height: badgeSize }}
          className="text-red-500"
        />
      </span>
    </span>
  );
}
