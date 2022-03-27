import Head from 'next/head';
import {
  XYPlot,
  LineSeries,
  AreaSeries,
  HorizontalGridLines,
  VerticalGridLines,
  XAxis,
  YAxis,
} from 'react-vis';

import dayjs from 'dayjs';
import { useState, useEffect, useRef } from 'react';
import { callApi } from '../utils/callApi';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function Home() {
  const [data, setData] = useState([{ x: new Date().getTime(), y: 0 }]);
  const [level, setLevel] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [lastAlertValue, setLastAlertValue] = useState(0);
  useInterval(() => {
    // const mul = ve
    let value = 100;
    if (level === 0) {
      const min = 0,
        max = 94;
      value = Math.floor(Math.random() * (max - min + 1) + min);
    } else if (level === 1) {
      const min = 95,
        max = 99;
      value = Math.floor(Math.random() * (max - min + 1) + min);
    }
    const newData = {
      x: new Date().getTime(),
      y: value,
    };
    setCurrentValue(value);
    console.log('newData', newData);
    setData([...data, newData]);
    console.log(data);
  }, 3000);

  useEffect(() => {
    console.log('CurrentValue', currentValue, 'lastAlertValue', lastAlertValue);
    let call = false;
    if (currentValue === 100 && lastAlertValue !== 100) {
      call = true;
    } else if (
      currentValue >= 95 &&
      (lastAlertValue < 95 || lastAlertValue === 100)
    ) {
      call = true;
    } else if (currentValue < 95 && lastAlertValue >= 95) {
      call = true;
    }
    console.log(call);
    if (call) {
      setLastAlertValue(currentValue);
      callApi({
        senderName: 'CMI_Network Syslog',
        timestamp: '2012-04-23T18:25:43.511Z',
        serviceName: 'Alert_IP Transit',
        typeOfService: 'Global IPT',
        circuitId: 'THCA0001',
        trafficUtilization: currentValue,
      });
    }
  }, [currentValue]);
  return (
    <div>
      <Head>
        <title>Monitoring Alert</title>
        <meta name="description" content="Monitoring Alert" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <p>THCA0001 - Traffic Utilization: {currentValue}%</p>
        <XYPlot height={300} width={300}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis
            title="Time"
            tickFormat={(v) => `${dayjs(v).format('HH:mm:ss')}`}
            tickLabelAngle={-25}
          />
          <YAxis title="%" />
          <AreaSeries data={data} color="#cd3b54" />
        </XYPlot>
        <button
          onClick={() => {
            setLevel(0);
          }}
        >
          Normal
        </button>
        <button
          onClick={() => {
            setLevel(1);
          }}
        >
          High
        </button>
        <button
          onClick={() => {
            setLevel(2);
          }}
        >
          Critical
        </button>
      </>
    </div>
  );
}
