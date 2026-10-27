import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type MyBidEntry, Role } from '@pregao/shared';
import { Auth, CurrentUser } from '../../common/auth/auth.decorators.js';
import type { RequestUser } from '../../common/auth/request-user.js';
import { MyBidEntryDto } from './dto/bid-response.dto.js';
import { MyBidsService } from './my-bids.service.js';

@ApiTags('Lances')
@Controller('me')
export class MyBidsController {
  constructor(private readonly myBids: MyBidsService) {}

  @Get('bids')
  @Auth(Role.BIDDER)
  @ApiOperation({
    summary: 'Meus arremates: lotes em que você deu lance, com a situação e o comprovante',
  })
  @ApiOkResponse({ type: [MyBidEntryDto] })
  list(@CurrentUser() user: RequestUser): Promise<MyBidEntry[]> {
    return this.myBids.list(user.id);
  }
}
