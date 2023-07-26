import { Component, h, Element, Prop, Host, Event, EventEmitter, State, Watch } from "@stencil/core";
import { getTopLabelTextWidth } from "../../utils/utils";
import { v4 } from "uuid";
import ResizeObserver from "resize-observer-polyfill";
import { DropdownGroupHeadingModel } from "./dropdown-group-heading/dropdown-group-heading-model";
import { DropdownOptionModel } from "./dropdown-option/dropdown-option-model";
import breakpoints from "../../utils/breakpoints";

/**
 * Renders a form control dropdown element. The dropdown option list is initially collapsed.
 * Upon expanding the dropdown an overlay renders the dropdown option list which is positioned relative to the dropdown toggle element.
 *
 * @slot *default* - HTML-Content to be displayed in the dropdown overlay list.
 * The assigned nodes should be <app-dropdown-option> elements. The assigned nodes can also
 * be a mix of <app-dropdown-option> and <app-group-heading>, check the documentation for the clustered dropdown flavour.
 */
@Component({
  tag: "app-dropdown",
  styleUrl: "dropdown.scss",
  shadow: true,
})
export class AppDropdown {
  @Element() private el: HTMLAppDropdownElement;

  /**
   * The name of the dropdown
   */
  @Prop() public name!: string;

  /**
   * The label of the dropdown
   */
  @Prop() public label!: string;

  /**
   * `true` if multiple options may be selected in the dropdown. It's not meant to be used together with search dropdown.
   */
  @Prop() public multiple?: boolean = false;

  /**
   * The text to display inside the dropdown if multiple selections were made.
   * `{num}` will be replaced by the number of options selected.
   */
  @Prop() public multipleSelectionsLabel?: string = `${this.label} ({num})`;

  /**
   * The value (default selected option value) of the dropdown.
   * If multiple is true, you may provide a comma separated list of values ("1, 2, 3").
   */
  @Prop({ mutable: true, reflect: true }) public value: string | Array<string> = this.multiple ? [] : "";

  /**
   * `true` if the dropdown field has error validation state.
   * This should always be used in combination with an error-text
   */
  @Prop() public invalid?: boolean = false;

  /**
   * `true` if the dropdown field has warning validation state.
   * This should always be used in combination with an error-text
   * When multiple validation states are set to true (`invalid`, `warning`, `hasInfo`), the `invalid` state takes precedence.
   */
  @Prop() public warning?: boolean = false;

  /**
   * `true` if the dropdown field has information validation state.
   * This should always be used in combination with an error-text
   * When both `hasInfo` and `warning` are true, the `warning` state takes precedence.
   */
  @Prop() public hasInformation?: boolean = false;

  /**
   * The error text shown below the dropdown.
   */
  @Prop() public errorText?: string = "";

  /**
   * The hint text shown below the dropdown.
   * Optional occurrence of `${link}` will be replaced by the value of `hintLinkText` upon rendering.
   */
  @Prop() hint?: string = "";

  /**
   * Href for optional hyperlink rendered within the hint text.
   *  Works together with `hintLinkText`.
   */
  @Prop() hintLinkHref?: string = "";

  /**
   * Hyperlink text for optional link rendered within the hint text.
   * Works together with `hintLinkHref`.
   */
  @Prop() hintLinkText: string = this.hintLinkHref;

  /**
   * `true` if the dropdown should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * `small` or `medium` (default: `medium`)
   */
  @Prop() public size: "medium" | "small" = "medium";

  /**
   * `true` if the the dropdown options are grouped under subheadings
   */
  @Prop({ reflect: true }) public clustered: boolean = false;

  /**
   * Renders an input that run in-memory dropdown option filtering. It's meant to be used with single-selection dropdown only.
   */
  @Prop({ reflect: true }) public search: boolean = false;

  /**
   * Placeholder text for search dropdown result list
   */
  @Prop({ reflect: true }) public searchResultPlaceholder: string = "";

  /**
   * Placeholder for the search input
   */
  @Prop({ reflect: true }) public searchInputPlaceholder: string = "Search";

  /**
   * Emitted after the input is changed when the focus is lost
   */
  @Event() private change: EventEmitter;

  @State() private _dropdownListElement: HTMLAppDropdownListElement;

  @State() private _activeDescendant?: HTMLAppDropdownOptionElement;
  @State() private _isOpen = false;
  set isOpen(isOpen: boolean) {
    this._isOpen = isOpen;
    this._isFiltering = false;
  }
  @State() private _borderGapWidth: number = 0;
  @State() private _hasTransparentBackground: boolean;
  @State() private _isFiltering: boolean = false;
  @State() private _isMobileViewport: boolean;
  @State() tick = {};
  @State() _tabIndex: number = this.disabled ? -1 : 0;

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  @Watch("label")
  @Watch("value")
  onLabelChange() {
    if (!this.labelSpanElement && this.label) {
      this._labelElObserver = new MutationObserver(() => {
        this.labelSpanElement = this.el.shadowRoot.querySelector(".Dropdown-label");
        if (this.labelSpanElement) {
          if (this._hasValue && this.label) {
            this._moveLabelOnTop();
          } else {
            this._moveLabelToDefault();
          }
          this._labelElObserver.disconnect();
        }
      });
      this._labelElObserver.observe(this._inputWrapperElement, {
        childList: true,
      });
    } else {
      if (this._hasValue && this.label) {
        this._moveLabelOnTop();
      } else {
        this._moveLabelToDefault();
      }
    }
  }

  @Watch("value")
  moveLabelToDefaultUponClearing() {
    if (!this.value?.length) {
      this._isFiltering = false;
      this._inputSearchElement.value = "";
      this._previousSelectionValue = "";
    }
  }

  private _borderGapInitial: boolean = this._shouldSkipBorderGapTransition();
  private _dropdownListId = v4();
  private _elementResizeObserver: ResizeObserver;
  private _documentResizeObserver: ResizeObserver;
  private _triggerElement: HTMLElement;
  private _inputWrapperElement: HTMLElement;
  private _previousSelectionValue: string | Array<string> = this.value;

  private _shouldSkipBorderGapTransition(): boolean {
    return this._hasValidationState || this._hasValue;
  }

  private _syncDropdownListSelection() {
    if (this.multiple) {
      const selectionArray = this.value as Array<string>;

      selectionArray.forEach((optionValue) => this._selectDropdownOption(optionValue));
      const deselectionList = this._getDeselectedOptionList(selectionArray);
      deselectionList.forEach((option) => (option.selected = false));
    } else {
      const selectionValue = this.value as string;
      this._selectDropdownOption(selectionValue);
      const deselectionList = this._getDeselectedOptionList([selectionValue]);
      deselectionList.forEach((option) => (option.selected = false));
    }
  }

  private _processDropdownValue(): void {
    if (this.multiple && typeof this.value === "string") {
      this.value = this.value === "" ? [] : this.value.split(",").map((value) => value.trim());
    }
    this._syncDropdownListSelection();
  }

  private _positionListVertically(dropdownInputBox: DOMRect): string {
    const shadowTickness = 5;
    const belowInputTopPosition = dropdownInputBox.bottom + 6;
    const aboveInputTopPosition = dropdownInputBox.top - this._dropdownListElement.offsetHeight - 6;
    if (
      document.documentElement.offsetHeight - shadowTickness <
      dropdownInputBox.bottom + this._dropdownListElement.offsetHeight + 6
    ) {
      if (aboveInputTopPosition > 0) {
        return `${aboveInputTopPosition}px`;
      }
    }
    return `${belowInputTopPosition}px`;
  }

  private _positionListHorizontally(dropdownInputBox: DOMRect, dropdownListBox: DOMRect) {
    if (document.documentElement.clientWidth >= dropdownInputBox.left + dropdownListBox.width) {
      this._dropdownListElement.style.left = `${dropdownInputBox.left}px`;
      return;
    }

    if (document.documentElement.clientWidth - dropdownInputBox.left >= dropdownInputBox.right) {
      this._dropdownListElement.style.left = `${dropdownInputBox.left}px`;
    } else {
      this._dropdownListElement.style.right = `${document.documentElement.clientWidth - dropdownInputBox.right}px`;
    }
  }

  private _resizeAndPositionDesktopDropdownList() {
    const back = this._dropdownListElement?.style.transform;
    this._dropdownListElement.style.transform = "";

    this._dropdownListElement.style.left = "";
    this._dropdownListElement.style.right = "";

    const dropdownInputBox = this.el.getBoundingClientRect();
    const dropdownListBox = this._dropdownListElement.getBoundingClientRect();

    this._dropdownListElement.style.minWidth = `${dropdownInputBox.width}px`;
    this._dropdownListElement.style.top = this._positionListVertically(dropdownInputBox);
    this._positionListHorizontally(dropdownInputBox, dropdownListBox);
    this._dropdownListElement.style.transform = back;
  }

  private _resizeAndPositionMobileDropdownList() {
    this._dropdownListElement.style.minWidth = "";
    this._dropdownListElement.style.top = "";
    this._dropdownListElement.style.left = "";
    this._dropdownListElement.style.right = "";
  }

  private _resizeAndPositionDropdownList(skipClosedDropdown: boolean = false) {
    if (!this._dropdownListElement) {
      return;
    }

    if (skipClosedDropdown && !this._isOpen) {
      return;
    }
    this._isMobileViewport = window.innerWidth < breakpoints.websiteSmall;
    if (this._isMobileViewport) {
      this._resizeAndPositionMobileDropdownList();
    } else {
      this._resizeAndPositionDesktopDropdownList();
    }
  }

  private _handleScrollEvents = (evt: Event) => {
    window.requestAnimationFrame(() => {
      if (this._isMobileViewport) {
        return;
      }

      const target: HTMLElement = evt.target as HTMLElement;
      if (target === this._dropdownListElement) {
        return;
      }

      if (!("scrollBehavior" in document.documentElement.style)) {
        /* As soon as dropdown-list box's scroll boundary is reached,
                 the underlying page will then start to scroll - this is called scroll chaining
                 All major browsers support disabling that behaviour via `overscroll-behavior: none`
                 No Safari up to 15-TP support this feature by default
                */
        this._resizeAndPositionDropdownList(true);
        return;
      }

      // unless the scrolling happens in the dropdown-list then the dropdown should be closed
      this._hideListbox();
    });
  };

  private _setActiveOption = (evt: CustomEvent<HTMLAppDropdownOptionElement>) => {
    this._activeDescendant = evt.detail;
  };

  private _registerDropdownListEvents() {
    this._dropdownListElement.addEventListener("keydown", this._checkHide);
    this._dropdownListElement.addEventListener("keydown", this._checkKeyPress);
    this._dropdownListElement.addEventListener("click", (evt) => this._checkClickItem(evt));
    this._dropdownListElement.addEventListener("clickAway", () => this._cancelFiltering());
    this._dropdownListElement.addEventListener("activeOptionChanged", this._setActiveOption);
    this._dropdownListElement.addEventListener("input", this._onSearchInput);
  }

  private _unregisterDropdownListEvents() {
    this._dropdownListElement.removeEventListener("keydown", this._checkHide);
    this._dropdownListElement.removeEventListener("keydown", this._checkKeyPress);
    this._dropdownListElement.removeEventListener("click", (evt) => this._checkClickItem(evt));
    this._dropdownListElement.removeEventListener("clickAway", () => this._cancelFiltering());
    this._dropdownListElement.removeEventListener("activeOptionChanged", this._setActiveOption);
    this._dropdownListElement.removeEventListener("input", this._onSearchInput);
  }

  private _handleDropdownListMount = (evt: CustomEvent<HTMLAppDropdownListElement>) => {
    const dropDownListElement = evt.detail;
    const dataIdKV = dropDownListElement.attributes["data-id"];
    if (dataIdKV && dataIdKV.value === this._dropdownListId) {
      this._dropdownListElement = dropDownListElement;
      this._registerDropdownListEvents();
      this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems);
      this._processDropdownValue();
    }
  };

  private get _childDropdownItems(): Node[] {
    const dropdownSlotEl = this.el.shadowRoot.querySelector("slot");
    return dropdownSlotEl.assignedNodes().filter((node) => node instanceof HTMLElement);
  }

  private get _childDropdownOptions(): DropdownOptionModel[] {
    return this._childDropdownItems
      .filter((node) => node.nodeName === "WAREMA-DROPDOWN-OPTION")
      .map((node) => node as unknown as DropdownOptionModel);
  }

  private async _syncOverlaySlotContent(
    dropdownListElement: HTMLAppDropdownListElement,
    dropdownItems: Node[],
    filterValue: string = "",
  ) {
    if (!dropdownListElement) {
      return;
    }

    this._dropdownListElement.dropdownItems = dropdownItems.map((node) => {
      if (node.nodeName === "WAREMA-DROPDOWN-OPTION") {
        const option = node as unknown as DropdownOptionModel;
        const { label, value, icon, iconSrc, multiselect, disabled, selected, active, clustered, size } = option;

        return Object.assign(new DropdownOptionModel(), {
          label,
          value,
          icon,
          iconSrc,
          multiselect,
          disabled,
          selected,
          active,
          clustered,
          size,
        });
      } else if (node.nodeName === "WAREMA-DROPDOWN-GROUP-HEADING") {
        const groupHeading = node as unknown as DropdownGroupHeadingModel;
        const { text } = groupHeading;
        return Object.assign(new DropdownGroupHeadingModel(), {
          text,
        });
      }
    });
    this._dropdownListElement.filterValue = filterValue;
  }

  private _handleDropdownSlotChange(): void {
    this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems);
    this._processDropdownValue();
  }

  private async _cancelFiltering() {
    this.value = this._previousSelectionValue;
    await this._hideListbox();
    this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems);
  }

  private _handlePressAway(evt: MouseEvent) {
    if (evt.button !== 0) {
      return;
    }

    const target: HTMLElement = evt.target as HTMLElement;

    if (target !== this.el && !evt.composedPath().some((t) => t === this.el) && target !== this._dropdownListElement) {
      if (this._isOpen) {
        this._cancelFiltering();
      }
    }
  }

  private async _showListbox() {
    if (this._isOpen || this.disabled) {
      return;
    }

    this._resizeAndPositionDropdownList();
    this._moveLabelOnTop();

    this.isOpen = true;
    await this._dropdownListElement.reveal();
    if (this.search) {
      this._inputSearchElement.focus();
      const isIOS =
        ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
          navigator.platform,
        ) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
      if (!isIOS) {
        this._inputSearchElement.select();
      }
    }
  }

  private async _hideListbox(skipSelectionCheck: boolean = false) {
    if (!this._isOpen) {
      return;
    }

    if (skipSelectionCheck || !this._isSingleAndPreselected()) {
      this._moveLabelToDefault();
    }

    this.isOpen = false;

    if (skipSelectionCheck) {
      this._dropdownListElement.hide();
    } else {
      await this._dropdownListElement.hide();
    }
    this._triggerElement.focus();

    if (this.search) {
      if (!this._isMobileViewport) {
        this._inputSearchElement.setSelectionRange(0, 0);
        this._dropdownListElement.unhighlightDropdownOption(true);
      }
    } else if (this.multiple) {
      this._dropdownListElement.unhighlightDropdownOption(true);
    }
  }

  private _toggleListbox = (evt: MouseEvent) => {
    evt.preventDefault();

    if (evt.button !== 0) {
      return;
    }

    if (this._isOpen) {
      if (!this.search || document.activeElement === this.el) {
        this._hideListbox();
      }
    } else {
      this._showListbox();
    }
  };

  private async _changeDropdownListSelection(element: HTMLAppDropdownOptionElement) {
    if (element.disabled) {
      return;
    }

    const { value } = element;

    if (this.multiple) {
      element.selected = !element.selected;

      const selected = this.value.includes(value);
      if (selected) {
        const currentValue = this.value as string[];
        this.value = currentValue.filter((v) => v !== value);
      } else {
        this.value = [...this.value, value];
      }
    } else {
      if (element.selected) {
        // option already selected, DOMMutationObserver handler will not execute
        // => turning off filtering mode needed
        this._isFiltering = false;
      }
      element.selected = true;
      this.value = value;
    }

    this._previousSelectionValue = this.value;

    this.change.emit(this.value);
  }

  private _getClickedDropdownOption(evt: MouseEvent): HTMLAppDropdownOptionElement {
    const dropdownOptionTarget = evt
      .composedPath()
      .find((target) => target instanceof Node && target.nodeName === "WAREMA-DROPDOWN-OPTION");
    return dropdownOptionTarget as HTMLAppDropdownOptionElement;
  }

  private _getDeselectedOptionList(selectionList: Array<string>): DropdownOptionModel[] {
    return this._childDropdownOptions.filter((dropdownOption) => {
      return !selectionList.some(function (selectionValue) {
        return selectionValue === dropdownOption.value;
      });
    });
  }

  private _selectDropdownOption(optionValue: string): void {
    const preselectedOption = this._childDropdownOptions.find((option) => option.value === optionValue);
    if (preselectedOption) {
      preselectedOption.selected = true;
    }
  }

  private async _checkClickItem(evt: MouseEvent) {
    const clickedOption = this._getClickedDropdownOption(evt);
    if (clickedOption) {
      if (this._previousSelectionValue) {
        if (!this.multiple) {
          await this._hideListbox(!clickedOption.value);
        }
        this._changeDropdownListSelection(clickedOption);
      } else {
        this._changeDropdownListSelection(clickedOption);
        if (!this.multiple) {
          this._hideListbox();
        }
      }
    }
  }

  private _checkShow = (evt: KeyboardEvent) => {
    if (this._isOpen) {
      return;
    }
    const key = evt.key;

    switch (key) {
      case "Up":
      case "ArrowUp":
      case "Down":
      case "ArrowDown":
      case "Enter":
      case " ":
        evt.preventDefault();
        evt.stopImmediatePropagation();
        this._showListbox();
        break;
    }
  };

  private _checkSearchArrowDown = (evt: KeyboardEvent) => {
    if (!this._isOpen || !this.search) {
      return;
    }
    const key = evt.key;
    switch (key) {
      case "Down":
      case "ArrowDown":
        evt.preventDefault();
        this._dropdownListElement.highlightFirstItem();
        this._dropdownListElement.focus();
        break;
    }
  };

  private _checkHide = (evt: KeyboardEvent) => {
    const key = evt.key;

    switch (key) {
      case "Esc":
      case "Escape":
        evt.preventDefault();
        this._cancelFiltering();
        break;
    }
  };

  private _findPreviousOptionElement(startingElement: Element): HTMLAppDropdownOptionElement {
    const previousElement = startingElement.previousElementSibling;
    if (!previousElement) return;
    if (previousElement.nodeName === "WAREMA-DROPDOWN-OPTION") {
      return previousElement as HTMLAppDropdownOptionElement;
    } else {
      return this._findPreviousOptionElement(previousElement);
    }
  }

  private _findNextOptionElement(startingElement: Element): HTMLAppDropdownOptionElement {
    const nextElement = startingElement.nextElementSibling;
    if (!nextElement) return;
    if (nextElement.nodeName === "WAREMA-DROPDOWN-OPTION") {
      return nextElement as HTMLAppDropdownOptionElement;
    } else {
      return this._findNextOptionElement(nextElement);
    }
  }

  private _checkKeyPress = (evt: KeyboardEvent) => {
    const key = evt.key;

    let nextItem = this._activeDescendant;

    if (!nextItem) {
      return;
    }

    switch (key) {
      case "Up":
      case "ArrowUp":
        evt.preventDefault();
        evt.stopPropagation();
        nextItem = this._findPreviousOptionElement(nextItem);
        if (nextItem) {
          this._dropdownListElement.highlightDropdownOption(nextItem, true);
        } else if (this.search) {
          this._dropdownListElement.unhighlightDropdownOption();
          this.el.focus();
        }
        break;
      case "Down":
      case "ArrowDown":
        evt.preventDefault();
        evt.stopPropagation();
        nextItem = this._findNextOptionElement(nextItem);
        if (nextItem) {
          const highlighted = this._dropdownListElement.highlightDropdownOption(nextItem, true);
          if (highlighted === null) {
            this.el.focus();
          }
        }
        break;
      case "Home":
        evt.preventDefault();
        evt.stopPropagation();
        this._dropdownListElement.highlightFirstItem();
        break;
      case "End":
        evt.preventDefault();
        evt.stopPropagation();
        this._dropdownListElement.highlightLastItem();
        break;
      case " ":
      case "Enter":
        evt.preventDefault();
        evt.stopPropagation();
        this._changeDropdownListSelection(nextItem);
        if (!this.multiple) {
          this._hideListbox();
        }
        break;
      case "Tab":
        this._hideListbox();
        evt.preventDefault();
        evt.stopPropagation();
        break;
    }
  };

  private _checkKeyCombination = (evt: KeyboardEvent) => {
    if ((evt.ctrlKey || evt.metaKey) && evt.keyCode == 88) {
      // ctrl + x, ⌘ + x
      this._onSearchInput();
    } else if ((evt.ctrlKey || evt.metaKey) && evt.keyCode == 86) {
      // ctrl + v, ⌘ + v
      this._onSearchInput();
    }
  };

  private _isMultipleAndPreselected() {
    return this.multiple && this.value?.length > 0;
  }

  private _isSingleAndPreselected() {
    return !this.multiple && this.value?.length > 0;
  }

  private _moveLabelOnTop() {
    if (!this.label || this.multiple) {
      return;
    }

    var maxWidth: number;
    if (this._inputWrapperElement) {
      const { width: inputWrapperWidth } = this._inputWrapperElement.getBoundingClientRect();
      const { paddingLeft } = window.getComputedStyle(this._triggerElement);
      maxWidth = inputWrapperWidth - 2 * parseInt(paddingLeft) - 2;
    } else {
      maxWidth = 0;
    }

    this._borderGapWidth = getTopLabelTextWidth(this.labelSpanElement, this.label, maxWidth);
  }

  private _moveLabelToDefault() {
    if (!this.value || !this.label) {
      this._borderGapWidth = 0;
    }
  }

  private labelSpanElement: HTMLSpanElement;

  private _parentNodeMutationObserver: MutationObserver;
  private _slotContentMutationObserver: MutationObserver;
  private _labelElObserver: MutationObserver;

  private _getBackgroundValue(): void {
    const parentNode = this.el.parentNode as HTMLElement;
    const backgroundColor = parentNode?.style?.backgroundColor;
    this._hasTransparentBackground = !backgroundColor || backgroundColor === "transparent";
  }

  private get _hasValue(): boolean {
    return this.value && this.value.length > 0;
  }

  private get _isSelectionOrSearchEmpty(): boolean {
    return this.search ? !this._inputSearchText : !this._hasValue;
  }

  private get _shouldRenderValidationIcon(): boolean {
    return !this.label && this._isSelectionOrSearchEmpty;
  }

  private get _hasValidationState(): boolean {
    return this.invalid || this.warning || this.hasInformation;
  }

  private get _inputText() {
    let inputText = "";
    if (this.multiple && typeof this.value === "object" && this.value.length > 0) {
      inputText = this.multipleSelectionsLabel.replace("{num}", this.value.length.toString());
    } else if (!this.multiple) {
      let option = null;

      if (this._dropdownListElement) {
        option = this._dropdownListElement.dropdownItems.find((dropdownItem) => {
          return dropdownItem instanceof DropdownOptionModel && dropdownItem.value === this.value;
        });
      }

      inputText = option?.label || "";
    }
    return inputText;
  }

  private _renderLabel() {
    return (
      !this._isMultipleAndPreselected() &&
      this.label && (
        <label
          id='Dropdown-label'
          class={`Dropdown-label  ${this.multiple ? "is-multiple" : ""} `}
          ref={(el) => (this.labelSpanElement = el as HTMLSpanElement)}
        >
          {this.label}
        </label>
      )
    );
  }

  private _renderIcon() {
    return (
      (!this._isFiltering || !this._isMobileViewport) && (
        <span class={`Dropdown-arrow ${this._isFiltering ? "filter" : ""}`} onMouseDown={this._clearSearchSelection} />
      )
    );
  }

  private _onSearchInput = () => {
    const { value } = this._inputSearchElement;

    this._isFiltering = this._inputSearchElement.value !== this._inputText;
    this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems, value);
  };

  private get _inputSearchElement(): HTMLInputElement {
    return this._isMobileViewport
      ? this._dropdownListElement.shadowRoot.querySelector("input")
      : (this._triggerElement as HTMLInputElement);
  }

  private get _inputSearchText() {
    if (!this._isFiltering && this._isOpen && !this._inputSearchElement?.value) {
      return "";
    }
    if (this._isFiltering) {
      return this._inputSearchElement?.value;
    }
    return this._inputText;
  }

  private _renderSearchInput() {
    return (
      <input
        id='Dropdown-toggle'
        class={`
                Dropdown-toggle
                ${this.size === "medium" ? "size-large" : "size-small"}
                ${this._isOpen ? "is-open" : ""}
                ${this.multiple ? "is-multiple" : ""}
                `}
        disabled={this.disabled}
        readOnly={!this._isOpen}
        aria-haspopup='listbox'
        aria-expanded={this._isOpen ? "true" : null}
        aria-labelledby='Dropdown-label Dropdown-toggle'
        tabindex='-1'
        placeholder={this._isOpen ? this.searchInputPlaceholder : ""}
        value={this._inputSearchText}
        onInput={this._onSearchInput}
        ref={(el) => (this._triggerElement = el as HTMLInputElement)}
        onFocus={() => this._isOpen && this._inputSearchElement.select()}
      ></input>
    );
  }

  private _renderButton() {
    return (
      <button
        id='Dropdown-toggle'
        class={`
                Dropdown-toggle toggle-button
                ${this.size === "medium" ? "size-large" : "size-small"}
                ${this._isOpen ? "is-open" : ""}
                ${this.multiple ? "is-multiple" : ""}
                ${this.disabled ? "is-disabled" : ""}
                `}
        disabled={this.disabled}
        aria-haspopup='listbox'
        aria-expanded={this._isOpen ? "true" : null}
        aria-labelledby='Dropdown-label Dropdown-toggle'
        tabindex='-1'
        ref={(el) => (this._triggerElement = el)}
      >
        {this._inputText}
      </button>
    );
  }

  private _renderDropdownError() {
    return this._hasValidationState && this.errorText ? (
      <div class='Dropdown-error'>
        <span>{this.errorText}</span>
      </div>
    ) : null;
  }

  private _renderDropdownHint() {
    const { hint, hintLinkHref, hintLinkText } = this;
    if (!hint) {
      return;
    }

    const linkPlacholderLiteral = "${link}";

    const linkPlaceholderIndex = hint.indexOf(linkPlacholderLiteral);
    const placeholderFound = linkPlaceholderIndex > -1;
    const leftHintText = hint.substring(0, linkPlaceholderIndex);
    const rightHintText = placeholderFound ? hint.substring(linkPlaceholderIndex + linkPlacholderLiteral.length) : hint;
    return hint ? (
      <div class='Dropdown-hint'>
        <span>
          {leftHintText}
          {this.hintLinkHref && placeholderFound && <a href={hintLinkHref}>{hintLinkText}</a>}
          {rightHintText}
        </span>
      </div>
    ) : null;
  }

  private _clearSearchSelection = (evt: MouseEvent) => {
    if (!this._isFiltering) {
      return;
    }

    this._inputSearchElement.value = "";
    evt.preventDefault();
    evt.stopPropagation();
    this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems);

    if (!this._isOpen) {
      this._moveLabelToDefault();
    }
  };

  private _handleHostFocus = () => {
    if (this.disabled) {
      return;
    }

    // When the component gets focus, pass focus to the first inner element.
    this._triggerElement.focus();
    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private _handleHostBlur = () => {
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  private _initializeSlotContentSync() {
    this._slotContentMutationObserver = new MutationObserver((mutationList) => {
      if (
        !mutationList.some((record) => {
          const { nodeName } = record.target;
          return nodeName === "WAREMA-DROPDOWN-OPTION" || nodeName === "WAREMA-GROUP-HEADING";
        })
      ) {
        // performance gains
        return;
      }
      if (this.search) {
        const { value } = this._inputSearchElement;
        this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems, value);
        this._isFiltering = false;
      }

      setTimeout(
        () => {
          this._syncOverlaySlotContent(this._dropdownListElement, this._childDropdownItems);
          if (!this.multiple) {
            this._dropdownListElement?.unhighlightDropdownOption();
          }
        },
        this.search ? 200 : null,
      );
    });
    this._slotContentMutationObserver.observe(this.el, {
      attributes: true,
      attributeFilter: ["class", "value", "label", "disabled", "icon", "iconSrc"],
      subtree: true,
    });
  }

  componentWillUpdate() {
    this._processDropdownValue();

    if (this._dropdownListElement) {
      this._dropdownListElement.multiple = this.multiple;
      this._dropdownListElement.size = this.size;
      this._dropdownListElement.clustered = this.clustered;
      this._dropdownListElement.activateFirstItem = !this.search;
      this._dropdownListElement.searchResultPlaceholder = this.searchResultPlaceholder;
      this._dropdownListElement.search = this.search;
      this._dropdownListElement.searchInputValue = this._inputSearchText;
      this._dropdownListElement.searchInputPlaceholder = this.searchInputPlaceholder;
    }
  }

  componentDidUpdate() {
    if (this._isOpen && !this.search) {
      this._dropdownListElement.focus();
    }
  }

  connectedCallback() {
    document.addEventListener("mousedown", (evt) => this._handlePressAway(evt), { capture: true });
    document.addEventListener("appendedToDom", this._handleDropdownListMount);

    const { parentNode } = this.el;
    if (!parentNode) {
      return;
    }

    this._getBackgroundValue();
    this._parentNodeMutationObserver = new MutationObserver(() => this._getBackgroundValue());
    this._parentNodeMutationObserver.observe(parentNode, {
      attributes: true,
      attributeFilter: ["style"],
    });
    this._initializeSlotContentSync();

    this.el.addEventListener("keydown", this._checkShow);
    this.el.addEventListener("keydown", this._checkSearchArrowDown);
    this.el.addEventListener("keydown", this._checkHide);
    this.el.addEventListener("keydown", this._checkKeyCombination);

    this._elementResizeObserver = new ResizeObserver(() => this._resizeAndPositionDropdownList());
    this._elementResizeObserver.observe(this.el);
    this._documentResizeObserver = new ResizeObserver(() => {
      this._resizeAndPositionDropdownList();
    });
    this._documentResizeObserver.observe(document.body);
    window.addEventListener("scroll", this._handleScrollEvents, { capture: true });

    if (this._dropdownListElement) {
      this._unregisterDropdownListEvents();
      this._registerDropdownListEvents();
    }
  }

  async componentWillLoad() {
    await (document as any).fonts.ready;
  }

  componentDidRender() {
    if (this._borderGapInitial && this._borderGapWidth > 0) {
      this._borderGapInitial = false;
    }
  }

  componentDidLoad() {
    if (this._hasValue) {
      (document as any).fonts.ready.then(() => this._moveLabelOnTop());
    }
  }

  disconnectedCallback() {
    this.el.removeEventListener("keydown", this._checkShow);
    this.el.removeEventListener("keydown", this._checkSearchArrowDown);
    this.el.removeEventListener("keydown", this._checkHide);
    this.el.removeEventListener("keydown", this._checkKeyCombination);

    document.removeEventListener("mousedown", (evt) => this._handlePressAway(evt));
    document.removeEventListener("appendedToDom", this._handleDropdownListMount);

    this._parentNodeMutationObserver && this._parentNodeMutationObserver.disconnect();
    this._slotContentMutationObserver && this._slotContentMutationObserver.disconnect();
    this._labelElObserver && this._labelElObserver.disconnect();
    this._elementResizeObserver.disconnect();
    this._documentResizeObserver.disconnect();
    window.removeEventListener("scroll", this._handleScrollEvents);
    this._unregisterDropdownListEvents();

    this._dropdownListElement?.hide();
  }

  render() {
    return (
      <Host
        class={`
                    Dropdown
                    ${this.multiple ? "is-multiple" : ""}
                    ${this.disabled ? "is-disabled" : ""}
                    ${this.label ? "with-label" : ""}
                    ${this.invalid ? "has-message-invalid" : ""}
                    ${this.warning && !this.invalid ? "has-message-warning" : ""}
                    ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                    ${this.value?.length > 0 ? "is-filled" : ""}
                    ${this._isFiltering ? "is-filtering" : ""}
                    ${this._isOpen ? "is-open" : ""}
                    ${this.size === "medium" ? "size-large" : "size-small"}
                    ${this._hasTransparentBackground ? "has-transparent-background" : ""}
                `}
        tabindex={this._tabIndex}
        onBlur={() => this._handleHostBlur()}
        onFocus={() => this._handleHostFocus()}
        focusable
      >
        <div class='Dropdown-wrapper'>
          <div
            class='Dropdown-input'
            ref={(el) => (this._inputWrapperElement = el)}
            onMouseDown={($evt) => this._toggleListbox($evt)}
          >
            {this.search && !this._isMobileViewport && this._renderSearchInput()}
            {(!this.search || this._isMobileViewport) && this._renderButton()}
            {this._renderIcon()}
            {this._renderLabel()}
            <div
              class={`Dropdown-border-gap ${this._borderGapInitial ? "initial" : ""}`}
              style={{ width: `${this._borderGapWidth}px` }}
            ></div>
          </div>
          <div
            class={`
                            Dropdown-optionList
                            ${!this._isOpen ? "is-hidden" : ""}
                        `}
            role='listbox'
            aria-labelledby='Dropdown-label'
            aria-multiselectable={this.multiple ? "true" : null}
            aria-activedescendant={this._activeDescendant?.id}
          >
            <app-dropdown-list
              data-id={this._dropdownListId}
              size={this.size}
              multiple={this.multiple}
              clustered={this.clustered}
              activateFirstItem={!this.search}
              searchResultPlaceholder={this.searchResultPlaceholder}
              search={this.search}
              searchInputValue={this._inputSearchText}
              searchInputPlaceholder={this.searchInputPlaceholder}
            ></app-dropdown-list>
            <div class='slot-container'>
              <slot onSlotchange={() => this._handleDropdownSlotChange()} />
            </div>
          </div>

          {(this.invalid || this.warning) && this._shouldRenderValidationIcon ? (
            <div class='Dropdown-errorIcon-container'>
              <span class='Dropdown-errorIcon'></span>
            </div>
          ) : null}
          {!this.invalid && !this.warning && this._shouldRenderValidationIcon && this.hasInformation ? (
            <div class='Dropdown-infoIcon-container'>
              <span class='Dropdown-infoIcon'></span>
            </div>
          ) : null}
        </div>
        {this._renderDropdownError()}
        {this._renderDropdownHint()}
      </Host>
    );
  }
}
