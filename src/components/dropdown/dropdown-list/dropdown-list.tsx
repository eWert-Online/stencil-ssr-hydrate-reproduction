import { Component, h, Host, Prop, Element, Method, Event, EventEmitter, State } from "@stencil/core";
import breakpoints from "../../../utils/breakpoints";
import { DropdownGroupHeadingModel } from "../dropdown-group-heading/dropdown-group-heading-model";
import { DropdownOptionModel } from "../dropdown-option/dropdown-option-model";
import ResizeObserver from "resize-observer-polyfill";

const Fragment = (_props, children) => [...children];

/**
 * Renders a dropdown option list which is not meant to be used as a standalone custom element.
 * It is used internally by <app-dropdown> and publicly exposed in the collection only for Patternlab showcasing purposes.
 *
 * @slot *default* - HTML-Content to be displayed in the dropdown overlay list.
 * Assigning nodes to the slot is meant only for Patternlab showcasing of the <app-dropdown-list> component in isolation.
 * The assigned nodes should be <app-dropdown-option> elements. The assigned nodes can also
 * be a mix of <app-dropdown-option> and <app-group-heading>, check the documentation for the clustered dropdown flavour.
 */
@Component({
  tag: "app-dropdown-list",
  styleUrl: "dropdown-list.scss",
  shadow: true,
})
export class AppDropdownList {
  /**
   * `true` if the the dropdown options are grouped under subheadings
   */
  @Prop({ reflect: true }) public clustered: boolean = false;

  /**
   * `small` or `medium` (default: `medium`)
   */
  @Prop({ reflect: true }) public size: "medium" | "small" = "medium";

  /**
   * `true` if multiple options may be selected in the dropdown
   */
  @Prop({ reflect: true }) public multiple?: boolean = false;

  /**
   * Amount of visible options at one time
   */
  @Prop() public visibleOptionsCount: number = 5.5;

  /**
   * Whether the dropdown list host is mounted in the document body or not
   */
  @Prop() public attachToBody: boolean = true;

  /**
   * Whether the first dropdown item is active(highlighted) when the list opens
   */
  @Prop() public activateFirstItem: boolean = true;

  @Element() private _element: HTMLAppDropdownListElement;

  /**
   * Emitted when the active dropdown option is changed or set for the first time
   */
  @Event() private activeOptionChanged: EventEmitter<HTMLAppDropdownOptionElement>;

  /**
   * Emitted as soon as the dropdown list is 'stolen'
   * from the original mount element and appeneded to the body element
   */
  @Event() private appendedToDom: EventEmitter<HTMLAppDropdownListElement>;

  /**
   * Emitted when user clicks the outer most part of the dropdown list, around the option wrapper,
   * i.e clicking the padding space around the full screen mobile overlay
   */
  @Event() private clickAway: EventEmitter;

  /**
   * Dropdown child items to be rendered by the dropdown list
   */
  @Prop() dropdownItems: (DropdownOptionModel | DropdownGroupHeadingModel)[] = [];

  /**
   * Renders an input that run in-memory dropdown option filtering on mobile screens
   */
  @Prop() public search: boolean = false;

  /**
   * Filter value
   */
  @Prop() public filterValue: string = "";

  /**
   * Use slotted contented as an alternative to setting 'dropdownItems' prop.
   */
  @Prop() useSlot: boolean = false;

  /**
   * Search label placeholder
   */
  @Prop({ reflect: true }) public searchResultPlaceholder: string = "";

  /**
   * Search input placeholder
   */
  @Prop({ reflect: true }) public searchInputPlaceholder: string = "Search";

  /**
   * Search input value (for mobile viewports only)
   */
  @Prop({ reflect: true }) public searchInputValue: string = "";

  @State() private _isMobileViewport: boolean;
  @State() tick = {};

  private _elementResizeObserver: ResizeObserver;
  private _isRevealed: boolean = false;
  private _minScaleY: number;
  private _inputSearchEl: HTMLInputElement;

  private async _inactivateCurrentOption() {
    const activeOption = this._dropdownOptionElementList.find((option) => option.active);
    if (activeOption) {
      activeOption.active = false;
    }
  }

  private get _maxHeightStyle() {
    const itemHeight = this.size === "medium" ? 45 : 30;
    let maxHeight = itemHeight * this.visibleOptionsCount;
    if (this.search && this._isMobileViewport) {
      const maxOverlayHeight = window.innerHeight - 120;
      if (maxHeight > maxOverlayHeight) {
        maxHeight = maxOverlayHeight;
      }
    }
    return {
      "max-height": `${maxHeight}px`,
    };
  }

  private get _activeOptionElement(): HTMLAppDropdownOptionElement {
    return this._dropdownOptionElementList.find((opt) => opt.active);
  }

  private _setupFocus = () => {
    if (!this.activateFirstItem || this._activeOptionElement) {
      return;
    }

    this.highlightFirstItem();
  };

  private get _dropdownOptionElementList(): HTMLAppDropdownOptionElement[] {
    return Array.from(this._element.shadowRoot.querySelectorAll("app-dropdown-option"));
  }

  private _setMinimumScaleYValue() {
    this._isMobileViewport = window.innerWidth < breakpoints.websiteSmall;
    if (this._isMobileViewport) {
      this._minScaleY = 0.93;
    } else {
      this._minScaleY = 0.8;
    }
  }

  /**
   * Unhighlightes active option (if any)
   */
  @Method()
  public async unhighlightDropdownOption(scrollTop: boolean = false) {
    await this._inactivateCurrentOption();
    if (scrollTop) {
      this._element.scrollTop = 0;
    }
  }

  /**
   * Hightlights given option
   */
  @Method()
  public async highlightDropdownOption(option: HTMLAppDropdownOptionElement, autoScroll: boolean = false) {
    if (this._filteredDropdownItems.filter((item) => item instanceof DropdownOptionModel).length === 0) {
      return null;
    }

    await this._inactivateCurrentOption();
    if (this._activeOptionElement !== option) {
      this.activeOptionChanged.emit(option);
    }
    option.active = true;

    if (!autoScroll) {
      return;
    }

    if (this._element.scrollHeight > this._element.clientHeight) {
      const scrollBottom = this._element.clientHeight + this._element.scrollTop;
      const elementBottom = option.offsetTop + option.getBoundingClientRect().height;
      if (elementBottom > scrollBottom) {
        this._element.scrollTop = elementBottom - this._element.clientHeight;
      } else if (option.offsetTop < this._element.scrollTop) {
        this._element.scrollTop = option.offsetTop;
      }
    }
  }

  /**
   * Highlights first dropdown option (if any)
   */
  @Method()
  public async highlightFirstItem() {
    if (this._dropdownOptionElementList.length > 0) {
      await this.highlightDropdownOption(this._dropdownOptionElementList[0]);
    }
  }

  /**
   * Highlights last dropdown option (if any)
   */
  @Method()
  public async highlightLastItem() {
    if (this._dropdownOptionElementList.length > 0) {
      const lastItem = this._dropdownOptionElementList[this._dropdownOptionElementList.length - 1];
      await this.highlightDropdownOption(lastItem);
    }
  }

  /**
   * shows the dropdown list
   */
  @Method()
  public async reveal() {
    const awaitTransition = new Promise((resolve) => {
      this._handleAnimation(resolve);
      this._element.className = this._className + " enter";
      this._element.style.visibility = "visible";
      this._element.style.opacity = "1";
      this._element.style.transform = "scaleY(1)";
      this._isRevealed = true;
    });

    await awaitTransition;
  }

  /**
   * hides away the dropdown list
   */
  @Method()
  public async hide() {
    const awaitTransition = new Promise((resolve) => {
      this._handleAnimation(resolve);
      this._element.style.visibility = "hidden";
      this._element.style.opacity = "0";

      this._element.style.transform = `scaleY(${this._minScaleY})`;
      this._element.className = this._className + " leave";
      this._isRevealed = false;
    });

    await awaitTransition;
  }

  private _handleAnimation(resolve: (value: unknown) => void) {
    const reset = () => {
      this._element.removeEventListener("transitionend", reset);
      this._element.className = this._className;
      resolve(true);
    };
    this._element.addEventListener("transitionend", reset);
  }

  private get _filteredDropdownItems(): (DropdownOptionModel | DropdownGroupHeadingModel)[] {
    return this.dropdownItems?.filter((item) => {
      if (item instanceof DropdownOptionModel) {
        return !this.filterValue || item.label.toLowerCase().startsWith(this.filterValue.toLocaleLowerCase());
      }
      return item instanceof DropdownGroupHeadingModel;
    });
  }

  private _highlightDropdownItemByValue(value: string) {
    const option = this._element.shadowRoot.querySelector(
      `app-dropdown-option[value="${value}"]`,
    ) as HTMLAppDropdownOptionElement;
    this.highlightDropdownOption(option);
  }

  private _renderDropDownItems() {
    {
      const filteredItems = this._filteredDropdownItems;
      if (filteredItems.filter((item) => item instanceof DropdownOptionModel).length === 0) {
        return (
          <app-dropdown-option
            size={this.size}
            label={this.searchResultPlaceholder}
            disabled
            class='no-results'
          ></app-dropdown-option>
        );
      }
      return filteredItems?.map((dropdownItem) => {
        return (
          <Fragment>
            {dropdownItem instanceof DropdownOptionModel && (
              <app-dropdown-option
                {...dropdownItem}
                clustered={this.clustered}
                multiselect={this.multiple}
                size={this.size}
                onMouseOver={() => this._highlightDropdownItemByValue(dropdownItem.value)}
              ></app-dropdown-option>
            )}
            {dropdownItem instanceof DropdownGroupHeadingModel && (
              <app-dropdown-group-heading {...dropdownItem}></app-dropdown-group-heading>
            )}
          </Fragment>
        );
      });
    }
  }

  private _renderSlottedContent() {
    {
      return <slot></slot>;
    }
  }

  private get _className() {
    return `${this.search ? "search-filter" : ""} ${this._isMobileViewport ? "mobile-overlay" : ""}`;
  }

  private _renderInnerContent() {
    return (
      <Fragment>
        {" "}
        {!this.useSlot && this._renderDropDownItems()}
        {this.useSlot && this._renderSlottedContent()}
      </Fragment>
    );
  }

  private _handleClick = (evt: MouseEvent) => {
    const listPathIndex = evt
      .composedPath()
      .map((target) => target instanceof Node && target.nodeName)
      .indexOf("WAREMA-DROPDOWN-LIST");
    if (listPathIndex === 0) {
      this.clickAway.emit();
    }
  };

  componentDidLoad() {
    if (this.attachToBody) {
      this.appendedToDom.emit(this._element);
    }
  }

  connectedCallback() {
    this._elementResizeObserver = new ResizeObserver(() => {
      this._setMinimumScaleYValue();
      if (!this._isRevealed && !this.useSlot) {
        this._element.style.transform = `scaleY(${this._minScaleY})`;
      }
      if (this._isRevealed && this._isMobileViewport) {
        this.tick = {};
      }
    });
    this._elementResizeObserver.observe(this._element);

    if (this._element.parentElement === window.document.body) {
      return;
    }
    if (this.attachToBody) {
      this._element.style.visibility = "hidden";
      this._element.style.opacity = "0";
      this._setMinimumScaleYValue();
      if (!this.useSlot) {
        this._element.style.transform = `scaleY(${this._minScaleY})`;
      }
      window.document.body.appendChild(this._element);
    }
  }

  disconnectedCallback() {
    this._elementResizeObserver.disconnect();
  }

  render() {
    return (
      <Host
        style={!this._isMobileViewport && this._maxHeightStyle}
        class={this._className}
        tabindex='-1'
        onClick={this._handleClick}
        onFocus={() => this._setupFocus()}
        data-a11y-dialog-ignore-focus-trap
      >
        {this._isMobileViewport ? (
          <Fragment>
            {this.search ? (
              <input
                placeholder={this.searchInputPlaceholder}
                value={this.searchInputValue}
                class={`${this.size === "medium" ? "size-large" : "size-small"}`}
                ref={(el) => (this._inputSearchEl = el as HTMLInputElement)}
                onFocus={() => !this._isMobileViewport && this._inputSearchEl.select()}
                onTouchEnd={() => this._inputSearchEl.select()}
              ></input>
            ) : null}
            <div style={this._maxHeightStyle}>{this._renderInnerContent()}</div>
          </Fragment>
        ) : (
          this._renderInnerContent()
        )}
      </Host>
    );
  }
}
