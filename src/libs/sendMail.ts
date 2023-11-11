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
    to: 'thiti180536@gmail.com', // list of receivers
    subject: `OCI Cron Schedule ${new Date().toLocaleString()}`, // Mail subject
    html: `<p>Cron job is running sucessfully on: ${new Date().toLocaleString()}</p>
          ${mailContent.map(
            (item) =>
              `<ol>
              <li>${item.displayName} ${item.lifecycleState} ${item.instanceId} ${item.region}</li>
            </ol>`
          )}`, // HTML body,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) return err;
    return info.response;
  });
};
