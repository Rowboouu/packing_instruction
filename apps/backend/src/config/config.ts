import { Logger } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { execSync } from 'child_process';
import { configSchema } from 'src/common/config.schema';

function getGitBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
  }).trim();
}

// const branch = getGitBranch();
// const envFile = `.env.${branch === 'live' ? 'prod' : 'test'}`;
const envFile = '.env'

const logger = new Logger('ConfigModule');
//logger.debug(`Loading configuration from ${envFile} for ${branch} branch`);

export const configOptions: ConfigModuleOptions = {
  validate: (env) => configSchema.parse(env),
  isGlobal: true,
  envFilePath: envFile,
  validationOptions: {
    allowUnknown: false,
    abortEarly: true,
  },
};
