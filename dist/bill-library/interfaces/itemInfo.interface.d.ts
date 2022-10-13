export interface ItemInfo {
    price: number;
    quantity: number;
    subcategoryId: string;
    categoryId: string;
    itemId: string;
    addons: Addons[];
    variants: Variants[];
}
export interface Addons {
    id: string;
    price: number;
    quantity: number;
}
export interface Variants {
    groupId: string;
    options: Options[];
}
export interface Options {
    optionsId: string;
    price: number;
}
