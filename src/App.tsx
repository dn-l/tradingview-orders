import { useReducer, useRef, useState } from 'react';
import { Chart, Markers, Series } from './Chart';
import * as mocks from './mocks';
import {
  ChartOptions,
  ColorType,
  CrosshairMode,
  DeepPartial,
  MouseEventHandler,
} from 'lightweight-charts';
import { DialogModifyOrders } from './DialogModifyOrders';
import { getOrderClassNames, reducer } from './reducer';

const CHART_OPTS: DeepPartial<ChartOptions> = {
  layout: {
    background: {
      type: ColorType.Solid,
      color: 'black',
    },
    textColor: 'lightgrey',
  },
  grid: {
    vertLines: {
      color: 'rgba(128, 128, 128, 0.4)',
    },
    horzLines: {
      color: 'rgba(128, 128, 128, 0.4)',
    },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  rightPriceScale: {
    borderColor: 'rgba(128, 128, 128, 0.8)',
  },
  timeScale: {
    borderColor: 'rgba(128, 128, 128, 0.8)',
  },
};

const last = { ...mocks.series[mocks.series.length - 1] };

function App() {
  const [state, dispatch] = useReducer(reducer, { orders: mocks.orders });
  const ref = useRef(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const handleClick: MouseEventHandler = (e) =>
    setSelectedTime((e.time ?? last.time) as string);
  const orders = state.orders.map((o) => ({
    ...o,
    text: `${o.type} @ ${o.price}`,
  }));
  const selectedOrders = selectedTime
    ? orders.filter((o) => o.time === selectedTime)
    : [];

  return (
    <>
      <div className="absolute top-2 left-2 z-10 card card-compact bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-accent">USDC/DEEZ</h1>
          {orders.length > 0 ? (
            <>
              <p>
                <i>Active orders:</i>
              </p>
              <table className="table table-xs">
                <tbody>
                  {orders.map(({ id, time, type, text }) => (
                    <tr key={id}>
                      <td className="pl-0">{time.toLocaleString()}</td>
                      <td className={`pr-0 ${getOrderClassNames(type)}`}>
                        {text}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-right text-xs text-base-content/60">
                Total: {orders.length}
              </p>
            </>
          ) : (
            'No active orders'
          )}
        </div>
      </div>

      <Chart {...CHART_OPTS} className="w-full h-screen" onClick={handleClick}>
        <Series
          ref={ref}
          type="Candlestick"
          data={mocks.series}
          crosshairMarkerVisible
        >
          <Markers data={orders} />
        </Series>
      </Chart>

      {selectedTime !== null && (
        <DialogModifyOrders
          time={selectedTime}
          onClose={() => setSelectedTime(null)}
          orders={selectedOrders}
          dispatch={dispatch}
        />
      )}
    </>
  );
}

export default App;
