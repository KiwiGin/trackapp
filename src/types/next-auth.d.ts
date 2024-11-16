import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: Usuario & DefaultSession["user"];
  }
}