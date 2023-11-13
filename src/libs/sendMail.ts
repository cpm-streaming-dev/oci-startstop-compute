import nodemailer, { SendMailOptions } from 'nodemailer';

export type MailContent = {
  displayName: string | undefined;
  instanceId: string;
  lifecycleState: string;
  region: string;
};

export const sendMail = async (mailContent: MailContent[]) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'swuemailservice@gmail.com',
      pass: process.env.MAILPASS,
    },
  });

  const mailOptions: SendMailOptions = {
    from: 'swuemailservice@gmail.com', // sender
    to: ['thiti180536@gmail.com', 'thiti_t@mfec.co.th'], // list of receivers
    subject: `OCI Cron Schedule ${new Date().toLocaleString()}`, // Mail subject
    html: `<p>Cron job is running sucessfully on: ${new Date().toLocaleString()}</p>
          ${mailContent.map(
            (item) =>
              `<ul>
                <li>Name: ${item.displayName}</li>
                <li>State: ${item.lifecycleState}</li>
                <li>Id: ${item.instanceId}</li>
                <li>Region: ${item.region}</li>
              </ul>`
          )}`, // HTML body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) return err;
    return info.response;
  });
};
