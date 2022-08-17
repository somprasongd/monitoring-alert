# Monitoring Alert

## Part 1 Alert API

เป็น rest api ที่รับค่า payload แบบ json เข้ามา เพื่อประมวลผลสร้าง message สำหรับแจ้งเตือน ผ่าน line notify ไปยังกลุ่มของผู้ดูแลระบบ

เนื่องจากมีแค่ end point เดียว จริงเขียนในรูปแบบของ serverless function โดยเลือกใช้ next.js เป็น framework ช่วยในการเขียนให้ง่ายขึ้น และสามารถนำไป deploy ใช้งานจริงได้บน [vercel.com](http://vercel.com) ได้เลย

<aside>
💡 วิธีเขียน serverless function [https://nextjs.org/docs/api-routes/introduction](https://nextjs.org/docs/api-routes/introduction)

</aside>

การทำงาน

- เริ่มที่ไฟล์ /pages/api/alert.js
- จุดเริ่มต้นของโปรแกรม async function handler(req, res) {} line 30 ตามรูปแบบการเขียนของ next.js
- เริ่มต้องการให้ api นี้อนุญาติให้เรียกใช้จากที่ไหนก็ได้ เลยต้อง allow cors ก่อน `await runMiddleware(req, res, cors);` โดยใช้วิธีเขียนตาม [document ของ next.js](https://nextjs.org/docs/api-routes/api-middlewares)
    - โดยจะอนุญาตให้ส่งมาแบบ method POST เท่านั้น ส่วน HEAD เพื่อให้ browser ส่ง ตรวจสอบว่าอนุญาต method อะไรบ้าง
    
    <aside>
    💡 ต้องดูเพิ่ม [https://siriphonnot.medium.com/ทำความเข้าใจ-http-request-2521db49775d#:~:text=HTTP Request Method คือส่วน,create หรือเพิ่มค่าใหม่](https://siriphonnot.medium.com/%E0%B8%97%E0%B8%B3%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B9%83%E0%B8%88-http-request-2521db49775d#:~:text=HTTP%20Request%20Method%20%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B9%88%E0%B8%A7%E0%B8%99,create%20%E0%B8%AB%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B9%80%E0%B8%9E%E0%B8%B4%E0%B9%88%E0%B8%A1%E0%B8%84%E0%B9%88%E0%B8%B2%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88)
    
    </aside>
    
- ถัดมา line 35 `if (req.method === 'POST') {` เพื่อตรวจสอบว่าส่งมาเป็น post จึงจะทำงาน ถ้าไม่ใช่ก็ error 404 กลับไป line 43 ดู [http response code](https://www.thinknet.co.th/things-we-learn/http-response-code-%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%80%E0%B8%9B%E0%B9%87%E0%B8%99%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%AB%E0%B8%B2%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%8A%E0%B8%B2%E0%B8%A7-backend#:~:text=HTTP%20Response%20Code%20%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B9%80%E0%B8%A5%E0%B8%82,%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B9%87%E0%B8%9A%E0%B9%84%E0%B8%8B%E0%B8%95%E0%B9%8C%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%20%E0%B9%86) เพิ่ม
- เมื่อผ่านเงือนไข ก็ทำการถอด json ที่ส่งมาทาง boby message ออกมาจาก req.body มาเก็บไว้ที่ payload line 36
- แล้วส่งไปทำงานต่อที่ function `createAlert(payload);` ใช้ await เพื่อรอให้ทำงานให้เสร็จแล้วค่อยทำงาน บรรทัดถัดไป ถ้าไม่ใส่มันจะจบการทำงานก่อน line 37

- function createAlert มีหน้าที่สร้าง message แล้วส่งไปยัง line notify แต่ก่อนจะทำงานต้องตรวจสอบก่อนว่า payload ที่ส่งมาถูกต้องหรือไม่
    - เริ่มจาก ตรวจว่าต้องไม่เป็นค่าว่าง
    
    ```go
    if (!payload) {
        return { error: new InvalidExceptions('JSON Body is required!') };
      }
    ```
    
    - ถัดว่าตรวจสอบว่า โครงสร้างข้อมูลถูกต้องหรือไม่
    
    ```go
    // Validate JSON Body
      const { error, value } = validatePayload(payload);
    ```
    
    - โดยจะส่งค่าไปตรวจสอบที่ฟังก์ชัน `validatrPayload` ซึ่งต้องมาโครงสร้างตามนี้เท่านั้น ถ้าไม่ใช่จะส่ง error กลับไป
    
    ```go
    const schema = Joi.object().keys({
        senderName: Joi.string().required(),
        timestamp: Joi.date().iso().required(),
        serviceName: Joi.string().required(),
        typeOfService: Joi.string().required(),
        circuitId: Joi.string().required(),
        trafficUtilization: Joi.number().min(0).max(100).required(),
      });
    ```
    
    - เมื่อตรวจสอบผ่านแล้ว จะส่ง payload ไปสร้าง message ที่ฟังก์ชัน `getText()`  ซึ่งต้องไป import มาจาก utils/template.js การทำงานเราจะข้ามไปก่อน
    - เมื่อได้ message มาแล้ว ก็จะส่งไปให้ line notify โดยใช้ฟังก์ชัน `sendMessage()` ซึ่งวิธีการส่งเป็นไปตามวิธีตาม document นี้ [https://notify-bot.line.me/doc/en/](https://notify-bot.line.me/doc/en/) ดูที่ **POST [https://notify-api.line.me/api/notify](https://notify-api.line.me/api/notify)** ซึ่งเราจะส่งแค่ message เท่านั้น แต่จะส่งตรงๆ ไม่ได้ ต้องแปลงเป็น formData ก่อน line 111,112
    
    ```go
    var formData = new URLSearchParams();
    formData.append('message', message);
    ```
    

อธิบายฟังก์ชัน getText

1. เปิดไฟล์ utils/template.js
2. เริ่มดูที่ getText line 50
3. เริ่มจากดึงข้อมูลออกมาจาก data (payload) ที่ส่งมา line 51-58
4. เสร็จแล้วมาแปลงค่าให้ได้ตามรูปแบบที่ต้องการ 
    1. สร้าง title line 61 โดยเรียกฟังก์ชัน title() ซึ่งจะเปลี่ยนไปตามค่าที่ส่งมา line 24-38
    2. แปลง format วันที่เวลาให้เป็นเวลาไทย
    3. สร้างข้อความ line 70 สถานะจากค่าที่ส่งมาโดยเรียกฟังก์ชัน status() line 14-22
5. เสร็จเอาค่าจากข้อ 4 ไปแทนค่าใน templateString line 40-48 โดยการวนลูปจาก key ในข้อ 4 ไปเรื่อยจนกว่าจะแทนค่าจนหมด ได้เป็นข้อความที่สมบูรณ์ line 73-77
6. และคืนค่ากลับไป line 79

## Part 2 Simulatetion App

ตัวนี้เราจะสร้างเป็นอีกโปรเจคก็ได้ แต่เพื่อความง่ายขอสร้างไว้ที่โปรเจคเดียวกันเลย

โดยจะใช้ next.js เหมือนกันเพื่อความง่ายในการพัฒนา โดยสร้างตาม framework [https://nextjs.org/docs/basic-features/pages](https://nextjs.org/docs/basic-features/pages)

การทำงาน

1. ตาม next.js หน้าแรกจะเริ่มที่ pages/index.js จึงมาสร้างหน้าเวบที่นี่
2. เพื่อจำลอง จะทำการ mock client ขึ้นมาไว้ที่ไฟล์ utils/mock.js ซึ่งเป็น javascript object ง่ายๆ มี

```go
senderName: 'CMI_Network Syslog',
serviceName: 'Alert_IP Transit',
typeOfService: 'Global IPT',
circuitId: 'THCA0001',
```

1. แล้วทำการ import มาที่ pages/index.js เพื่อเป็น clients ทั้งหมด
2. แล้วเราจะสร้าง graph ของแต่ละ client โดยการวนลูป clients.map() line 19-25 วิธีการนี้ตาม react [https://reactjs.org/docs/lists-and-keys.html](https://reactjs.org/docs/lists-and-keys.html)
3. ตาม concept ของ react อะไรที่ใช้ ซ้ำกันจะแยกไปสร้างเป็น component [https://reactjs.org/docs/components-and-props.html](https://reactjs.org/docs/components-and-props.html) เราจึงสร้างกราฟของแต่ละ client ไว้ที่ components/graph.js

 6. แล้ว import มาใช้ใน pages/index.js โดยเรียกใช้ที่ line 22 `<Graph client={client}></Graph>` ซึ่งจะส่งค่า client ไปให้ด้วย เพื่อให้กราฟแสดงผลต่างกัน ตามค่าของ client ที่ส่งไป โดยส่งผ่านที่ prop ที่ชื่อว่า client

components/graph.js 

คือ component แสดง กราฟของแต่ละ client ที่ส่งมา

1. การแสดงผลทาง browser จะเขียนไว้ตั้ง line 80 
2. การทำงานจะกราฟจะถูก plot ด้วยค่าใหม่ทุก 5 วินาที โดยการจำลองค่า Utilization ผ่าน useInterval
    1. การทำงานจะ random ค่าออกมาโดยเงื่อนไข จะเป็นไปตาม level ที่จะจำลอง โดยเริ่มต้นจะเป็น normal ตลอด line 20 และค่านี้จะเปลี่ยนไปตามปุ่มที่กด
    2. เมื่อได้ค่าที่ random มาแล้วจะ set ค่าไว้ที่ตัวแปร currentValue line 50
    3. และสร้างค่าใหม่เพื่อ plot graph line 46-49 โดยแกน x คือ ค่าที่ random มา y คือเวลาปัจจุบัน
    4. และส่งไป plot ที่ line 51
3. และจะมีการ monitor ค่า currentValue ทุกครั่งที่มีการเปลี่ยนแปลง ผ่าน useEffect [https://reactjs.org/docs/hooks-effect.html](https://reactjs.org/docs/hooks-effect.html) 
    1. โดยจะทำการตรวจสอบค่าปัจจุบัน currentValue เทียบกับค่าที่เคยส่งไปครั้งล่าสุดว่าเข้าเงื่อนไขอะไร line 55-65
    2. ซึ่งถ้าเข้าเงื่อนไข จะได้ isAlert = true
    3. และทำงานต่อ line 68-76
        1. 68 คือ อัพเดทค่าที่ส่งล่าสุดไว้ เพื่อไว้เทียบค่ารอบถัดๆไป
        2. 69 คือ ส่ง payload ไปให้ alert api โดยใช้ฟังก์ชัน callAlertApi ส่งเป็น method post และ json ตามรูปแบบที่ alert api กำหนด
