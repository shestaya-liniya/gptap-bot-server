// +0  t('html-success:title', { name: createFullName(msg.from) }), // строка заголовок (Арон, оплата прошла успешно.)
// +1  t('html-success:date-fin'),
// 2  t('html-success:tokens'),
// +3  tariff[0]['text'],
// 4  t('html-success:days', { days: tariff[0]['duration_days'] }),
// 5  t('html-success:btn')
// 6 tariff[0]['tokens'],

export const successPage = (values) => (`
<!DOCTYPE HTML>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>'html:title'</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
      body {
          background-color: #efefef;
          color: #000;
          margin: 0;
          padding: 0;
      }
  </style>
</head>
<body>
<div
  style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.5; font-size: 14px; background-color: #efefef; color: #000; -webkit-font-smoothing: antialiased; font-weight: 400; margin: 0; padding: 0 15px;">
  <div style="width: 100%; height: 30px"></div>
  <div
    style="max-width: 580px; box-sizing: border-box; margin: auto; padding: 30px; border-radius: 20px; background-color: #ffffff;">
    <div>
      <a href="https://t.me/PaperClip_gptbot"
         style="text-decoration:none; display: inline-block; margin: 0 auto 30px; color: black; text-decoration: none; font-size: 25px; font-weight: 800"
         target="_blank">
        📎 PaperClip
      </a>
      <img src="https://s3.eu-central-1.amazonaws.com/cdn.farmazon.com.tr/mail/SuccessPayment/payment-success.png"
           style="max-width: 100%; width: auto; display: block; max-height: 240px; margin: 0 auto;" />
    </div>
    <div style="font-size: 18px; line-height: 24px; font-weight: bold; margin: 20px 0 10px; text-align:left; color: #159f52">
      ${values[0]}
    </div>
    <div style="font-size:14px;line-height:20px; text-align: left; margin-bottom: 30px;">
   ${values[3]}
    </div>
    <table
      style="width: 100%; border-radius: 10px; background-color: rgba(26, 7, 88, 0.08); margin-bottom: 20px; padding-left: 20px; padding-right: 20px; height: 69px;">
      <tbody>
      <tr>
        <td style="width: 33.3%;">
          <div style="font-size:11px; line-height: 15px; color: #444444; margin-bottom: 5px">
            ${values[1]}
          </div>
          <div style="font-size: 14px; font-weight: bold; line-height: 20px; color: #159f52">
${values[4]}
</div>
        </td>
        <td style="text-align: right; width: 33.3%;">
          <div style="font-size:11px; line-height: 15px; color: #444444; margin-bottom: 5px">
            ${values[2]}
          </div>
          <div style="font-size: 14px; font-weight: bold; line-height: 20px">${values[6]} 🍪</div>
        </td>
      </tr>
      </tbody>
    </table>
    
    <div style="text-align:right;">
      <a href="https://t.me/PaperClip_gptbot"
         style="background-color: #180457; text-decoration: none; display: inline-block; font-size: 14px; color: #ffffff; border-radius: 10px; padding: 8px 20px; text-align: center;"
         target="_blank">
        ${values[5]}
      </a>
    </div>
    
    <div style="font-size: 14px; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">${values[7]}</div>

<div style="margin-bottom: 10px; padding: 20px 18px 0px 20px; border-radius: 10px; border: solid 1px #d0ccdd; background-color: #ffffff;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; color: #444444; margin-bottom: 5px;">${values[8]}</div>
          <div style="font-size: 14px; font-weight: bold; line-height: 20px;">${values[9]}</div>
        </div>
      </div>

    
  </div>
  <div style="max-width: 580px; margin: 30px auto 0; font-weight: 400;">
  </div>
</div>
</body>
</html>
`)