import { Component, h, Host, Element, Prop } from "@stencil/core";

import Swiper from "swiper";
import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper/core";

import breakpoints from "../../utils/breakpoints";
import ResizeObserver from "resize-observer-polyfill";

SwiperCore.use([Autoplay, Navigation, Pagination]);

/**
 * @slot *default* - A list of <app-teaser-list-item> to display in a grid
 * @slot intro - Elements to display above the teaser-list
 */
@Component({
  tag: "app-teaser-list",
  styleUrl: "teaser-list.scss",
  shadow: true,
})
export class AppTeaserList {
  @Element() private el: HTMLAppTeaserListElement;

  /**
   * show teasers as slider
   */
  @Prop() showAsSlider: boolean = false;

  private teasers: Array<HTMLAppTeaserListItemElement> = [];

  private _documentResizeObserver: ResizeObserver;

  private swiper: Swiper;

  private slides: HTMLAppTeaserListItemElement[];

  private indicators: NodeListOf<Element>;

  private sliderMin: number = 0;

  private sliderMax: number = 5;

  connectedCallback() {
    this.teasers = Array.from(this.el.querySelectorAll("app-teaser-list-item"));

    if (this.showAsSlider) {
      this.el.querySelectorAll("app-teaser-list-item").forEach((slide) => {
        slide.classList.add("swiper-slide");
      });

      this.slides = Array.from(this.el.querySelectorAll("app-teaser-list-item")).map(
        (el) => el.cloneNode(true) as HTMLAppProductTeaserElement,
      );
    }
  }

  componentDidLoad() {
    if (this.showAsSlider) {
      const swiperContainer = this.el.shadowRoot.querySelector(".swiper-container") as HTMLDivElement;

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
        slidesPerView: 2,
        slidesPerGroup: 1,
        spaceBetween: 40,
        autoplay: {
          delay: 4000,
        },
        autoHeight: true,
        pagination: {
          el: this.el.shadowRoot.querySelector(".swiper-pagination") as HTMLDivElement,
          clickable: true,
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
            slidesPerView: 2,
            slidesPerGroup: 1,
            spaceBetween: 20,
          },
          [breakpoints.large]: {
            slidesPerView: 2,
            slidesPerGroup: 1,
            spaceBetween: 40,
          },
        },
      });

      if (this.swiper) {
        this.swiper.removeAllSlides();
        this.swiper.appendSlide(this.slides);
        this.swiper.autoplay.stop();

        this.swiper.update();
      }

      setTimeout(() => {
        if (this.swiper) {
          this.swiper.update();
        }
      }, 800);
      /* ^^^ This magic number isn't nice, but we don't know when stencil finished loading all components in the slider. */

      this.indicators = this.el.shadowRoot.querySelectorAll(".swiper-pagination-bullet");

      if (this.indicators.length > this.sliderMax) {
        this.swiper.on("realIndexChange", () => {
          this._updatedSliderIndicators();
        });

        this.swiper.on("resize", () => {
          this._updatedSliderIndicators();
        });

        this._updatedSliderIndicators();
      }
    }
  }

  private _updatedSliderIndicators() {
    this.indicators = this.el.shadowRoot.querySelectorAll(".swiper-pagination-bullet");

    if (this.sliderMin - 1 >= 0) {
      if (this.swiper.realIndex === this.sliderMin) {
        this.sliderMin = this.swiper.realIndex - 1;
        this.sliderMax = this.sliderMin + 5;
      }

      if (this.swiper.realIndex === this.sliderMin + 1) {
        this.sliderMin = this.swiper.realIndex - 2;
        this.sliderMax = this.sliderMin + 5;
      }

      if (this.sliderMax > this.indicators.length) {
        this.sliderMax = this.indicators.length - 1;
      }
    }

    if (this.sliderMax + 1 < this.indicators.length) {
      if (this.swiper.realIndex === this.sliderMax) {
        this.sliderMax = this.swiper.realIndex + 1;
        this.sliderMin = this.sliderMax - 5;
      }

      if (this.swiper.realIndex === this.sliderMax - 1) {
        this.sliderMax = this.swiper.realIndex + 2;
        this.sliderMin = this.sliderMax - 5;
      }

      if (this.sliderMin < 0) {
        this.sliderMin = 0;
      }
    }

    this.indicators.forEach((element, index) => {
      element.classList.remove("active", "micro", "small", "standard", "hidden");

      if (index === this.swiper.realIndex) {
        element.classList.add("active");
      } else if (
        (index === this.sliderMin && index - 1 >= 0) ||
        (index === this.sliderMax && index + 1 < this.indicators.length)
      ) {
        element.classList.add("micro");
      } else if (
        (index === this.sliderMin + 1 && index - 2 >= 0) ||
        (index === this.sliderMax - 1 && index + 2 < this.indicators.length)
      ) {
        element.classList.add("small");
      } else if (index >= this.sliderMin && index <= this.sliderMax) {
        element.classList.add("standard");
      } else {
        element.classList.add("hidden");
      }
    });
  }

  render() {
    return (
      <Host
        class={`
                    TeaserList
                    TeaserList--${this.teasers.length}
                `}
      >
        <div class='TeaserList-intro'>
          <slot name='intro' />
        </div>

        {this.showAsSlider ? (
          <div>
            <div class='TeaserList-wrapper '>
              <div class='TeaserList-slides swiper-container'>
                <div class='swiper-wrapper'></div>
              </div>
            </div>
            <div class='TeaserList-ui-wrapper'>
              <button class='TeaserList-button TeaserList-button--prev swiper-button-prev'></button>
              <div class='TeaserList-pagination swiper-pagination'></div>
              <button class='TeaserList-button TeaserList-button--next swiper-button-next'></button>
            </div>
            <div style={{ display: "none" }}>
              <slot />
            </div>
          </div>
        ) : (
          <div class='TeaserList-teasers'>
            <slot />
          </div>
        )}
      </Host>
    );
  }
}
