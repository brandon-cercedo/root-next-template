import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Carousel from "../Carousel";

afterEach(() => {
  cleanup();
});

describe("Carousel", () => {
  const mockSlides = [
    <div key="1">Slide 1</div>,
    <div key="2">Slide 2</div>,
    <div key="3">Slide 3</div>,
  ];

  it("should render slides", () => {
    render(<Carousel slides={mockSlides} />);

    expect(screen.getByText("Slide 1")).toBeDefined();
    expect(screen.getByText("Slide 2")).toBeDefined();
    expect(screen.getByText("Slide 3")).toBeDefined();
  });

  it("should handle empty slides array", () => {
    const { container } = render(<Carousel slides={[]} />);

    const body = container.querySelector(".hs-carousel-body") as HTMLElement;
    expect(body).toBeNull();
  });

  it("should apply `containerClassName` to container element", () => {
    const { container } = render(
      <Carousel slides={mockSlides} containerClassName="custom-container" />
    );

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("custom-container");
    expect(root.className).toContain("relative");
  });

  it("should apply `className` to carousel element", () => {
    const { container } = render(
      <Carousel slides={mockSlides} className="custom-carousel" />
    );

    const carousel = container.querySelector(".hs-carousel") as HTMLElement;
    expect(carousel.className).toContain("custom-carousel");
  });

  it("should apply custom `id`", () => {
    const { container } = render(
      <Carousel id="custom-id" slides={mockSlides} />
    );

    const root = container.firstChild as HTMLElement;
    expect(root.id).toBe("custom-id");
  });

  it("should apply RTL direction when `isRTL` is true", () => {
    const { container } = render(
      <Carousel slides={mockSlides} options={{ isRTL: true }} />
    );

    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("dir")).toBe("rtl");
  });

  it("should set `data-hs-carousel` attribute with options", () => {
    const options = {
      isCentered: true,
      isSnap: true,
      slidesQty: 3,
    };

    const { container } = render(
      <Carousel slides={mockSlides} options={options} />
    );

    const root = container.firstChild as HTMLElement;
    const dataAttr = root.getAttribute("data-hs-carousel");
    expect(dataAttr).toBe(JSON.stringify(options));
  });

  it("should set `data-hs-carousel` attribute to empty object when options is `undefined`", () => {
    const { container } = render(
      <Carousel slides={mockSlides} options={undefined} />
    );

    const root = container.firstChild as HTMLElement;
    const dataAttr = root.getAttribute("data-hs-carousel");
    expect(dataAttr).toBe("{}");
  });

  it("should apply base classes to carousel", () => {
    const { container } = render(<Carousel slides={mockSlides} />);

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("relative");

    const carousel = container.querySelector(".hs-carousel") as HTMLElement;
    expect(carousel.className).toContain("w-full");
    expect(carousel.className).toContain("min-h-64");
    expect(carousel.className).toContain("relative");
    expect(carousel.className).toContain("overflow-hidden");
    expect(carousel.className).not.toContain("flex");
    expect(carousel.className).not.toContain("snap-x");
    expect(carousel.className).not.toContain("snap-mandatory");
    expect(carousel.className).not.toContain("overflow-x-auto");

    const body = container.querySelector(".hs-carousel-body") as HTMLElement;
    expect(body.className).toContain("flex");
    expect(body.className).toContain("flex-nowrap");
    expect(body.className).toContain("gap-3");
    expect(body.className).toContain("opacity-0");
    expect(body.className).toContain("duration-700");
    expect(body.className).toContain("absolute");
    expect(body.className).toContain("start-0");
    expect(body.className).toContain("top-0");
    expect(body.className).toContain("bottom-0");
    expect(body.className).toContain("transition-transform");
    expect(body.className).not.toContain(
      "hs-carousel-dragging:transition-none"
    );
    expect(body.className).not.toContain(
      "hs-carousel-dragging:cursor-grabbing"
    );
    expect(body.className).not.toContain("cursor-grab");
    expect(body.className).not.toContain("overflow-hidden");
    expect(body.className).not.toContain("transition-[height,transform]");

    const slides = container.querySelectorAll(".hs-carousel-slide");
    slides.forEach((slide) => {
      expect(slide.className).not.toContain("h-fit");
      expect(slide.className).not.toContain("snap-center");
    });
  });

  it("should apply classes when `isAutoHeight` is true", () => {
    const { container } = render(
      <Carousel slides={mockSlides} options={{ isAutoHeight: true }} />
    );

    const carousel = container.querySelector(".hs-carousel") as HTMLElement;
    expect(carousel.className).not.toContain("min-h-64");

    const body = container.querySelector(".hs-carousel-body") as HTMLElement;
    expect(body.className).toContain("overflow-hidden");
    expect(body.className).toContain("transition-[height,transform]");

    const slides = container.querySelectorAll(".hs-carousel-slide");
    slides.forEach((slide) => {
      expect(slide.className).toContain("h-fit");
    });
  });

  it("should apply snap classes when `isSnap` is true", () => {
    const { container } = render(
      <Carousel slides={mockSlides} options={{ isSnap: true }} />
    );

    const carousel = container.querySelector(".hs-carousel") as HTMLElement;
    expect(carousel.className).toContain("flex");
    expect(carousel.className).toContain("snap-x");
    expect(carousel.className).toContain("snap-mandatory");
    expect(carousel.className).toContain("overflow-x-auto");
    expect(carousel.className).not.toContain("relative");
    expect(carousel.className).not.toContain("overflow-hidden");

    const slides = container.querySelectorAll(".hs-carousel-slide");
    slides.forEach((slide) => {
      expect(slide.className).toContain("snap-center");
    });
  });

  it("should apply draggable classes when `isDraggable` is true", () => {
    const { container } = render(
      <Carousel slides={mockSlides} options={{ isDraggable: true }} />
    );

    const body = container.querySelector(".hs-carousel-body") as HTMLElement;
    expect(body.className).toContain("hs-carousel-dragging:transition-none");
    expect(body.className).toContain("hs-carousel-dragging:cursor-grabbing");
    expect(body.className).toContain("cursor-grab");
  });

  it("should render default buttons", () => {
    render(<Carousel slides={mockSlides} />);

    expect(screen.getByText("Previous")).toBeDefined();
    expect(screen.getByText("Next")).toBeDefined();
  });

  it("should not render buttons if at least one of them is not provided", () => {
    render(<Carousel slides={mockSlides} prevButton={null} />);

    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.queryByText("Next")).toBeNull();
  });

  it("should render pagination when `dotsItemClasses` is provided", () => {
    const { container } = render(
      <Carousel
        slides={mockSlides}
        options={{
          dotsItemClasses:
            "hs-carousel-active:bg-blue-700 hs-carousel-active:border-blue-700 size-3 border border-gray-400 rounded-full cursor-pointer dark:border-neutral-600 dark:hs-carousel-active:bg-blue-500 dark:hs-carousel-active:border-blue-500",
          slidesQty: 2,
        }}
      />
    );

    const pagination = container.querySelector(
      ".hs-carousel-pagination"
    ) as HTMLElement;
    expect(pagination).toBeDefined();
    expect(pagination.className).toContain("absolute");
    expect(pagination.className).toContain("gap-x-2");
  });
});
