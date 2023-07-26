import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "app-group-site-footer",
  styleUrl: "group-site-footer.scss",
  shadow: true,
})
export class AppGroupSiteFooter {
  /**
   * The title to display above the social icons
   */
  @Prop() public socialTitle: string;

  /**
   * The text to display as the copyright
   */
  @Prop() public copyright: string;

  private cancelScrollAnimation = false;
  private scrollTop = () => {
    this.cancelScrollAnimation = false;
    const smoothness = 6;
    let currentAnimationFrame = null;
    let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    const setCancelScroll = () => {
      const newScrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      if (newScrollPosition > scrollPosition) {
        this.cancelScrollAnimation = true;
      }
    };
    const scrollChunk = () => {
      scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollPosition > 0 && !this.cancelScrollAnimation) {
        currentAnimationFrame = window.requestAnimationFrame(() => {
          scrollChunk();
        });
        window.scrollTo(0, scrollPosition - scrollPosition / smoothness);
      } else {
        if (currentAnimationFrame !== null) {
          window.cancelAnimationFrame(currentAnimationFrame);
        }
        window.removeEventListener("scroll", setCancelScroll);
      }
    };

    window.addEventListener("scroll", setCancelScroll);
    scrollChunk();
  };

  private animateScrollTopButton = (evt: Event) => {
    let target = evt.target as HTMLButtonElement;
    target.classList.add("is-animated");
    target.addEventListener("animationend", () => {
      target.classList.remove("is-animated");
    });
  };

  private showSecondLayer = () => {
    (window as any).UC_UI.showSecondLayer();
  };

  render() {
    return (
      <Host class='GroupSiteFooter'>
        <div class='GroupSiteFooter-intro'>
          <div class='GroupSiteFooter-introContainer'>
            <div class='GroupSiteFooter-socialContainer'>
              <app-headline-quaternary class='GroupSiteFooter-socialTitle' tag='h4' text={this.socialTitle} uppercase />
              <div class='GroupSiteFooter-socialIcons'>
                <slot name='social-icons' />
              </div>
            </div>
            <div class='GroupSiteFooter-buttonContainer'>
              <button class='GroupSiteFooter-cookie' aria-label='Privacy Settings' onClick={this.showSecondLayer} />
              <button
                class='GroupSiteFooter-scrollTop'
                aria-label='Scroll top'
                onMouseOver={this.animateScrollTopButton}
                onClick={this.scrollTop}
              />
            </div>
          </div>
        </div>
        <nav class='GroupSiteFooter-metaNav'>
          <ul class='GroupSiteFooter-metaNavLinks'>
            <slot name='meta-nav' />
          </ul>
        </nav>
        <div class='GroupSiteFooter-main'>
          <div class='GroupSiteFooter-mainNav'>
            <slot name='main-nav' />
            <div class='GroupSiteFooter-contact'>
              <slot name='contact' />
            </div>
          </div>
        </div>
        <div class='GroupSiteFooter-subFooter'>
          <div class='GroupSiteFooter-copyright'>{this.copyright}</div>
        </div>
      </Host>
    );
  }
}
