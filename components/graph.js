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

export default function Graph({ client }) {
  const [data, setData] = useState([{ x: new Date().getTime(), y: 0 }]);
  const [level, setLevel] = useState('normal');
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
        max = 94;
        value = Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case 'high': // high
        min = 95;
        max = 99;
        value = Math.floor(Math.random() * (max - min + 1) + min);
        break;
      default: // critical
        value = 100;
        break;
    }
    const newData = {
      x: new Date().getTime(),
      y: value,
    };
    setCurrentValue(value);
    setData([...data, newData]);
  }, 5 * 1000);

  useEffect(() => {
    let isAlert = false;
    if (currentValue === 100 && lastAlertValue !== 100) {
      isAlert = true;
    } else if (
      currentValue >= 95 &&
      (lastAlertValue < 95 || lastAlertValue === 100)
    ) {
      isAlert = true;
    } else if (currentValue < 95 && lastAlertValue >= 95) {
      isAlert = true;
    }

    if (isAlert) {
      setLastAlertValue(currentValue);
      callAlertApi({
        senderName: 'Monitoring Dashboard Simulation',
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
                  currentValue === 100
                    ? '#ff4d4f'
                    : currentValue >= 95
                    ? '#fa8c16'
                    : '#237804',
                backgroundColor:
                  currentValue === 100
                    ? '#ffa39e'
                    : currentValue >= 95
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
                value="high"
                onClick={() => {
                  setLevel('high');
                }}
              >
                High
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
      </Card>
    </>
  );
}
