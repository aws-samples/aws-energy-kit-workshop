type Config = {
    roleArn: string;
    region: string;
    twinmakerId: string;
  };
  
  export default (config: Config) => ({
    name: 'AWS IoT TwinMaker',
    type: 'grafana-iot-twinmaker-datasource',
    access: 'proxy',
    basicAuth: false,
    isDefault: true,
    jsonData: {
      assumeRoleArn: config.roleArn,
      authType: 'ec2_iam_role',
      defaultRegion: config.region,
      workspaceId: config.twinmakerId,
    },
  });