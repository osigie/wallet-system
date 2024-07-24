import { DEVELEOPMENT_ENV } from './constant';

export const databaseEnvironmentConfig =
  process.env.NODE_ENV === DEVELEOPMENT_ENV ? process.env.DATABASE_URL : '';

// export const apiBaseUrl: string =
//   process.env.NODE_ENV === development
//     ? process.env.WN_BACKEND_DEV_URL
//     : process.env.NODE_ENV === test
//       ? process.env.WN_BACKEND_DEV_URL
//       : process.env.WN_BACKEND_LIVE_URL === production
//         ? process.env.WN_BACKEND_LIVE_URL
//         : process.env.WN_BACKEND_LOCAL_URL;

// export const resetPasswordUrl: string =
//   process.env.NODE_ENV === development
//     ? 'https://nexit-admin.ogtlprojects.com/reset-password'
//     : process.env.NODE_ENV === test
//       ? 'https://nexit-admin.ogtlprojects.com/test/reset-password'
//       : process.env.WN_BACKEND_LIVE_URL === production
//         ? 'https://www.worknation.ng/reset-password'
//         : 'http://localhost:3001/reset-password';
