require("dotenv").config();
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import session from "express-session";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";
import { Context } from "./types/Context";
import cors from "cors";
import { COOKIE_NAME } from "./constants";
import { PostResolver } from "./resolvers/post";
import { sendEmail } from "./utils/sendEmail";
const MongoDBStore = require("connect-mongodb-session")(session);
import mongoose from "mongoose";

const main = async () => {
   await createConnection({
      type: "postgres",
      database: "reddit",
      username: process.env.DB_USERNAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      logging: true,
      synchronize: true,
      entities: [User, Post],
   });

   await sendEmail("tricdt@gmail.com", "<b>Hello Tri</b>");
   const app = express();

   app.use(
      cors({
         credentials: true,
         origin: [
            "https://studio.apollographql.com",
            "http://localhost:4000/graphql",
            "http://localhost:3000",
         ],
         methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
      })
   );
   //Session/Cookie store
   const mongoUrl = `mongodb://localhost:27017/learn-nextjs`;
   await mongoose.connect(mongoUrl, {});
   console.log("MongoDB connected");

   const store = new MongoDBStore({
      uri: mongoUrl,
      collection: "mySessions",
   });
   store.on("error", (error: any) => {
      console.log(error);
   });
   app.set("trust proxy", 1);
   app.use(
      session({
         name: COOKIE_NAME,
         store: store,
         cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            sameSite: false,
            secure: false,
         },
         secret: "This is a secret",
         // Boilerplate options, see:
         // * https://www.npmjs.com/package/express-session#resave
         // * https://www.npmjs.com/package/express-session#saveuninitialized
         saveUninitialized: false, // don't save empty sessions, right from the start
         resave: false,
      })
   );
   const apolloServer = new ApolloServer({
      schema: await buildSchema({
         resolvers: [HelloResolver, UserResolver, PostResolver],
         validate: false,
      }),
      context: ({ req, res }): Context => ({ req, res }),

      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
   });
   await apolloServer.start();
   apolloServer.applyMiddleware({ app, cors: false });
   const PORT = process.env.PORT || 4000;
   app.listen(PORT, () =>
      console.log(
         `Server started on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`
      )
   );
};

main().catch((error) => {
   console.log(error);
});
