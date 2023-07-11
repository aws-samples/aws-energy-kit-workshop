import { CdkCustomResourceHandler, CloudFormationCustomResourceUpdateEvent, CloudFormationCustomResourceDeleteEvent } from 'aws-lambda';
import axios from 'axios';

export const handler: CdkCustomResourceHandler = async (event) => {
  const { RequestType, ResourceProperties } = event;
  const { endpoint, apiKey } = ResourceProperties;
  const url = 'https://' + endpoint;
  const configs = { headers: { Authorization: 'Bearer ' + apiKey } };
  const payload = JSON.parse(ResourceProperties.payload);

  switch (RequestType) {
    case 'Create': {
      const { data } = await axios.post(url + '/api/datasources', payload, configs);
      const id = data.datasource.id.toString();
      return { PhysicalResourceId: id, Data: { id } };
    }
    case 'Update':
      // eslint-disable-next-line no-case-declarations
      const { PhysicalResourceId } = event as CloudFormationCustomResourceUpdateEvent;
      await axios.put(url + '/api/datasources/' + PhysicalResourceId, payload, configs);
      return { Data: { id: PhysicalResourceId } };
    case 'Delete': {
      const { PhysicalResourceId } = event as CloudFormationCustomResourceDeleteEvent;
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      axios.delete(url + '/api/datasources/' + PhysicalResourceId, configs).catch(() => {});
      return {};
    }
    default:
      throw new Error('Invalid Request Type');
  }
};