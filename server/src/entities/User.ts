import {
   Entity,
   BaseEntity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany,
} from "typeorm";

import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
   @Field((_type) => ID)
   @PrimaryGeneratedColumn()
   id!: number;

   @Field()
   @Column({ unique: true })
   username!: string;

   @Field()
   @Column({ unique: true })
   email!: string;

   @Column()
   password!: string;

   @OneToMany(() => Post, (post) => post.user)
   posts: Post[];

   @Field()
   @CreateDateColumn()
   createdAt: Date;

   @Field()
   @UpdateDateColumn()
   updatedAt: Date;
}
