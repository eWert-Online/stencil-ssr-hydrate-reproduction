import { Component, h, Prop, Host, Element } from "@stencil/core";

@Component({
  tag: "app-image",
  styleUrl: "image.scss",
  shadow: true,
})
export class AppImage {
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
   * The default width of the image
   */
  @Prop() public width: number;

  /**
   * The default height of the image
   */
  @Prop() public height: number;

  /**
   * loading `auto` or `eager` (default: `lazy`)
   */
  @Prop() public loading?: "auto" | "eager" | "lazy" = "lazy";

  private observer: IntersectionObserver;

  componentDidLoad() {
    const img: HTMLImageElement = this.el.shadowRoot.querySelector("img");

    if (this.loading == "lazy") {
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

  render() {
    return (
      <Host
        style={
          this.imgSrc && this.background
            ? {
                backgroundImage: `url(${this.imgSrc})`,
              }
            : null
        }
        class={`
            ${this.imgSrc && this.background && this.loading == "lazy" ? "Image--lazy" : ""}
        `}
      >
        {!this.background && (
          <picture>
            <img
              data-src={this.loading == "lazy" ? `${this.imgSrc}` : ``}
              alt={this.alt}
              src={this.loading == "lazy" ? `` : `${this.imgSrc}`}
              loading={this.loading}
            />
          </picture>
        )}
      </Host>
    );
  }
}
