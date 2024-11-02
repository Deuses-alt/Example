import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }

  protected getRequestResponse(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    return { req: request, res: response };
  }

  protected async getUserKey(context: ExecutionContext): Promise<string> {
    const { req } = this.getRequestResponse(context);
    return req.user ? req.user.id : await this.getTracker(req);
  }
}