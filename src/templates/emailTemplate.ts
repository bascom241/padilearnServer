export const sendWelcomeEmailContent = (
  name: string,
  verificationToken: string,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to our platform</title>
  <style>
    .ExternalClass, .ReadMsgBody { width: 100%; background-color: #f5f9f5; }
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    @media only screen and (max-width: 480px) {
      .email-container { width: 100% !important; }
      .token-code { font-size: 28px !important; letter-spacing: 4px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f0f7f0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#f0f7f0" style="background-color:#f0f7f0; width:100%;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <!-- main card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%; background-color:#ffffff; border-radius:40px; box-shadow:0 30px 60px -20px rgba(30, 80, 40, 0.25);">
          
          <!-- header with fresh gradient -->
          <tr>
            <td style="border-radius:40px 40px 0 0; background: linear-gradient(135deg, #f1faf1 0%, #e4f3e4 100%); padding: 44px 40px 28px 40px; text-align:center;">
              <div style="margin-bottom: 16px;">
                <span style="display:inline-block; width:72px; height:72px; background: linear-gradient(145deg, #d1ebd1, #b8dfb8); border-radius:36px; line-height:76px; font-size:42px; box-shadow:0 8px 14px -6px rgba(60, 100, 60, 0.2);">✨</span>
              </div>
              <h1 style="font-size:36px; font-weight:600; color:#1a3a1a; margin:10px 0 6px 0; letter-spacing:-0.02em;">Welcome to the family</h1>
              <p style="font-size:18px; color:#3d5e3d; margin:0; font-weight:350;">we're so glad you're here</p>
            </td>
          </tr>
          
          <!-- main content -->
          <tr>
            <td style="padding:18px 40px 30px 40px;">
              <!-- warm greeting -->
              <p style="font-size:18px; color:#1f331f; line-height:1.5; margin:0 0 24px 0;">
                Hi <strong style="color:#0f4f0f; font-weight:600;">${name}</strong>,
              </p>
              
              <p style="font-size:16px; color:#2c452c; line-height:1.6; margin:0 0 28px 0; opacity:0.9;">
                Thanks for joining us! To complete your registration and verify your email address, please use the verification code below:
              </p>
              
              <!-- token display - elegant glassmorphic style -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 30px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(145deg, #f0f9f0, #e6f2e6); border-radius:28px; padding:28px 20px; border:1px solid rgba(80, 140, 80, 0.15); box-shadow:inset 0 2px 4px rgba(255,255,255,0.8), 0 8px 18px -8px rgba(30, 80, 40, 0.2);">
                    <span style="font-size:42px; font-weight:700; letter-spacing:8px; color:#166b16; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; background:#ffffff; padding:12px 24px; border-radius:24px; display:inline-block; box-shadow:0 4px 8px rgba(0,30,0,0.05); border:1px solid #c0ddc0;">${verificationToken}</span>
                  </td>
                </tr>
              </table>
              
              <!-- instructions -->
              <p style="font-size:16px; color:#2f4a2f; line-height:1.6; margin:0 0 22px 0;">
                Enter this code on the verification page — it's valid for the next <span style="font-weight:600; color:#146414;">15 minutes</span>.
              </p>
              
              <!-- quick tip box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecf6ec; border-radius:24px; margin:24px 0 28px 0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0; color:#2b4f2b; font-size:15px; line-height:1.5;">
                      <span style="display:inline-block; background:#ccf0cc; width:24px; height:24px; border-radius:12px; font-size:14px; line-height:24px; text-align:center; margin-right:8px; color:#166b16;">✓</span> 
                      <strong style="color:#145214;">Can't find the code?</strong> Check your spam folder or 
                      <a href="#" style="color:#166b16; text-decoration:underline;">request a new one</a>.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size:15px; color:#446644; line-height:1.6; margin:16px 0 0 0; border-top:2px dashed #c8e0c8; padding-top:26px;">
                <span style="font-size:20px; margin-right:6px;">🌿</span> 
                Once verified, you'll get immediate access to all features.
              </p>
            </td>
          </tr>
          
          <!-- footer -->
          <tr>
            <td style="background-color:#f7fcf7; border-radius:0 0 40px 40px; padding:28px 40px 32px 40px; text-align:center; border-top:1px solid #d8eed8;">
              <p style="font-size:15px; color:#528052; margin:0 0 12px 0; font-weight:400;">Have questions? We're here to help —</p>
              <p style="font-size:14px; color:#6d9a6d; margin:0;">
                <span style="display:inline-block; background:#ffffff; padding:6px 20px; border-radius:40px; border:1px solid #bde0bd; box-shadow:0 2px 6px rgba(0,30,0,0.02);">hello@yourapp.com  •  @yourapp</span>
              </p>
              <p style="font-size:12px; color:#aac7aa; margin:20px 0 0 0;">© 2025 Your App Team • crafted with purpose</p>
            </td>
          </tr>
        </table>
        
        <!-- no-reply note -->
        <p style="font-size:13px; color:#9bbf9b; margin-top:28px;">This is an automated message — please don't reply directly.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;