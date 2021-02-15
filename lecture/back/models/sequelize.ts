import { Sequelize } from 'sequelize';
import config from '../config/config';

// process.env는 ts가 정확하게 얘네가 어떤 타입이 될지 추론을 잘 못한다. 
// 그래서 직접 as로 명시를 해주면 된다. 
const env = process.env.NODE_ENV as ('production' | 'test' | 'development') || 'development';
const { database, username, password } = config[env];
const sequelize = new Sequelize(database, username, password, config[env]); //env 에러 났던거 config.ts에서 정확한 타입을 지정해줘서 해결해줌. 

export { sequelize };
export default sequelize;