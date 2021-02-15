import { DataTypes, Model } from 'sequelize'
import { dbType } from './index';
import { sequelize } from './sequelize';

class Post extends Model {
    public readonly id!: number;
    public content!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Post.init({
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Post',
    tableName: 'post',
    charset: 'utf8mb4', // 이모티콘까지 추가하기 위해, mb4
    collate: 'utfmb4_general_ci'
})

export const associate = (db: dbType) => {
    
}

export default Post;