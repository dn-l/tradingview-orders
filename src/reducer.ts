import { Order } from './types';

export enum ActionType {
  AddOrder,
  CancelOrder,
  UpdateOrder,
}

interface State {
  orders: Order[];
}

export const getOrderClassNames = (type: Order['type']) =>
  type === 'Buy' ? 'text-lime-500' : 'text-red-500';

export type Action =
  | {
      type: ActionType.AddOrder;
      payload: Pick<Order, 'type' | 'time' | 'price'>;
    }
  | { type: ActionType.CancelOrder; payload: string }
  | { type: ActionType.UpdateOrder; payload: Order };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.AddOrder:

    console.log({
      id: crypto.randomUUID(),
      ...action.payload,
      position: action.payload.type === 'Buy' ? 'belowBar' : 'aboveBar',
      shape: 'circle',
      color: getOrderClassNames(action.payload.type),
      date: new Date(action.payload.time),
    })
      return {
        ...state,
        orders: [
          ...state.orders,
          {
            id: crypto.randomUUID(),
            ...action.payload,
            position: action.payload.type === 'Buy' ? 'belowBar' : 'aboveBar',
            shape: 'circle',
            color: action.payload.type === 'Buy' ? 'lime' : 'orangered',
            date: new Date(action.payload.time),
          } satisfies Order,
        ].sort((a, b) => a.date.getTime() - b.date.getTime()),
      };
    case ActionType.CancelOrder:
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.payload),
      };
    case ActionType.UpdateOrder:
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? action.payload : o
        ),
      };

    default:
      return state;
  }
};
