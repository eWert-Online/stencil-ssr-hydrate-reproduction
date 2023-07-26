import {
  Component,
  Host,
  h,
  Prop,
  State,
  ComponentDidLoad,
  Element,
  Watch,
  EventEmitter,
  Event,
  Method,
} from "@stencil/core";
import { observeDom } from "../../utils/utils";

class Option {
  value: string;
  label: string;
  element: HTMLAppSelectOptionElement;
  index: number;
}

@Component({
  tag: "app-select",
  styleUrl: "select.scss",
  shadow: true,
})
export class AppSelect implements ComponentDidLoad {
  @Element() private _element: HTMLAppSelectElement;

  /**
   * value
   */
  @Prop() public value;
  /**
   * active
   */
  @Prop() public active = false;
  /**
   * multiple
   */
  @Prop() public multiple = false;
  /**
   * valueChange
   */
  @Event() public valueChange: EventEmitter<any>;
  /**
   * open select
   */
  @Method()
  public async open() {
    this.active = true;
  }
  /**
   * close select
   */
  @Method()
  public async close() {
    this.active = false;
  }
  /**
   * toggle select to open / close
   */
  @Method()
  public async toggle() {
    this.active = !this.active;
  }

  @State() private _focusedOptionIndex: number = -1;

  @State() private _options: Array<Option> = [];

  public get activeOption() {
    return this._options.filter((x) => x.value === this.value)[0];
  }

  public get activeIndex() {
    return this.activeOption.index;
  }

  public componentDidLoad() {
    observeDom(this._element, () => this._updateOptions());
    this._updateOptions();
    this.multipleChangedHandler();
    this.valueChange.emit(this.value);
  }

  private _updateOptions() {
    const options = this._element.querySelectorAll("app-select-option");
    this._options = [];
    options.forEach((option, index) => {
      option.onclick = (e: MouseEvent) => {
        this._chooseValue((e.target as HTMLAppSelectOptionElement).value);
      };

      this._options.push({
        value: option.value,
        label: option.label,
        element: option,
        index: index,
      });
    });
  }

  // set the active option as focused option when opened or remove it when closed
  @Watch("active")
  public updateFocus(active: boolean) {
    if (active) {
      this._focusedOptionIndex = this.activeIndex;
    } else {
      this._focusedOptionIndex = -1;
    }
  }

  @Watch("value")
  public setActiveOption() {
    this._options.forEach((option) => {
      if (this.activeOption.index === option.index) {
        option.element.activate();
      } else {
        option.element.deactivate();
      }
    });
    this.valueChange.emit(this.value);
  }

  // set the focused property on all option element
  @Watch("_focusedOptionIndex")
  public focusedOptionChanged(focusedIndex: number) {
    this._options.forEach((option) => {
      if (focusedIndex >= 0 && option.index === this._focusedOptionIndex) {
        option.element.select();
      } else {
        option.element.deselect();
      }
    });
  }

  @Watch("multiple")
  public multipleChangedHandler() {
    this._options.map((x) => (x.element.multiple = this.multiple));
  }
  // one approach to fix Eslint 'react/jsx-no-bind warning JSX props should not use arrow functions'
  private _openSelect = () => {
    this.open();
  };
  // one approach to fix Eslint 'react/jsx-no-bind warning JSX props should not use arrow functions'
  private _closeSelect = () => {
    this.close();
  };
  // one approach to fix Eslint 'react/jsx-no-bind warning JSX props should not use arrow functions'
  private _stopEventPropagation = ($event: Event) => {
    $event.stopPropagation();
  };

  public render() {
    return (
      <Host tabindex='0' onKeydown={this._handleKey}>
        <div class='value' onClick={this._openSelect}>
          {this.activeOption?.label}
          <div class='arrow'>
            <div></div>
          </div>
        </div>
        <div class={"overlay" + " " + (this.active ? "active" : "")} onClick={this._closeSelect}>
          <div class='options' onClick={this._stopEventPropagation}>
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }

  private _handleKey = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case 9:
        this.close();
        break;
      case 13:
      case 32:
        if (!this.active) {
          this.open();
        } else {
          this.value = this._options[this._focusedOptionIndex].value;
          this.close();
        }
        break;
      case 27: {
        this.close();
        break;
      }
      case 37:
        if (!this.active) {
          this._choosePrevious();
        }
        break;
      case 39:
        if (!this.active) {
          this._chooseNext();
        }
        break;
      case 38:
        this.active ? this._focusPrevious() : this._choosePrevious();
        break;
      case 40:
        this.active ? this._focusNext() : this._chooseNext();
        break;
    }
  };

  private _focusNext() {
    if (this._focusedOptionIndex < this._options.length - 1) {
      this._focusedOptionIndex += 1;
    }
  }

  private _focusPrevious() {
    if (this._focusedOptionIndex > 0) {
      this._focusedOptionIndex -= 1;
    }
  }

  private _chooseNext() {
    if (this.activeIndex < this._options.length - 1) {
      this.value = this._options[this.activeIndex + 1].value;
    }
  }

  private _choosePrevious() {
    if (this.activeIndex > 0) {
      this.value = this._options[this.activeIndex - 1].value;
    }
  }

  private _chooseValue(value: any) {
    if (this.multiple) {
      this._addMultipleValue(value);
    } else {
      this.value = value;
      this.close();
    }
  }

  private _addMultipleValue(value: any) {
    if (!Array.isArray(this.value)) {
      this.value = [];
    }

    this.value.push(value);
  }
}
