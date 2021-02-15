import User, { associate as associateUser } from './user'
export * from './sequelize'; //import함과 동시에 export한다.
// 순환참조 문제를 해결하기 위해서 이렇게 사용한다. 

const db = { //model들 담아둘 db객체 만들고,
    User,
}

export type dbType = typeof db;

associateUser(db);
