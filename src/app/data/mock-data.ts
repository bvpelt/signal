export type card = {
  id: number;
  title: string;
  image: string;
  description: string;
  price: number;
}

export const CARDS: card[] = [
  {
    id: 1,
    title: 'Apple',
    image: 'apple.jpg',
    description: 'Fresh red apple',
    price: 1.2,
  },
  {
    id: 2,
    title: 'Orange',
    image: 'orange.jpeg',
    description: 'Fresh orange',
    price: 1.5,
  },
  {
    id: 3,
    title: 'Grapes',
    image: 'grapes.jpg',
    description: 'Blue grapes',
    price: 2.5,
  },
];
