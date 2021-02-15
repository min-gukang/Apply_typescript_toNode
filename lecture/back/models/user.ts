import { DataTypes, Model} from 'sequelize';
import { dbType } from './index';
import { sequelize } from './sequelize';

class User extends Model {
    public id!: number;
    public nickname!: string;
    public userId!: string;
    public password!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    nickname: {
        type: DataTypes.STRING(20),
    },
    userId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
    }
},  {
    sequelize, //sequelize.ts에 만든 인스턴스 꼭 써줘야함, 모델이랑 db랑 연결시키는 역할
    modelName: 'User',
    tableName: 'user',
    charset: 'utf8', 
    collate: 'utf8_general_ci', //한글 저장을 위해서
})

//관계설정 
export const associate = (db: dbType) => {

};

export default User; //얘를 index.ts에서 가져다가 써야함

