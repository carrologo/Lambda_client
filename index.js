import { format } from 'date-fns';

export const handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(`Hello from Lambda! ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`),
  };
  return response;
};