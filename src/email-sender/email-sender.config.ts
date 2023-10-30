const emailSenderConfig = {
  transport: {
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_USER,
  },
};

export default emailSenderConfig;