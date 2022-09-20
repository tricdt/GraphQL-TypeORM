import { User } from "../entities/User";
import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { Context } from "../types/Context";
import { LoginInput } from "../types/LoginInput";

import { COOKIE_NAME } from "../constants";
import { ForgotPasswordInput } from "../types/ForgotPasswordInput";
import { TokenModel } from "../models/Token";
import { sendEmail } from "../utils/sendEmail";

@Resolver()
export class UserResolver {
   @Query((_return) => User, { nullable: true })
   async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
      if (!req.session.userId) return null;
      const user = await User.findOneBy({ id: req.session.userId });
      return user;
   }

   @Mutation((_returns) => UserMutationResponse)
   async register(
      @Arg("registerInput") registerInput: RegisterInput,
      @Ctx() { req }: Context
   ): Promise<UserMutationResponse> {
      const validateRegisterInputErrors = validateRegisterInput(registerInput);
      if (validateRegisterInputErrors !== null)
         return { code: 400, success: false, ...validateRegisterInputErrors };
      try {
         const { username, email, password } = registerInput;
         const existingUser = await User.findOne({
            where: [{ username }, { email }],
         });
         if (existingUser)
            return {
               code: 400,
               success: false,
               message: "Duplicated username or email",
               errors: [
                  {
                     field:
                        existingUser.username === username
                           ? "username"
                           : "email",
                     message: `${
                        existingUser.username === username
                           ? "Username"
                           : "Email"
                     } already taken`,
                  },
               ],
            };
         const hashedPassword = await argon2.hash(password);
         const newUser = User.create({
            username,
            password: hashedPassword,
            email,
         });
         await newUser.save();

         req.session.userId = newUser.id;
         return {
            code: 200,
            success: true,
            message: "User registration successful",
            user: newUser,
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

   @Mutation((_returns) => UserMutationResponse)
   async login(
      @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
      @Ctx() { req }: Context
   ): Promise<UserMutationResponse> {
      try {
         const existingUser = await User.findOneBy(
            usernameOrEmail.includes("@")
               ? { email: usernameOrEmail }
               : { username: usernameOrEmail }
         );
         if (!existingUser)
            return {
               code: 400,
               success: false,
               message: "User not found",
               errors: [
                  {
                     field: "usernameOrEmail",
                     message: "Username or email incorrect",
                  },
               ],
            };
         const passwordValid = await argon2.verify(
            existingUser.password,
            password
         );

         if (!passwordValid)
            return {
               code: 400,
               success: false,
               message: "Wrong password",
               errors: [{ field: "password", message: "Wrong password" }],
            };
         // Create session and return cookie
         req.session.userId = existingUser.id;

         return {
            code: 200,
            success: true,
            message: "Logged in successfully",
            user: existingUser,
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

   @Mutation((_returns) => Boolean)
   async logout(@Ctx() { req, res }: Context): Promise<Boolean> {
      return new Promise((resolve, _rejects) => {
         res.clearCookie(COOKIE_NAME);
         req.session.destroy((error) => {
            if (error) {
               console.log("DESTROYING SESSION ERROR", error);
               resolve(false);
            }
            resolve(true);
         });
      });
   }

   @Mutation((_return) => Boolean)
   async forgotPassword(
      @Arg("forgotPasswordInput") forgotPasswordInput: ForgotPasswordInput
   ): Promise<boolean> {
      const user = await User.findOneBy({ email: forgotPasswordInput.email });
      console.log({ user });

      if (!user) return true;
      const token = "asdfasdhfljsglhsjfdg";

      // save token to db
      await new TokenModel({ userId: `${user.id}`, token }).save();

      // send reset password link to user via email
      await sendEmail(
         forgotPasswordInput.email,
         `<a href="http://localhost:3000/change-password?token=${token}">Click here to reset your password</a>`
      );
      return true;
   }
}
