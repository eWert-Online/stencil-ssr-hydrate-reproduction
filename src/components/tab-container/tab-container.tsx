import { Component, h, Host, Element, State, Listen } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";
import breakpoints from "../../utils/breakpoints";

/**
 * @slot *default* - A list of <app-tab> to display
 * @slot intro - Elements to display above the tab-container
 */
@Component({
  tag: "app-tab-container",
  styleUrl: "tab-container.scss",
  shadow: true,
})
export class AppTabContainer {
  @Element() private el: HTMLAppTabContainerElement;

  /**
   * If this component should be rendered as tabs or as a collapsible
   */
  @State() shouldRenderTabs = window.innerWidth >= breakpoints.large;

  /**
   * The height of the tab containers content
   */
  @State() height: number = 0;

  /**
   * The position of the active tab underline
   */
  @State() private sliderMeasurements = {
    left: 0,
    width: 0,
    duration: 0,
  };

  private observer: ResizeObserver;

  private tabs: Array<HTMLAppTabElement> = [];

  private setHeight = () => {
    const element = this.el.shadowRoot.querySelector(".TabContainer-tabContent") as HTMLDivElement;
    this.height = element.getBoundingClientRect().height;
  };

  private setSliderMeasurements = (tab: HTMLAppTabElement) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const wrapper = this.el.shadowRoot.querySelector(".TabContainer-tabsWrapper");

        const left = tab.getBoundingClientRect().left - (wrapper?.getBoundingClientRect().left || 0);
        const width = tab.offsetWidth;
        const jumps = Math.ceil(Math.abs(this.sliderMeasurements.left - left) / width) || 0;

        let duration = 0;
        if (jumps >= 4) {
          duration = 600;
        } else if (jumps >= 3) {
          duration = 500;
        } else if (jumps >= 2) {
          duration = 300;
        }

        if (left !== this.sliderMeasurements.left || width !== this.sliderMeasurements.width) {
          this.sliderMeasurements = {
            left,
            width,
            duration,
          };
        }
      });
    });
  };

  private openTab = (tabToOpen: HTMLAppTabElement) => {
    const element = this.el.shadowRoot.querySelector(".TabContainer-tabContent");
    if (element) {
      element.innerHTML = tabToOpen.innerHTML;
      // The two requestAnimationFrames ensure, that the dom is updated with the new content.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.setHeight();
        });
      });
    }
    this.setSliderMeasurements(tabToOpen);
    this.tabs.forEach((tab) => {
      if (tabToOpen !== tab) {
        tab.open = false;
      } else {
        tab.open = true;
      }
    });
  };

  private setShouldRenderTabs = () => {
    this.shouldRenderTabs = window.innerWidth >= breakpoints.large;
  };

  private openFirstTab = () => {
    if (this.shouldRenderTabs === true) {
      const hasOpenTab = this.tabs.some((tab) => tab.open);
      if (!hasOpenTab && this.tabs.length > 0) {
        this.openTab(this.tabs[0]);
      }
    }
  };

  @Listen("stOpen")
  handleOpen(event: CustomEvent<HTMLAppTabElement>) {
    this.openTab(event.detail);
  }

  connectedCallback() {
    this.observer = new ResizeObserver(() => {
      if (this.shouldRenderTabs === true) {
        this.setHeight();

        const activeTab = this.tabs.find((tab) => tab.open);
        this.setSliderMeasurements(activeTab);
      }
    });
    this.tabs = Array.from(this.el.querySelectorAll("app-tab"));

    window.addEventListener("resize", this.setShouldRenderTabs);
  }

  componentDidLoad() {
    this.openFirstTab();
  }

  componentDidUpdate() {
    this.openFirstTab();

    if (!this.shouldRenderTabs) {
      this.observer.disconnect();
      this.tabs.forEach((tab) => {
        tab.open = false;
      });
    } else {
      this.observer.observe(this.el);
      this.observer.observe(this.el.shadowRoot.querySelector(".TabContainer-tabContent"));
    }
  }

  disconnectedCallback() {
    this.observer.disconnect();
    window.removeEventListener("resize", this.setShouldRenderTabs);
  }

  render() {
    return (
      <Host
        class={`
                    TabContainer
                `}
      >
        <div class='TabContainer-intro'>
          <slot name='intro' />
        </div>

        {this.shouldRenderTabs ? (
          <div>
            <div class='TabContainer-tabsWrapper'>
              <div class='TabContainer-tabs'>
                <slot />
              </div>
              <span
                class='TabContainer-slider'
                style={{
                  transform: `translateX(${this.sliderMeasurements.left}px)`,
                  width: `${this.sliderMeasurements.width}px`,
                  transitionDuration: `${this.sliderMeasurements.duration}ms`,
                }}
              />
            </div>
            <div class='TabContainer-tabContentWrapper' style={{ height: `${this.height}px` }}>
              <app-module-container class='TabContainer-tabContent'></app-module-container>
            </div>
          </div>
        ) : (
          <app-collapsible>
            {this.tabs.map((tab) => {
              return (
                <app-collapsible-item
                  headline={tab.headline}
                  headlineBold={tab.headlineBold}
                  initialOpen={tab.open}
                  innerHTML={tab.innerHTML}
                ></app-collapsible-item>
              );
            })}
          </app-collapsible>
        )}
      </Host>
    );
  }
}
