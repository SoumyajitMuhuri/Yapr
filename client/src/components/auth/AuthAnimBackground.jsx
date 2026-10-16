import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Draws and animates a crowd using a sprite sheet.
 * `rows` is the number of sprite columns; `cols` is the number of sprite rows.
 */
export function CrowdCanvas({
  src,
  rows = 15,
  cols = 7,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !src || rows < 1 || cols < 1) return;

    const image = new Image();
    const stage = { width: 0, height: 0 };
    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];
    let isDisposed = false;
    let resizeObserver;

    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => Math.floor(Math.random() * array.length);

    const resetPeep = (peep) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = 100 - 250 * gsap.parseEase("power2.in")(Math.random());
      const startY = stage.height - peep.height + offsetY;
      const startX = direction === 1 ? -peep.width : stage.width + peep.width;
      const endX = direction === 1 ? stage.width : 0;

      peep.scaleX = direction;
      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return { startX, startY, endX };
    };

    const createWalk = (peep, { startY, endX }) => {
      const xDuration = 10;
      const yDuration = 0.25;
      const timeline = gsap.timeline();

      timeline.timeScale(randomRange(0.5, 1.5));
      timeline.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0);
      timeline.to(
        peep,
        {
          duration: yDuration,
          repeat: xDuration / yDuration,
          yoyo: true,
          y: startY - 10,
        },
        0,
      );

      return timeline;
    };

    const createPeep = (rect) => {
      const peep = {
        image,
        rect,
        width: rect[2],
        height: rect[3],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        render(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.scale(this.scaleX, 1);
          ctx.drawImage(
            this.image,
            this.rect[0],
            this.rect[1],
            this.rect[2],
            this.rect[3],
            0,
            0,
            this.width,
            this.height,
          );
          ctx.restore();
        },
      };

      return peep;
    };

    const removePeepFromCrowd = (peep) => {
      const index = crowd.indexOf(peep);
      if (index !== -1) crowd.splice(index, 1);
      availablePeeps.push(peep);
    };

    const addPeepToCrowd = () => {
      if (isDisposed || availablePeeps.length === 0) return null;

      const peep = availablePeeps.splice(randomIndex(availablePeeps), 1)[0];
      const walk = createWalk(peep, resetPeep(peep));
      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      walk.eventCallback("onComplete", () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      return peep;
    };

    const populateCrowd = () => {
      while (availablePeeps.length > 0) {
        const peep = addPeepToCrowd();
        peep?.walk.progress(Math.random());
      }
    };

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.scale(canvas.width / Math.max(stage.width, 1), canvas.height / Math.max(stage.height, 1));
      crowd.forEach((peep) => peep.render(context));
      context.restore();
    };

    const resize = () => {
      if (isDisposed) return;

      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      stage.width = rect.width;
      stage.height = rect.height;
      canvas.width = Math.round(stage.width * pixelRatio);
      canvas.height = Math.round(stage.height * pixelRatio);

      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);
      populateCrowd();
      render();
    };

    const initialize = () => {
      if (isDisposed || !image.naturalWidth || !image.naturalHeight) return;

      const spriteWidth = image.naturalWidth / rows;
      const spriteHeight = image.naturalHeight / cols;

      for (let index = 0; index < rows * cols; index += 1) {
        allPeeps.push(
          createPeep([
            (index % rows) * spriteWidth,
            Math.floor(index / rows) * spriteHeight,
            spriteWidth,
            spriteHeight,
          ]),
        );
      }

      resize();
      gsap.ticker.add(render);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
      } else {
        window.addEventListener("resize", resize);
      }
    };

    image.onload = initialize;
    image.onerror = () => {
      console.error(`Could not load the crowd sprite sheet: ${src}`);
    };
    image.src = src;

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
      image.onload = null;
      image.onerror = null;
    };
  }, [src, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute bottom-0 block h-[90vh] w-full ${className}`}
    />
  );
}

export default CrowdCanvas;

/*
 * Crowd animation concept: Skiper 39 Canvas_Landing_004, inspired by
 * https://codepen.io/zadvorsky/pen/xxwbBQV
 * Illustration: https://www.openpeeps.com/
 * Attribution to Skiper UI is required when using the free version.
 * https://gxuri.me | https://x.com/Gur__vi
 */
