import { Component, h, Prop, State, Host, Watch, Event, EventEmitter, Element } from "@stencil/core";
import breakpoints from "../../utils/breakpoints";

@Component({
  tag: "app-image",
  styleUrl: "image.scss",
  shadow: true,
})
export class appImage {
  @Element() el: HTMLAppImageElement;

  /**
   * source of the image (default)
   */
  @Prop() imgSrc: string;

  /**
   * Whether the image should be and img (default) or a background-image
   */
  @Prop() public background: boolean = false;

  /**
   * The alt text of the image
   */
  @Prop() public alt: string;

  /**
   * The subtitle text of the image
   */
  @Prop() public subtitle: string;

  /**
   * The default width of the image
   */
  @Prop() public width: number;

  /**
   * The default height of the image
   */
  @Prop() public height: number;

  /**
   * XSmall source of the image
   */
  @Prop() public xsmall?: string;

  /**
   * Small source of the image
   */
  @Prop() public small?: string;

  /**
   * Medium source of the image
   */
  @Prop() public medium?: string;

  /**
   * Large source of the image
   */
  @Prop() public large?: string;

  /**
   * XLarge source of the image
   */
  @Prop() public xlarge?: string;

  /**
   * loading `auto` or `eager` (default: `lazy`)
   */
  @Prop() public loading?: "auto" | "eager" | "lazy" = "lazy";

  private observer: IntersectionObserver;

  /**
   * The current window width
   */
  @State() loadingState = this.loading;

  /**
   * The current window width
   */
  @State() currentSrc = "";

  /**
   * Emitted, as soon as the image is completely loaded
   */
  @Event() load: EventEmitter;

  private onLoad = () => {
    this.load.emit();
  };

  private setCurrentSrc = () => {
    const width = window.innerWidth;

    if (width >= breakpoints.xlarge) {
      this.currentSrc = this.xlarge;
    } else if (width >= breakpoints.large) {
      this.currentSrc = this.large;
    } else if (width >= breakpoints.medium) {
      this.currentSrc = this.medium;
    } else if (width >= breakpoints.websiteSmall) {
      this.currentSrc = this.small;
    } else {
      this.currentSrc = this.xsmall;
    }
  };

  @Watch("background")
  private setBackground() {
    if (this.background) {
      this.setCurrentSrc();
      window.removeEventListener("resize", this.setCurrentSrc);
      window.addEventListener("resize", this.setCurrentSrc);
    }
  }

  componentDidLoad() {
    const img: HTMLImageElement = this.el.shadowRoot.querySelector("img");

    if (window.innerHeight > this.el.getBoundingClientRect().top) {
      this.loadingState = "eager"; // The image is placed above the fold, so we are eagerly loading it
    }

    if (this.loadingState == "lazy") {
      if (img) {
        this.observer = new IntersectionObserver(this.onIntersection);
        this.observer.observe(img);
      } else if (this.background) {
        this.observer = new IntersectionObserver(this.onIntersection);
        this.observer.observe(this.el);
      }
    }
  }

  private onIntersection = async (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        if (this.observer) {
          this.observer.disconnect();
        }

        if (this.background) {
          entry.target.classList.remove("Image--lazy");
        } else if (entry.target.getAttribute("data-src")) {
          entry.target.setAttribute("src", entry.target.getAttribute("data-src"));
          entry.target.removeAttribute("data-src");
        }
      }
    }
  };

  private _renderPicture() {
    return (
      <picture>
        {this.xlarge && <source srcSet={this.xlarge} media='(min-width: 1366px)' />}
        {this.large && <source srcSet={this.large} media='(min-width: 1024px)' />}
        {this.medium && <source srcSet={this.medium} media='(min-width: 768px)' />}
        {this.small && <source srcSet={this.small} media='(min-width: 640px)' />}
        {this.xsmall ? (
          <img
            onLoad={this.onLoad}
            data-src={this.loadingState == "lazy" ? `${this.xsmall}` : ``}
            alt={this.alt}
            src={this.loadingState == "lazy" ? `` : `${this.xsmall}`}
            width={this.width}
            height={this.height}
            loading={this.loadingState}
          />
        ) : this.small ? (
          <img
            onLoad={this.onLoad}
            data-src={this.loadingState == "lazy" ? `${this.small}` : ``}
            alt={this.alt}
            src={this.loadingState == "lazy" ? `` : `${this.small}`}
            loading={this.loadingState}
          />
        ) : this.medium ? (
          <img
            onLoad={this.onLoad}
            data-src={this.loadingState == "lazy" ? `${this.medium}` : ``}
            alt={this.alt}
            src={this.loadingState == "lazy" ? `` : `${this.medium}`}
            loading={this.loadingState}
          />
        ) : this.large ? (
          <img
            onLoad={this.onLoad}
            data-src={this.loadingState == "lazy" ? `${this.large}` : ``}
            alt={this.alt}
            src={this.loadingState == "lazy" ? `` : `${this.large}`}
            loading={this.loadingState}
          />
        ) : this.xlarge ? (
          <img
            onLoad={this.onLoad}
            data-src={this.loadingState == "lazy" ? `${this.xlarge}` : ``}
            alt={this.alt}
            src={this.loadingState == "lazy" ? `` : `${this.xlarge}`}
            loading={this.loadingState}
          />
        ) : null}
      </picture>
    );
  }

  connectedCallback() {
    this.setBackground();
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.setCurrentSrc);
  }

  render() {
    return (
      <Host
        style={
          this.currentSrc && this.background
            ? {
                backgroundImage: `url(${this.currentSrc})`,
              }
            : null
        }
        class={`
                    ${this.currentSrc && this.background && this.loadingState == "lazy" ? "Image--lazy" : ""}
                `}
      >
        {!this.background &&
          (this.subtitle ? (
            <figure>
              {this._renderPicture()}
              <figcaption>{this.subtitle}</figcaption>
            </figure>
          ) : (
            this._renderPicture()
          ))}
      </Host>
    );
  }
}
