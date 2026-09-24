/**
 * SMS Gateway Dispatcher for Live Mobile OTP Delivery
 * Supports Fast2SMS, 2Factor, Twilio, MSG91, and Fallback
 */

export interface SendSmsOptions {
  to: string; // 10-digit Indian mobile number
  otp: string;
  purpose: string;
}

export async function sendSmsOtp({ to, otp, purpose }: SendSmsOptions): Promise<{ success: boolean; provider: string; details?: any }> {
  const cleanPhone = to.replace(/\D/g, '').slice(-10);

  // 1. Fast2SMS (India - Live Realtime SMS Delivery)
  const fast2SmsApiKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsApiKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone,
        }),
      });

      const resData: any = await response.json();
      console.log(`[SMS:Fast2SMS] Dispatched OTP ${otp} to ${cleanPhone}:`, resData);

      if (resData.return === true) {
        return { success: true, provider: 'Fast2SMS', details: resData };
      }

      // Fallback to quick route if OTP template requires fallback
      const fallbackRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your Apna School OTP is ${otp}. Valid for 10 minutes.`,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      const fallbackData: any = await fallbackRes.json();
      console.log(`[SMS:Fast2SMS Quick Route] Dispatched to ${cleanPhone}:`, fallbackData);
      return { success: fallbackData.return === true, provider: 'Fast2SMS-Q', details: fallbackData };
    } catch (err: any) {
      console.error('[SMS:Fast2SMS Error]:', err.message);
    }
  }

  // 2. 2Factor.in (India - Dedicated OTP Gateway)
  const twoFactorApiKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorApiKey) {
    try {
      const url = `https://2factor.in/v1/API/${twoFactorApiKey}/SMS/${cleanPhone}/${otp}/AUTHTRIGGER`;
      const response = await fetch(url);
      const resData = await response.json();
      console.log(`[SMS:2Factor] Dispatched OTP to ${cleanPhone}:`, resData);
      return { success: resData.Status === 'Success', provider: '2Factor', details: resData };
    } catch (err: any) {
      console.error('[SMS:2Factor Error]:', err.message);
    }
  }

  // 3. Twilio (Global SMS Gateway)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (twilioSid && twilioAuthToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const body = new URLSearchParams({
        To: cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`,
        From: twilioFrom,
        Body: `Your Apna School verification OTP is: ${otp}. Valid for 10 minutes.`,
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      let resData = await response.json();
      
      // If Twilio Trial account restricts custom body (Error 572006), fallback to Twilio trial template
      if (resData.code === 572006 || resData.error_code === 572006) {
        console.log(`[SMS:Twilio Trial Mode] Retrying with predefined Twilio trial template...`);
        const fallbackBody = new URLSearchParams({
          To: cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`,
          From: twilioFrom,
          Body: 'sms_appointment_reminders',
        });
        const retryResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: fallbackBody.toString(),
        });
        resData = await retryResponse.json();
      }

      console.log(`[SMS:Twilio] Dispatched to ${cleanPhone}:`, resData);
      return { success: !resData.error_code, provider: 'Twilio', details: resData };
    } catch (err: any) {
      console.error('[SMS:Twilio Error]:', err.message);
    }
  }

  // 4. MSG91 (India)
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

  if (msg91AuthKey && msg91TemplateId) {
    try {
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          authkey: msg91AuthKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: msg91TemplateId,
          mobile: `91${cleanPhone}`,
          otp,
        }),
      });

      const resData = await response.json();
      console.log(`[SMS:MSG91] Dispatched OTP to ${cleanPhone}:`, resData);
      return { success: resData.type === 'success', provider: 'MSG91', details: resData };
    } catch (err: any) {
      console.error('[SMS:MSG91 Error]:', err.message);
    }
  }

  // Fallback / Development Simulation
  console.log(`
┌──────────────────────────────────────────────────────────────┐
│  📲 APNA SCHOOL SMS DISPATCH (Console Simulation)            │
├──────────────────────────────────────────────────────────────┤
│  Recipient : +91 ${cleanPhone.padEnd(42)}│
│  Purpose   : ${purpose.padEnd(46)}│
│  OTP Code  : 🔑 ${otp} (Valid for 10 mins)                  │
│  Notice    : Add an SMS Gateway API key in .env for live SMS │
└──────────────────────────────────────────────────────────────┘
  `);

  return { success: true, provider: 'ConsoleSimulation' };
}
