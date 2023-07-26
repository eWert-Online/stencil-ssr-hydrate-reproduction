import { Component, h, Host, Prop, State, Element, Watch } from "@stencil/core";

/**
 * @slot *default* - A list of <app-press-excerpt-list-item> to display
 * @slot intro - The module-intro to display above this module (optional)
 */
@Component({
  tag: "app-press-excerpt-list",
  styleUrl: "press-excerpt-list.scss",
  shadow: true,
})
export class AppPressExcerptList {
  @Element() el: HTMLAppPressExcerptListElement;

  /**
   * The number of items to display on a page
   */
  @Prop() itemsPerPage = 3;

  /**
   * If this module should imediately query the api for new press excerpts
   */
  @Prop() searchOnLoad?: boolean = false;

  /**
   * The total number of items in this list
   */
  @Prop({ mutable: true }) total!: number;

  /**
   * The base api url to request the news from.
   * `/{language}/news` will be appended.
   */
  @Prop() apiUrl!: string;

  /**
   * An optional url prefix which is prepended to the href of the news item coming from caas
   */
  @Prop() caasItemUrlPrefix = "";

  /**
   * The language to fetch the news in.
   */
  @Prop() language: "en" | "fr" | "de" | "ch" | "at" = "de";

  /**
   * A comma separated list of uuids of the categories, which should be shown in this list
   */
  @Prop() categories: string = "";

  /**
   * A comma separated list of uuids of the tags, which should be shown in this list
   */
  @Prop() tags: string = "";

  /**
   * The filter to be sent to the api. This overwrites the categories and tags prop.
   */
  @Prop() filter: string = "";

  @State() fetching = false;

  @State() didFetch = false;

  @State() excerpts = [];

  private offset = 0;

  private fetchExcerpts = async () => {
    this.fetching = true;

    const container = this.el.shadowRoot.querySelector(".PressExcerptList-items") as HTMLElement;
    const awaitTransition = new Promise((resolve) => {
      const reset = () => {
        container.removeEventListener("transitionend", reset);
        resolve(true);
      };
      container.addEventListener("transitionend", reset);
    });

    const categories = this.categories
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category !== "");

    const tags = this.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    let filter = "";
    if (this.filter) {
      filter = this.filter;
    } else if (categories.length > 0 && tags.length > 0) {
      filter = JSON.stringify({
        categories: {
          $in: categories,
        },
        tags: {
          $in: tags,
        },
      });
    } else if (categories.length > 0) {
      filter = JSON.stringify({
        categories: {
          $in: categories,
        },
      });
    } else if (tags.length > 0) {
      filter = JSON.stringify({
        tags: {
          $in: tags,
        },
      });
    }

    const baseURL = `${this.apiUrl}/${this.language}/entities/pressExcerpts`;
    const pagesize = this.itemsPerPage;
    const page = Math.ceil(this.offset / this.itemsPerPage) + 1;
    const url = `${baseURL}?pagesize=${pagesize}&page=${page}&filter=${filter}`;
    const json = await fetch(url, {
      headers: new Headers({ "content-type": "application/json" }),
    }).then((response) => response.json());

    await awaitTransition;
    this.total = json.total;
    this.excerpts = json.entities;
    this.fetching = false;
    this.didFetch = true;
  };

  private handlePageChange = async (e: CustomEvent<number>) => {
    this.offset = e.detail;
    this.fetchExcerpts();
  };

  @Watch("categories")
  categoriesChanged() {
    this.offset = 0;
    this.fetchExcerpts();
  }

  @Watch("filter")
  filterChanged() {
    this.offset = 0;
    this.fetchExcerpts();
  }

  async componentDidLoad() {
    if (this.searchOnLoad) {
      this.offset = 0;
      this.fetchExcerpts();
    }
  }

  render() {
    return (
      <Host
        class={`
                    PressExcerptList
                    ${this.fetching ? "PressExcerptList--fetching" : "PressExcerptList--fetched"}
                `}
      >
        <slot name='intro' />
        <div class='PressExcerptList-items'>
          {this.didFetch ? (
            this.excerpts.map((excerpt) => {
              const date = new Date(excerpt.date).toLocaleDateString(this.language, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });

              return (
                <app-press-excerpt-list-item
                  key={excerpt.href}
                  date={date}
                  headline={excerpt.headline}
                  subheadline={excerpt.subheadline}
                  href={this.caasItemUrlPrefix + excerpt.href}
                  target={excerpt.target}
                >
                  <app-image
                    slot='image'
                    alt={excerpt.image.alt || ""}
                    xsmall={excerpt.image.src.xsmall}
                    small={excerpt.image.src.small}
                    medium={excerpt.image.src.medium}
                    large={excerpt.image.src.large}
                    xlarge={excerpt.image.src.xlarge}
                  />
                  <span innerHTML={excerpt.text} />
                </app-press-excerpt-list-item>
              );
            })
          ) : (
            <slot />
          )}
        </div>
        <app-pagination
          class='PressExcerptList-pagination'
          total={this.total}
          limit={this.itemsPerPage}
          onStPageChange={this.handlePageChange}
        />
      </Host>
    );
  }
}
