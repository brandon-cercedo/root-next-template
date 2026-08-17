"use client";

import clsx from "clsx";
import { Fragment } from "react";

import { mergeClsx } from "@/lib/utils/styles";

import CarouselNextButton from "./buttons/CarouselNextButton";
import CarouselPrevButton from "./buttons/CarouselPrevButton";
import { CarouselLoading } from "./loading";

type CarouselSlidesQuantity =
  | {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
    }
  | number;

interface CarouselOptions {
  currentIndex?: number;
  loadingClasses?: string;
  dotsItemClasses?: string;
  isAutoHeight?: boolean;
  isAutoPlay?: boolean;
  speed?: number;
  updateDelay?: number;
  isInfiniteLoop?: boolean;
  isCentered?: boolean;
  isSnap?: boolean;
  isDraggable?: boolean;
  isRTL?: boolean;
  hasSnapSpacers?: boolean;
  slidesQty?: CarouselSlidesQuantity;
}

interface CarouselProps {
  id?: string;
  slides: React.ReactNode[];
  options?: CarouselOptions;
  containerClassName?: string;
  className?: string;
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
}

/**
 * @notes Pagination is not working as expected when using `isSnap` and `hasSnapSpacers` together. It is a Preline bug.
 */
export default function Carousel({
  id,
  slides,
  options = {},
  containerClassName,
  className,
  prevButton = <CarouselPrevButton />,
  nextButton = <CarouselNextButton />,
}: CarouselProps) {
  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      id={id}
      className={mergeClsx("group relative", containerClassName)}
      data-hs-carousel={options ? JSON.stringify(options) : undefined}
      {...(options?.isRTL && { dir: "rtl" })}
    >
      <div className="absolute inset-0 hidden items-center justify-center group-has-[.hs-carousel-body.opacity-0]:flex">
        <CarouselLoading />
      </div>
      <div
        className={mergeClsx(
          "hs-carousel w-full group-has-[.hs-carousel-body.opacity-0]:pointer-events-none",
          {
            "min-h-64": !options?.isAutoHeight,
            "relative overflow-hidden": !options?.isSnap,
            "flex snap-x snap-mandatory overflow-x-auto": options?.isSnap,
          },
          className
        )}
      >
        <div
          className={clsx(
            "hs-carousel-body flex flex-nowrap gap-3 opacity-0 duration-700",
            {
              "cursor-grab hs-carousel-dragging:cursor-grabbing hs-carousel-dragging:transition-none":
                options?.isDraggable,
              "absolute start-0 top-0 bottom-0 transition-transform":
                !options?.isAutoHeight && !options?.isSnap,
              "overflow-hidden transition-[height,transform]":
                options?.isAutoHeight,
            }
          )}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={clsx("hs-carousel-slide", {
                "h-fit": options?.isAutoHeight,
                "snap-center": options?.isSnap,
              })}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {prevButton && nextButton && (
        <div className="group-has-[.hs-carousel-body.opacity-0]:hidden">
          <Fragment>
            {prevButton}
            {nextButton}
          </Fragment>
        </div>
      )}

      {options?.dotsItemClasses && (
        <div className="hs-carousel-pagination absolute start-0 end-0 bottom-3 flex justify-center gap-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-has-[.hs-carousel-body.opacity-0]:hidden" />
      )}
    </div>
  );
}
