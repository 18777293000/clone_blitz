import { environmentProd } from './enviroment.prod';
import { enviromentDev } from './enviroment.dev';

export const enviroment = (process as any).env.REACT_APP_NODE_ENV === 'prod' ? environmentProd : enviromentDev;