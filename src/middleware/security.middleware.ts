import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ApiSecurityGuard implements CanActivate {

  private readonly allowedIp = process.env.ALLOWED_IP;
  private readonly allowedIps = [
    "127.0.0.1",
    "::1",
    this.allowedIp
  ];

  private readonly apiKey = process.env.API_KEY;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKeyHeader = request.headers["x-api-key"];

    if (!apiKeyHeader || apiKeyHeader !== this.apiKey) {
      throw new UnauthorizedException("Invalid API key");
    }
    
    const ip =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      request.socket.remoteAddress ||
      "";

    if (!this.allowedIps.includes(ip)) {
      throw new ForbiddenException(`IP ${ip} not allowed`);
    }

    return true;
  }
}
