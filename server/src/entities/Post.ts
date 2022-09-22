import { Field, ID, ObjectType } from "type-graphql";
import {
   Entity,
   BaseEntity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   ManyToOne,
} from "typeorm";
import { User } from "./User";
@ObjectType()
@Entity()
export class Post extends BaseEntity {
   @Field((_type) => ID)
   @PrimaryGeneratedColumn()
   id!: number;

   @Field()
   @Column()
   title!: string;

   @Field()
   @Column()
   text!: string;

   @Field()
   @Column()
   userId!: number;

   @Field((_type) => User)
   @ManyToOne(() => User, (user) => user.posts)
   user: User;

   @Field()
   @CreateDateColumn()
   createdAt: Date;

   @Field()
   @CreateDateColumn()
   updatedAt: Date;
}
