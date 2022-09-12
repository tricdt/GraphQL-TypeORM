import {
   Entity,
   BaseEntity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
} from "typeorm";

@Entity()
export class Post extends BaseEntity {
   @PrimaryGeneratedColumn()
   id!: number;

   @Column()
   title!: string;

   @Column()
   text!: string;

   @CreateDateColumn()
   createdAt: Date;

   @CreateDateColumn()
   updatedAt: Date;
}
