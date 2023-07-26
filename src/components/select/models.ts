export class AppSelectOption {
  type = "option";
  value: any;
  label: string;
}

export class AppSelectOptionGroup {
  type = "group";
  options: Array<AppSelectOption>;
}

export type AppSelectItem = AppSelectOption | AppSelectOptionGroup;
