import { SeriesMarker } from 'lightweight-charts';

export interface Order extends SeriesMarker<string> {
  id: string;
  date: Date;
  type: 'Buy' | 'Sell';
  price: string;
}
