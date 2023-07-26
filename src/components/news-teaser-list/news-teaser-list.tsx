import { Component, h, Host, Prop, State, Watch, Element } from "@stencil/core";
import breakpoints from "../../utils/breakpoints";

/**
 * @slot *default* - A list of <app-news-teaser> to display
 * @slot intro - The module-intro to display above this module (optional)
 */
@Component({
  tag: "app-news-teaser-list",
  styleUrl: "news-teaser-list.scss",
  shadow: true,
})
export class AppNewsTeaserList {
  @Element() el: HTMLAppNewsTeaserListElement;

  /**
   * If the teasers' text content should be converted to plain text
   */
  @Prop() plainText: boolean = false;

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

  @State() fetching = false;

  @State() didFetch = false;

  @State() news = [];

  @State() slottedElements = [];

  private offset = 0;

  private fetchNews = async () => {
    const categories = this.categories
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category !== "");

    let filter = "";
    if (categories.length > 0) {
      filter = JSON.stringify({
        categories: {
          $in: categories,
        },
      });
    }

    const baseURL = `${this.apiUrl}/${this.language}/entities/news`;
    const pagesize = this.itemsPerPage;
    const page = Math.ceil(this.offset / this.itemsPerPage) + 1;
    const url = `${baseURL}?pagesize=${pagesize}&page=${page}&filter=${filter}`;
    const json = await fetch(url, {
      headers: new Headers({ "content-type": "application/json" }),
    }).then((response) => response.json());
    this.didFetch = true;
    return json;
  };

  private getItemsPerPage = () => {
    if (window.innerWidth >= breakpoints.medium) {
      return 3;
    }

    if (window.innerWidth >= breakpoints.websiteSmall) {
      return 2;
    }

    return 1;
  };

  @State() itemsPerPage = this.getItemsPerPage();

  private handlePageChange = async (e: CustomEvent<number>) => {
    const container = this.el.shadowRoot.querySelector(".NewsTeaserList-items") as HTMLElement;
    const awaitTransition = new Promise((resolve) => {
      const reset = () => {
        container.removeEventListener("transitionend", reset);
        resolve(true);
      };
      container.addEventListener("transitionend", reset);
    });
    this.fetching = true;
    this.offset = e.detail;
    const [data] = await Promise.all([this.fetchNews(), awaitTransition]);
    this.total = data.total;
    this.news = data.entities;
    this.fetching = false;
  };

  private setItemsPerPage = () => {
    const newItemsPerPage = this.getItemsPerPage();
    if (this.itemsPerPage !== newItemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
    }
  };

  @Watch("itemsPerPage")
  watchHandler(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.fetching = true;
      this.fetchNews().then((data) => {
        this.total = data.total;
        this.news = data.entities;
        this.fetching = false;
      });
    }
  }

  connectedCallback() {
    window.addEventListener("resize", this.setItemsPerPage);
  }

  componentDidLoad() {
    this.slottedElements = Array.from(this.el.shadowRoot.querySelectorAll("slot"))
      .find((slot) => !slot.name)
      ?.assignedElements();
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.setItemsPerPage);
  }

  render() {
    return (
      <Host
        class={`
                    NewsTeaserList
                    ${this.fetching ? "NewsTeaserList--fetching" : "NewsTeaserList--fetched"}
                `}
      >
        <slot name='intro' />
        <div class='NewsTeaserList-items'>
          {this.didFetch
            ? this.news.map((news) => {
                const date = new Date(news.date).toLocaleDateString(this.language, {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                });
                return (
                  <app-news-teaser
                    key={news.href}
                    date={date}
                    headline={news.headline}
                    href={this.caasItemUrlPrefix + news.href}
                    link-text={news["link-text"]}
                    plainText={this.plainText}
                  >
                    <app-image
                      slot='image'
                      alt={news.image.alt || ""}
                      xsmall={news.image.src.xsmall}
                      small={news.image.src.small}
                      medium={news.image.src.medium}
                      large={news.image.src.large}
                      xlarge={news.image.src.xlarge}
                    />
                    <span innerHTML={news.text} />
                    <app-social-share-bar slot='share-bar'>
                      {news["share-bar"].platforms.map((platform) => (
                        <app-social-share-platform
                          type={platform.type}
                          text={platform.text}
                          url={new URL(news.href, window.location.origin).href}
                        ></app-social-share-platform>
                      ))}
                    </app-social-share-bar>
                  </app-news-teaser>
                );
              })
            : this.slottedElements.slice(0, this.itemsPerPage).map((news) => {
                return (
                  <app-news-teaser
                    key={news.href}
                    date={news.date}
                    headline={news.headline}
                    href={news.href}
                    target={news.target}
                    linkText={news.linkText}
                    plainText={this.plainText}
                    innerHTML={news.innerHTML}
                  />
                );
              })}
        </div>
        <app-pagination
          class='NewsTeaserList-pagination'
          total={this.total}
          limit={this.itemsPerPage}
          onStPageChange={this.handlePageChange}
        />
        <div style={{ display: "none" }}>
          <slot />
        </div>
      </Host>
    );
  }
}
