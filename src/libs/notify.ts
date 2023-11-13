import qs from 'querystring';
import { config } from 'dotenv';

config();

export type Content = {
  displayName: string | undefined;
  instanceId: string;
  lifecycleState: string;
  region: string;
};

export const sendNotify = async (content: Content[]) => {
  const url = 'https://notify-api.line.me/api/notify';

  const jsonData = {
    message: ``,
  };

  for (const item of content) {
    jsonData.message += `\n\nDisplay Name: ${item.displayName}\nInstance Id: ${item.instanceId}\nState: ${item.lifecycleState}\nRegion: ${item.region}`;
  }

  const data = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify(jsonData),
  });

  const x = await data.json();
  console.log(x);
};
