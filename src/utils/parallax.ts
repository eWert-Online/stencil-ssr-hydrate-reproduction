import ResizeObserver from "resize-observer-polyfill";

type options = {
  speed: number;
  wrapper: HTMLElement;
  round: boolean;
};

type cache = {
  y: number;
  top: number;
  height: number;
  speed: number;
  style?: string;
  transform?: string;
  zindex: number;
  min?: number;
  max?: number;
};

const defaultOptions: options = {
  speed: -2,
  wrapper: null,
  round: true,
};

export default class Parallax {
  private posY = 0;
  private screenY = 0;
  private cache: cache;
  private el;
  private observer: ResizeObserver;
  private pause = true;

  private rafId = null;

  private options: options;

  constructor(el: Element, options: options) {
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.el = el;
    this.observer = new ResizeObserver(this.refresh);
    this.observer.observe(this.el);

    this.init();
  }

  private clearLoop = window.cancelAnimationFrame;

  private init = () => {
    if (this.cache) {
      this.el.style.cssText = this.cache.style;
    }

    this.screenY = window.innerHeight;

    this.setPosition();
    this.cacheBlock();
    this.animate();

    if (this.pause) {
      window.addEventListener("resize", this.init);
      this.pause = false;
      this.update();
    }
  };

  private cacheBlock = () => {
    const dataPercentage = this.el.getAttribute("data-parallax-percentage");
    const dataSpeed = this.el.getAttribute("data-parallax-speed");
    const dataZindex = parseInt(this.el.getAttribute("data-parallax-zindex")) || 0;
    const dataMin = this.el.getAttribute("data-parallax-min");
    const dataMax = this.el.getAttribute("data-parallax-max");

    this.setPosition();

    const cacheTop = this.posY + this.el.getBoundingClientRect().top;
    const cacheHeight = this.el.clientHeight || this.el.offsetHeight || this.el.scrollHeight;

    let percentageY = dataPercentage ? dataPercentage : 0.5;

    const speed = dataSpeed ? parseInt(dataSpeed) : this.options.speed;
    const bases = this.updatePosition(percentageY, speed);

    const style = this.el.style.cssText;
    let transform = "";

    const searchResult = /transform\s*:/i.exec(style);
    if (searchResult) {
      const index = searchResult.index;
      const trimmedStyle = style.slice(index);
      const delimiter = trimmedStyle.indexOf(";");
      if (delimiter) {
        transform = " " + trimmedStyle.slice(11, delimiter).replace(/\s/g, "");
      } else {
        transform = " " + trimmedStyle.slice(11).replace(/\s/g, "");
      }
    }

    this.cache = {
      y: bases,
      top: cacheTop,
      height: cacheHeight,
      speed: speed,
      style: style,
      transform: transform,
      zindex: dataZindex,
      min: parseInt(dataMin) ?? null,
      max: parseInt(dataMax) ?? null,
    };
  };

  private setPosition = () => {
    const oldY = this.posY;
    const rootEl = (document.documentElement || document.body.parentNode || document.body) as HTMLBodyElement;

    if (this.options.wrapper) {
      var scrollPosY = (rootEl.scrollTop || window.pageYOffset) - this.screenY / 2;
      this.posY = scrollPosY - this.options.wrapper.offsetTop;
    } else {
      this.posY = (rootEl.scrollTop || window.pageYOffset) - this.screenY / 2;
    }

    if (oldY != this.posY) {
      return true;
    }

    return false;
  };

  private updatePosition = (percentageY, speed) => {
    const valueY = speed * (100 * (1 - percentageY));
    return this.options.round ? Math.round(valueY) : Math.round(valueY * 100) / 100;
  };

  private deferredUpdate = () => {
    window.removeEventListener("resize", this.deferredUpdate);
    window.removeEventListener("orientationchange", this.deferredUpdate);
    window.removeEventListener("scroll", this.deferredUpdate);
    document.removeEventListener("touchmove", this.deferredUpdate);

    // loop again
    this.rafId = requestAnimationFrame(this.update);
  };

  private update = () => {
    if (this.setPosition() && this.pause === false) {
      this.animate();

      // loop again
      this.rafId = requestAnimationFrame(this.update);
    } else {
      this.rafId = null;

      // Don't animate until we get a position updating event
      window.addEventListener("resize", this.deferredUpdate);
      window.addEventListener("orientationchange", this.deferredUpdate);
      window.addEventListener("scroll", this.deferredUpdate, { passive: true });
      document.addEventListener("touchmove", this.deferredUpdate, { passive: true });
    }
  };

  private animate = () => {
    var percentageY = (this.posY - this.cache.top + this.screenY / 1.5) / this.cache.height;
    var positionY = this.updatePosition(percentageY, this.cache.speed);

    if (this.cache.min !== null) {
      positionY = positionY <= this.cache.min ? this.cache.min : positionY;
    }

    if (this.cache.max !== null) {
      positionY = positionY >= this.cache.max ? this.cache.max : positionY;
    }

    var zindex = this.cache.zindex;

    const transform = `translate3d(0, ${positionY}px, ${zindex}px)`;
    this.el.style["transform"] = transform;
  };

  public destroy = () => {
    this.el.style.cssText = this.cache.style;
    this.observer.unobserve(this.el);

    if (!this.pause) {
      window.removeEventListener("resize", this.init);
      this.pause = true;
    }

    this.clearLoop(this.rafId);
    this.rafId = null;
  };

  public refresh = this.init;
}
