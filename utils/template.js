import emoji from 'node-emoji';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/th';

// use time zones
dayjs.extend(utc);
dayjs.extend(timezone);

const STATUS_CRITICAL = 'Critical';
const STATUS_WARN = 'Warning';
const STATUS_NORMAL = 'Normal';
const status = (tu) => {
  if (tu >= 90) {
    return STATUS_CRITICAL;
  } else if (tu >= 70) {
    return STATUS_WARN;
  } else {
    return STATUS_NORMAL;
  }
};

const title = (tu) => {
  if (tu >= 90) {
    return emoji.emojify(
      `:red_circle::fire::red_circle: ${STATUS_CRITICAL} :red_circle::fire::red_circle:`
    );
  } else if (tu >= 70) {
    return emoji.emojify(
      `:large_yellow_circle::warning::large_yellow_circle: ${STATUS_WARN} :large_yellow_circle::warning::large_yellow_circle:`
    );
  } else {
    return emoji.emojify(
      `:large_green_circle::large_green_circle::large_green_circle: ${STATUS_NORMAL} :large_green_circle::large_green_circle::large_green_circle:`
    );
  }
};

const templateString = `
{{title}}
Sender: {{senderName}}
Time: {{timestamp}}
Name: {{serviceName}}
Profile: {{typeOfService}}
CID: {{circuitId}}
Traffic utilization: {{trafficUtilization}}%
Status: {{status}}`;

export function getText(data) {
  const {
    senderName,
    timestamp,
    serviceName,
    typeOfService,
    circuitId,
    trafficUtilization,
  } = data;

  const pattern = {
    title: title(trafficUtilization),
    senderName,
    timestamp: dayjs(timestamp)
      .tz('Asia/Bangkok')
      .format('ddd, MMM D, YYYY HH:mm:ss(Z)'),
    serviceName,
    typeOfService,
    circuitId,
    trafficUtilization,
    status: status(trafficUtilization),
  };

  const template = Object.keys(pattern).reduce((text, key) => {
    const regex = new RegExp(`{{${key}}}`, 'gi'); // /{{dog}}/gi;

    return text.replace(regex, pattern[key]);
  }, templateString);

  return template;
}
