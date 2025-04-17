const { format } = require('date-fns');

interface APIGatewayEvent {
  [key: string]: any;
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

exports.handler = async (event: APIGatewayEvent): Promise<LambdaResponse> => {
  const response: LambdaResponse = {
    statusCode: 200,
    body: JSON.stringify(`Hello from Lambda! ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`),
  };
  return response;
};