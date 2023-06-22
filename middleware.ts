import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

export function middleware(req: NextRequest) {
  console.log("middleware", req.url);
  const username = req.cookies.get("username")?.value
  const response = NextResponse.next();
  if (!username) {
    const username = `${faker.word.adjective()}-${faker.animal.type()}`
    response.cookies.set("username", username);
  }
  return response;
}

export const config = {
  matcher: '/'
}
