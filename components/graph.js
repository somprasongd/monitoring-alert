import {
  XYPlot,
  AreaSeries,
  HorizontalGridLines,
  VerticalGridLines,
  XAxis,
  YAxis,
} from 'react-vis';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Avatar, Card, Col, Radio, Row, Typography } from 'antd';
import { callAlertApi } from '../utils/callApi';
import { useInterval } from '../utils/useInterval';

const { Text } = Typography;

export default function Graph({ client, isShowSimBtn = false, interval = 2 }) {
  const [data, setData] = useState([{ x: new Date().getTime(), y: 0 }]);
  const [level, setLevel] = useState('random');
  const [currentValue, setCurrentValue] = useState(0);
  const [lastAlertValue, setLastAlertValue] = useState(0);

  useInterval(() => {
    let min, max, value;
    switch (level) {
      case 'random': // random
        min = 1;
        max = 100;
        value = Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case 'normal': // normal
        min = 1;
        max = 69;
        value = Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case 'warining': // warining
        min = 70;
        max = 89;
        value = Math.floor(Math.random() * (max - min + 1) + min);
        break;
      default: // critical
        min = 90;
        max = 100;
        value = Math.floor(Math.random() * (max - min + 1) + min);
        break;
    }
    const newData = {
      x: new Date().getTime(),
      y: value,
    };
    setCurrentValue(value);
    setData([...data, newData]);
  }, interval * 1000);

  useEffect(() => {
    let isAlert = false;
    if (currentValue >= 90 && lastAlertValue < 90) {
      isAlert = true;
    } else if (
      currentValue >= 70 &&
      (lastAlertValue < 70 || lastAlertValue >= 90)
    ) {
      isAlert = true;
    } else if (currentValue < 70 && lastAlertValue >= 70) {
      isAlert = true;
    }

    if (isAlert) {
      setLastAlertValue(currentValue);
      callAlertApi({
        senderName: client.senderName,
        timestamp: new Date().toISOString(),
        serviceName: client.serviceName,
        typeOfService: client.typeOfService,
        circuitId: client.circuitId,
        trafficUtilization: currentValue,
      });
    }
  }, [currentValue]);

  return (
    <>
      <Card
        title={
          <>
            <Text>{client.circuitId} - Traffic Utilization </Text>
            <Avatar
              size={40}
              style={{
                verticalAlign: 'middle',
                color:
                  currentValue >= 90
                    ? '#ff4d4f'
                    : currentValue >= 70
                    ? '#fa8c16'
                    : '#237804',
                backgroundColor:
                  currentValue === 90
                    ? '#ffa39e'
                    : currentValue >= 70
                    ? '#ffd591'
                    : '#95de64',
              }}
            >
              {currentValue}
            </Avatar>
          </>
        }
        style={{ width: 550, textAlign: 'center' }}
      >
        <Row>
          <Col>
            <XYPlot height={300} width={500}>
              <VerticalGridLines />
              <HorizontalGridLines />
              <XAxis
                title="Time"
                tickTotal={10}
                tickSize={5}
                tickFormat={(v) => `${dayjs(v).format('HH:mm:ss')}`}
                tickLabelAngle={-25}
                style={{
                  line: { stroke: '#ADDDE1' },
                  // ticks: { stroke: '#ADDDE1' },
                  text: { stroke: 'none', fill: '#6b6b76', fontWeight: 600 },
                }}
              />
              <YAxis
                title="%"
                tickTotal={11}
                tickSize={10}
                tickValues={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                style={{
                  line: { stroke: '#ADDDE1' },
                  // ticks: { stroke: '#ADDDE1' },
                  text: { stroke: 'none', fill: '#6b6b76', fontWeight: 600 },
                }}
              />
              <AreaSeries data={data} fill={0} stroke="#ba4fb9" />
            </XYPlot>
          </Col>
        </Row>
        { isShowSimBtn && 
          <Row>
            <Col>
              {'Simulation Level: '}
              <Radio.Group
                defaultValue={level}
                buttonStyle="solid"
                style={{ marginTop: 16 }}
              >
                <Radio.Button
                  value="random"
                  onClick={() => {
                    setLevel('random');
                  }}
                >
                  Random
                </Radio.Button>
                <Radio.Button
                  value="normal"
                  onClick={() => {
                    setLevel('normal');
                  }}
                >
                  Normal
                </Radio.Button>
                <Radio.Button
                  value="warining"
                  onClick={() => {
                    setLevel('warining');
                  }}
                >
                  Warning
                </Radio.Button>
                <Radio.Button
                  value="critical"
                  onClick={() => {
                    setLevel('critical');
                  }}
                >
                  Critical
                </Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
         }
      </Card>
    </>
  );
}
