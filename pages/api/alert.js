import Cors from 'cors';
import Joi from 'joi';

import {
  Exceptions,
  InvalidExceptions,
  UnhandledExceptions,
} from '../../utils/exceptions';
import { getText } from '../../utils/template';

// Initializing the cors middleware
const cors = Cors({
  methods: ['POST', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Rest of the API logic
  if (req.method === 'POST') {
    const payload = req.body;
    const { error } = await createAlert(payload);
    if (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
    res.status(201).end();
  } else {
    res.status(404).end();
  }
}

function validatePayload(data) {
  const schema = Joi.object().keys({
    senderName: Joi.string().required(),
    timestamp: Joi.date().iso().required(),
    serviceName: Joi.string().required(),
    typeOfService: Joi.string().required(),
    circuitId: Joi.string().required(),
    trafficUtilization: Joi.number().min(0).max(100).required(),
  });

  const options = {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: false,
  };
  const { error, value } = schema.validate(data, options);

  return { error, value };
}

async function createAlert(payload) {
  if (!payload) {
    return { error: new InvalidExceptions('JSON Body is required!') };
  }
  // Validate JSON Body
  const { error, value } = validatePayload(payload);

  if (error) {
    return {
      error: new InvalidExceptions(
        error.details
          .reduce((msg, error) => `${msg}, ${error.message}`, '')
          .substring(2)
      ),
    };
  }

  const msg = getText(value);
  console.log(msg);

  // Send to line notify
  const { error: err, result } = await sendMessage(msg);

  console.log(result);

  if (err) {
    return {
      error: new UnhandledExceptions(err.message),
    };
  }

  const { status, message } = result;
  if (result.status !== 200) {
    return {
      error: new Exceptions(status, message),
    };
  }

  return { result };
}

const NOTIFY_URL = 'https://notify-api.line.me/api/notify';
async function sendMessage(message) {
  try {
    var formData = new URLSearchParams();
    formData.append('message', message);

    const response = await fetch(NOTIFY_URL, {
      method: 'POST',
      // mode: 'cors',
      headers: {
        Authorization: `Bearer ${process.env.lineNotifyToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    const result = await response.json();
    return { result };
  } catch (error) {
    return { error };
  }
}

export default handler;
