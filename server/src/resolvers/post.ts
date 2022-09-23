import {
   Arg,
   Ctx,
   FieldResolver,
   ID,
   Int,
   Mutation,
   Query,
   Resolver,
   Root,
   UseMiddleware,
} from "type-graphql";
import { LessThan } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { checkAuth } from "../middleware/checkAuth";
import { Context } from "../types/Context";
import { CreatePostInput } from "../types/CreatePostInput";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { UpdatePostInput } from "../types/UpdatePostInput";

@Resolver((_of) => Post)
export class PostResolver {
   @FieldResolver((_return) => String)
   textSnippet(@Root() root: Post) {
      return root.text.slice(0, 50);
   }

   @FieldResolver((_return) => User)
   async user(@Root() root: Post) {
      return await User.findOneBy({ id: root.userId });
   }

   @Mutation((_return) => PostMutationResponse)
   @UseMiddleware(checkAuth)
   async createPost(
      @Arg("createPostInput") { title, text }: CreatePostInput,
      @Ctx() { req }: Context
   ): Promise<PostMutationResponse> {
      try {
         const newPost = Post.create({
            title,
            text,
            userId: req.session.userId,
         });
         await newPost.save();

         return {
            code: 200,
            success: true,
            message: "Post created successfully",
            post: newPost,
         };
      } catch (error) {
         console.log(error);
         return {
            code: 500,
            success: false,
            message: `Internal server error ${error.message}`,
         };
      }
   }

   @Query((_return) => PaginatedPosts, { nullable: true })
   async posts(
      @Arg("limit", (_type) => Int) limit: number,
      @Arg("cursor", { nullable: true }) cursor?: string
   ): Promise<PaginatedPosts | null> {
      try {
         const totalPostCount = await Post.count();
         const realLimit = Math.min(10, limit);
         const findOptions: { [key: string]: any } = {
            order: {
               createdAt: "DESC",
            },
            take: realLimit,
         };
         let lastPost: Post[] = [];
         if (cursor) {
            findOptions.where = { createdAt: LessThan(cursor) };
            lastPost = await Post.find({
               order: { createdAt: "ASC" },
               take: 1,
            });
         }
         const posts = await Post.find(findOptions);

         return {
            totalCount: totalPostCount,
            cursor: posts[posts.length - 1].createdAt,
            hasMore: cursor
               ? posts[posts.length - 1].createdAt.toString() !==
                 lastPost[0].createdAt.toString()
               : posts.length !== totalPostCount,
            paginatedPosts: posts,
         };
      } catch (error) {
         console.log(error);
         return null;
      }
   }

   @Query((_return) => Post, { nullable: true })
   async post(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
      try {
         const post = await Post.findOneBy({ id });
         return post;
      } catch (error) {
         console.log(error);
         return null;
      }
   }

   @Mutation((_return) => PostMutationResponse)
   @UseMiddleware(checkAuth)
   async updatePost(
      @Arg("updatePostInput") { id, title, text }: UpdatePostInput,
      @Ctx() { req }: Context
   ): Promise<PostMutationResponse> {
      const existingPost = await Post.findOneBy({ id });
      if (!existingPost)
         return {
            code: 400,
            success: false,
            message: "Post not found",
         };
      if (existingPost.userId != req.session.userId) {
         return {
            code: 401,
            success: false,
            message: "Unauthorized",
         };
      }
      existingPost.title = title;
      existingPost.text = text;
      await existingPost.save();
      return {
         code: 200,
         success: true,
         message: "Post updated successfully",
         post: existingPost,
      };
   }

   @Mutation((_return) => PostMutationResponse)
   @UseMiddleware(checkAuth)
   async deletePost(
      @Arg("id", (_type) => ID) id: number,
      @Ctx() { req }: Context
   ): Promise<PostMutationResponse> {
      const existingPost = await Post.findOneBy({ id });
      if (!existingPost)
         return {
            code: 400,
            success: false,
            message: "Post not found",
         };
      if (existingPost.userId !== req.session.userId) {
         return {
            code: 401,
            success: false,
            message: "Unauthorized",
         };
      }
      await Post.delete({ id });
      return {
         code: 200,
         success: true,
         message: "Post deleted successfully",
      };
   }
}
