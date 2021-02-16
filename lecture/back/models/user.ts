import { BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin,
         BelongsToManyRemoveAssociationMixin, DataTypes, 
         HasManyGetAssociationsMixin, Model
       }  from 'sequelize';
import { dbType } from './index';
import Post from './post';
import { sequelize } from './sequelize';

class User extends Model {
    public id!: number;
    public nickname!: string;
    public userId!: string;
    public password?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly Posts?: Post[]; // ?를 붙인 이유는 include하면 있는거고 아니면 없는거니까 optional로 한다. 
    public readonly Followers?: User[];
    public readonly Followings?: User[];

    public addFollowing!: BelongsToManyAddAssociationMixin<User, number>;
    public getFollowings!: BelongsToManyGetAssociationsMixin<User>;
    public removeFollowing!: BelongsToManyRemoveAssociationMixin<User, number>;
    public getFollowers!: BelongsToManyGetAssociationsMixin<User>;
    public removeFollower!: BelongsToManyRemoveAssociationMixin<User, number>;
    public getPosts!: HasManyGetAssociationsMixin<Post>;
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
    db.User.hasMany(db.Post, {as: 'Posts'});
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, {through: 'Like', as: 'Liked'}); //as 기준으로 위 메서드들이 생긴다. 
    db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followers', foreignKey: 'followingId'}); //as와 foreignKey는 서로 반대이다
    db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followings', foreignKey: 'followerId'});
};

export default User; //얘를 index.ts에서 가져다가 써야함