import * as Joi from 'joi';
import { DEVELEOPMENT_ENV, TEST_ENV } from './constant';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(DEVELEOPMENT_ENV, TEST_ENV)
    .default(DEVELEOPMENT_ENV)
    .required(),
  PORT: Joi.number().port().required(),
  DATABASE_URL: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  EMAIL_FROM_ADDRESS: Joi.string().required(),
  EMAIL_FROM_NAME: Joi.string().required(),
  MAIL_TRAP_HOST: Joi.string().optional(),
  MAIL_TRAP_PORT: Joi.number().default(2525).optional(),
  MAIL_TRAP_USERNAME: Joi.string().optional(),
  MAIL_TRAP_PASSWORD: Joi.string().optional(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().required(),
  GEN_SALT: Joi.number().required(),
}).unknown(true);
