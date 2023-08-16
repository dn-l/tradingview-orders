// Official tutorial was used as a guideline
// https://tradingview.github.io/lightweight-charts/tutorials/react/advanced

import {
  ChartOptions,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  MouseEventHandler,
  SeriesDataItemTypeMap,
  SeriesMarker,
  SeriesPartialOptionsMap,
  SeriesType,
  Time,
  createChart,
} from 'lightweight-charts';
import {
  PropsWithChildren,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

class Lazy<T> {
  private _val: T | null = null;
  get val(): T {
    if (this._val === null) {
      this._val = this.createVal();
    }
    return this._val;
  }

  dispose() {
    if (this._val === null) {
      return;
    }
    this.disposeVal(this._val);
    this._val = null;
  }

  constructor(
    private createVal: () => T,
    private disposeVal: (val: T) => void
  ) {}
}

const context = createContext<Lazy<IChartApi> | null>(null);

interface ChartContainerProps extends DeepPartial<ChartOptions> {
  container: HTMLElement;
  onClick?: MouseEventHandler;
}

const ChartContainer = forwardRef<
  IChartApi,
  PropsWithChildren<ChartContainerProps>
>(({ children, container, layout, onClick, ...rest }, ref) => {
  const chartApiRef = useRef(
    new Lazy(
      () =>
        createChart(container, {
          ...rest,
          layout,
          width: container.clientWidth,
          height: container.clientHeight,
        }),
      (val) => val.remove()
    )
  );

  useLayoutEffect(() => {
    const chart = chartApiRef.current;

    const handleResize = () => {
      chart.val.applyOptions({
        ...rest,
        width: container.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    const currentRef = chartApiRef.current;
    currentRef.val.applyOptions({ ...rest, layout });
  }, [rest, layout]);

  useLayoutEffect(() => {
    if (!onClick) {
      return;
    }
    chartApiRef.current.val.subscribeClick(onClick);

    return () => chartApiRef.current.val.unsubscribeClick(onClick);
  }, [onClick, chartApiRef.current]);

  useImperativeHandle(ref, () => chartApiRef.current.val, []);

  return (
    <context.Provider value={chartApiRef.current}>{children}</context.Provider>
  );
});
ChartContainer.displayName = 'ChartContainer';

export const Chart = ({
  className,
  ...props
}: DeepPartial<ChartOptions> &
  PropsWithChildren<{ className?: string; onClick?: MouseEventHandler }>) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const handleRef = useCallback((ref: HTMLDivElement) => setContainer(ref), []);

  return (
    <div ref={handleRef} className={className}>
      {container && <ChartContainer {...props} container={container} />}
    </div>
  );
};

const seriesContext = createContext<Lazy<ISeriesApi<SeriesType>> | null>(null);

export const Series = forwardRef<
  Lazy<ISeriesApi<SeriesType>>,
  SeriesPartialOptionsMap[SeriesType] &
    PropsWithChildren<{
      type: SeriesType;
      data: SeriesDataItemTypeMap[SeriesType][];
    }>
>(({ children, data, type, ...rest }, ref) => {
  const parent = useContext(context);
  const ctx = useRef(
    parent
      ? new Lazy(
          () => {
            if (type !== 'Candlestick') {
              throw new Error('Unkown type');
            }
            const api = parent.val.addCandlestickSeries(
              rest
            ) as ISeriesApi<SeriesType>;
            api.setData(data);

            return api;
          },
          () => parent?.dispose()
        )
      : null
  );

  useLayoutEffect(() => {
    const currentRef = ctx.current;
    if (currentRef === null) {
      return;
    }
    currentRef.val;

    return () => currentRef.dispose();
  }, []);

  useLayoutEffect(() => {
    const currentRef = ctx.current;
    if (currentRef === null || currentRef.val === null) {
      return;
    }
    currentRef.val.applyOptions(rest);
  }, []);

  useImperativeHandle(ref, () => ctx.current!, []);

  return (
    <seriesContext.Provider value={ctx.current}>
      {children}
    </seriesContext.Provider>
  );
});
Series.displayName = 'Series';

export const Markers = ({ data }: { data: SeriesMarker<Time>[] }) => {
  const series = useContext(seriesContext);
  useLayoutEffect(() => {
    if (series === null) {
      return;
    }
    series.val.setMarkers(data);
  }, [series, data]);

  useEffect;

  return <></>;
};
Markers.displayName = 'Markers';
