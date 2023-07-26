import { Component, h, Prop, Host, Element } from "@stencil/core";

import Swiper from "swiper";
import SwiperCore, { Navigation, Pagination, Autoplay, Lazy } from "swiper/core";

import breakpoints from "../../utils/breakpoints";
import ResizeObserver from "resize-observer-polyfill";

SwiperCore.use([Autoplay, Navigation, Pagination, Lazy]);

/**
 * @slot intro - The module intro to display above this module
 * @slot *default* - A list of <app-teaser-slider-slide> to display in this slider
 */
@Component({
  tag: "app-teaser-slider",
  styleUrl: "teaser-slider.scss",
  shadow: true,
})
export class AppTeaserSlider {
  @Element() el: HTMLAppTeaserSliderElement;

  /**
   * How fast the slides should slide automatically
   */
  @Prop() public autoplaySpeed?: "Fast" | "Medium" | "Slow" | "Off" = "Medium";

  /**
   * How fast the slides should slide automatically
   */
  @Prop() public slidesPerGroup?: "normal" | "two" | "Off" = "normal";

  /**
   * Good to enable if you use bullets pagination with a lot of slides. So it will keep only few bullets visible at the same time.
   */
  @Prop() public dynamicBullets?: boolean = false;

  private _documentResizeObserver: ResizeObserver;

  private swiper: Swiper;

  private slides: HTMLAppTeaserSliderSlideElement[];

  connectedCallback() {
    this.el.querySelectorAll("app-teaser-slider-slide").forEach((slide) => {
      slide.classList.add("swiper-slide");
    });

    if (this.slidesPerGroup === "two") {
      this.el.querySelectorAll("app-teaser-slider-slide").forEach((slide) => {
        slide.classList.add("TeaserSliderSlide--2cols");
      });
    }

    this.slides = Array.from(this.el.querySelectorAll("app-teaser-slider-slide")).map(
      (el) => el.cloneNode(true) as HTMLAppTeaserSliderSlideElement,
    );
  }

  componentDidLoad() {
    const swiperContainer = this.el.shadowRoot.querySelector(".swiper-container") as HTMLDivElement;
    let autoplayDuration = -1;
    if (this.autoplaySpeed === "Fast") {
      autoplayDuration = 2000;
    } else if (this.autoplaySpeed === "Medium") {
      autoplayDuration = 4000;
    } else if (this.autoplaySpeed === "Slow") {
      autoplayDuration = 8000;
    } else {
      autoplayDuration = -1;
    }

    let confSlidesPerGroup = 1;
    if (this.slidesPerGroup === "two") {
      confSlidesPerGroup = 2;
    }

    this._documentResizeObserver = new ResizeObserver(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    });

    this.slides.forEach((slide) => {
      this._documentResizeObserver.observe(slide);
    });

    this.swiper = new Swiper(swiperContainer, {
      preloadImages: false,
      lazy: true,
      roundLengths: true,
      slidesPerView: confSlidesPerGroup,
      slidesPerGroup: confSlidesPerGroup,
      spaceBetween: 40,
      autoplay: {
        delay: autoplayDuration,
      },
      autoHeight: true,
      pagination: {
        el: this.el.shadowRoot.querySelector(".swiper-pagination") as HTMLDivElement,
        clickable: true,
        dynamicBullets: this.dynamicBullets,
      },
      navigation: {
        prevEl: this.el.shadowRoot.querySelector(".swiper-button-prev") as HTMLDivElement,
        nextEl: this.el.shadowRoot.querySelector(".swiper-button-next") as HTMLDivElement,
      },
      breakpoints: {
        [breakpoints.small]: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 0,
        },
        [breakpoints.websiteSmall]: {
          slidesPerView: confSlidesPerGroup,
          slidesPerGroup: confSlidesPerGroup,
          spaceBetween: 20,
        },
        [breakpoints.large]: {
          slidesPerView: confSlidesPerGroup,
          slidesPerGroup: confSlidesPerGroup,
          spaceBetween: 40,
        },
      },
    });
    if (this.swiper) {
      this.swiper.removeAllSlides();
      this.swiper.appendSlide(this.slides);
      if (autoplayDuration > 0) {
        this.swiper.autoplay.start();
      } else {
        this.swiper.autoplay.stop();
      }

      this.swiper.update();
    }
    setTimeout(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    }, 800);
    /* ^^^ This magic number isn't nice, but we don't know when stencil finished loading all components in the slider. */
  }

  render() {
    return (
      <Host
        class={`
                    TeaserSlider
                    ${this.slidesPerGroup == "two" ? "TeaserSlider--2cols" : ""}
                `}
      >
        <div class='TeaserSlider-intro'>
          <slot name='intro' />
        </div>
        <div class='TeaserSlider-wrapper '>
          <button class='TeaserSlider-button TeaserSlider-button--prev swiper-button-prev'></button>
          <div class='TeaserSlider-slides swiper-container'>
            <div class='swiper-wrapper'></div>
          </div>
          <button class='TeaserSlider-button TeaserSlider-button--next swiper-button-next'></button>
        </div>
        <div class='TeaserSlider-pagination swiper-pagination'></div>

        <div style={{ display: "none" }}>
          <slot />
        </div>
      </Host>
    );
  }
}
