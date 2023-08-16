import { Dispatch, FormEventHandler, useRef, useState } from 'react';
import { Dialog, DialogProps } from './Dialog';
import { Action, ActionType, getOrderClassNames } from './reducer';
import { Order } from './types';

const NewOrderForm = ({
  dispatch,
  time,
}: {
  dispatch: Dispatch<Action>;
  time: string;
}) => {
  const [price, setPrice] = useState('');
  const [type, setType] = useState<Order['type']>('Buy');
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!Number(price)) {
      return;
    }
    dispatch({
      type: ActionType.AddOrder,
      payload: { time, type, price },
    });
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="my-8 flex gap-4 items-center">
      <div className="join">
        <button
          className={`btn join-item ${type === 'Buy' ? 'btn-success' : ''}`}
          type="button"
          onClick={() => setType('Buy')}
        >
          Buy
        </button>
        <button
          className={`btn join-item ${type === 'Sell' ? 'btn-error' : ''}`}
          type="button"
          onClick={() => setType('Sell')}
        >
          Sell
        </button>
      </div>
      <input
        autoFocus
        id="new-order-price"
        name="new-order-price"
        placeholder="Price"
        className="input input-bordered w-full max-w-xs"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Create Order
      </button>
    </form>
  );
};

enum OrderRowState {
  View,
  PendingCancellationConfirmation,
  Updating,
}

const OrderRow = ({
  order,
  dispatch,
}: {
  order: Order;
  dispatch: Dispatch<Action>;
}) => {
  const priceRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<OrderRowState>(OrderRowState.View);
  const [priceVal, setPriceVal] = useState(order.price);

  return (
    <tr>
      <td className={`pl-0  ${getOrderClassNames(order.type)}`}>
        {order.type}
      </td>
      <td className="w-full">
        <div
          ref={priceRef}
          className={`px-2 ${
            state === OrderRowState.Updating
              ? 'ring ring-primary rounded outline-none'
              : ''
          }`}
          contentEditable={state === OrderRowState.Updating}
          suppressContentEditableWarning
          onBlur={(e) => {
            if (e.target.textContent !== null && Number(e.target.textContent)) {
              setPriceVal(e.target.textContent);
            } else {
              e.target.textContent = order.price;
            }
          }}
        >
          {priceVal}
        </div>
      </td>
      <td className="pr-0 flex gap-1 items-center">
        {state === OrderRowState.View ? (
          <>
            <button
              className="btn btn-ghost btn-xs w-20"
              type="button"
              onClick={() => setState(OrderRowState.Updating)}
            >
              Modify
            </button>
            <button
              className="btn btn-ghost btn-xs w-20"
              type="button"
              onClick={() =>
                setState(OrderRowState.PendingCancellationConfirmation)
              }
            >
              Cancel
            </button>
          </>
        ) : state === OrderRowState.Updating ? (
          <>
            <button
              className="btn btn-ghost btn-xs w-20"
              type="button"
              onClick={() => {
                setPriceVal(order.price);
                setState(OrderRowState.View);
                if (priceRef.current !== null) {
                  priceRef.current.textContent = order.price;
                }
              }}
            >
              Dismiss
            </button>
            <button
              className="btn btn-primary btn-xs w-20"
              type="button"
              onClick={() => {
                dispatch({
                  type: ActionType.UpdateOrder,
                  payload: { ...order, price: priceVal },
                });
                setState(OrderRowState.View);
              }}
            >
              Update
            </button>
          </>
        ) : state === OrderRowState.PendingCancellationConfirmation ? (
          <>
            <button
              className="btn btn-ghost btn-xs w-20"
              type="button"
              onClick={() => setState(OrderRowState.View)}
            >
              Dismiss
            </button>
            <button
              className="btn btn-error btn-xs w-20"
              type="button"
              onClick={() => {
                dispatch({
                  type: ActionType.CancelOrder,
                  payload: order.id,
                });
                setState(OrderRowState.View);
              }}
            >
              Confirm
            </button>
          </>
        ) : null}
      </td>
    </tr>
  );
};

export const DialogModifyOrders = ({
  time,
  orders,
  dispatch,
  ...props
}: DialogProps & {
  time: string;
  orders: Order[];
  dispatch: Dispatch<Action>;
}) => {
  return (
    <Dialog {...props}>
      <h3 className="font-bold text-lg">Orders for {time.toLocaleString()}</h3>
      {orders.length > 0 ? (
        <table className="table">
          <tbody>
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} dispatch={dispatch} />
            ))}
          </tbody>
        </table>
      ) : null}
      <NewOrderForm time={time} dispatch={dispatch} />
    </Dialog>
  );
};
