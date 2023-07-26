import { Component, Element, h, Host, State, Prop } from "@stencil/core";

import Swiper from "swiper";
import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper/core";

import breakpoints from "../../utils/breakpoints";
import ResizeObserver from "resize-observer-polyfill";

SwiperCore.use([Autoplay, Navigation, Pagination]);

/**
 * @slot *default* - A list of <app-product-teaser-list-item> to display in a grid
 * @slot intro - Elements to display above the product-teaser-list
 */
@Component({
  tag: "app-product-teaser-list",
  styleUrl: "product-teaser-list.scss",
  shadow: true,
})
export class AppProductTeaserList {
  @Element() el: HTMLAppProductTeaserListElement;

  /**
   * show 4 teasers in one row on large
   */
  @Prop() fourColumnsOnLarge: boolean = false;

  /**
   * show teasers as slider
   */
  @Prop() showAsSlider: boolean = false;

  @State() slottedElements = [];

  private getItemsPerRow = () => {
    if (window.innerWidth >= breakpoints.medium) {
      return 3;
    }

    if (window.innerWidth >= breakpoints.websiteSmall) {
      return 2;
    }

    return 1;
  };

  private getItemHeight = () => {
    let images = [];
    this.slottedElements.forEach((element, index) => {
      const productImage = element.shadowRoot.querySelector(".ProductTeaser-image") as HTMLElement;
      productImage.style.height = "auto";
      images[index] = productImage.offsetHeight;
    });

    let rows = Math.ceil(images.length / this.itemsPerRow);
    let heightsPerRow = [];

    for (let i = 0; i < rows; i++) {
      const maxHeight = Math.max(...images.splice(0, this.itemsPerRow));
      heightsPerRow.push(maxHeight);
    }

    return heightsPerRow;
  };

  private setMinHeight = () => {
    /**
     * We wait for a paint first, so we get the correct height of the content container.
     */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        this.itemsPerRow = this.getItemsPerRow();
        this.imageHeight = this.getItemHeight();

        this.slottedElements.forEach((element, index) => {
          if (this.itemsPerRow === 1) {
            const productImage = element.shadowRoot.querySelector(".ProductTeaser-image") as HTMLElement;
            productImage.style.height = "auto";
          } else {
            const i = Math.ceil((index + 1) / this.itemsPerRow) - 1;
            const productImage = element.shadowRoot.querySelector(".ProductTeaser-image") as HTMLElement;
            productImage.style.height = `${this.imageHeight[i]}px`;
          }
        });
      });
    });
  };

  @State() itemsPerRow;

  @State() imageHeight;

  private _documentResizeObserver: ResizeObserver;

  private swiper: Swiper;

  private slides: HTMLAppProductTeaserElement[];

  private indicators: NodeListOf<Element>;

  private sliderMin: number = 0;

  private sliderMax: number = 5;

  connectedCallback() {
    window.addEventListener("resize", this.setMinHeight);

    if (this.showAsSlider) {
      this.el.querySelectorAll("app-product-teaser").forEach((slide) => {
        slide.classList.add("swiper-slide");
      });

      this.slides = Array.from(this.el.querySelectorAll("app-product-teaser")).map(
        (el) => el.cloneNode(true) as HTMLAppProductTeaserElement,
      );
    }
  }

  componentDidLoad() {
    this.slottedElements = Array.from(this.el.shadowRoot.querySelectorAll("slot"))
      .find((slot) => !slot.name)
      ?.assignedElements();

    this.el.querySelectorAll("app-image").forEach((image) => {
      image.addEventListener("load", this.setMinHeight);
    });

    this.setMinHeight();

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
          [breakpoints.medium]: {
            slidesPerView: 3,
            slidesPerGroup: 1,
            spaceBetween: 20,
          },
          [breakpoints.large]: {
            slidesPerView: this.fourColumnsOnLarge ? 4 : 3,
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

  disconnectedCallback() {
    this._documentResizeObserver.disconnect();
    window.removeEventListener("resize", this.setMinHeight);
  }

  render() {
    return (
      <Host
        class={`
                    ProductTeaserList
                    ${this.fourColumnsOnLarge ? "ProductTeaserList--columns-4" : ""}
                `}
      >
        <div class='ProductTeaserList-intro'>
          <slot name='intro' />
        </div>

        {this.showAsSlider ? (
          <div>
            <div class='ProductTeaserList-wrapper '>
              <div class='ProductTeaserList-slides swiper-container'>
                <div class='swiper-wrapper'></div>
              </div>
            </div>
            <div class='ProductTeaserList-ui-wrapper'>
              <button class='ProductTeaserList-button ProductTeaserList-button--prev swiper-button-prev'></button>
              <div class='ProductTeaserList-pagination swiper-pagination'></div>
              <button class='ProductTeaserList-button ProductTeaserList-button--next swiper-button-next'></button>
            </div>
            <div style={{ display: "none" }}>
              <slot />
            </div>
          </div>
        ) : (
          <div class='ProductTeaserList-teasers'>
            <slot />
          </div>
        )}
      </Host>
    );
  }
}
