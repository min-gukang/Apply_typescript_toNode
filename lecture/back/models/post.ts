import {  BelongsToManyAddAssociationsMixin, DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, Model } from 'sequelize'
import Hashtag from './hashtag';
import Image from './image';
import { dbType } from './index';
import { sequelize } from './sequelize';

class Post extends Model {
    public readonly id!: number;
    public content!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public addHashtags!: BelongsToManyAddAssociationsMixin<Hashtag, number>;
    public addImages!: HasManyAddAssociationsMixin<Image, number>
    public addImage!: HasManyAddAssociationMixin<Image, number>
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
    collate: 'utf8mb4_general_ci'
})

export const associate = (db: dbType) => {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsTo(db.Post, {as: 'Retweet'});
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag'});
    db.Post.belongsToMany(db.User, {through: 'Like', as: 'Likers'});
}

export default Post;