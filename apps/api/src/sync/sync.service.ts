import { DaDataService } from '../integrations/da-data/da-data.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { MoySkladService } from '../integrations/moy-sklad/moy-sklad.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(
    private daDataService: DaDataService,
    private moySkladService: MoySkladService,
    private prismaService: PrismaService,
  ) {}

  async syncByInn(contAgentInn: string, userId: string) {
    const suggestion = await this.daDataService.findPartyByInn(contAgentInn);

    if (!suggestion?.data?.inn) {
      throw new BadRequestException('DaData: company not found by INN/KPP');
    }

    console.log('===========>suggestion', suggestion);

    const inn = suggestion.data.inn;
    const kpp = suggestion.data.kpp;

    const legalName =
      suggestion.data.name?.short_with_opf ||
      suggestion.data.name?.full_with_opf ||
      suggestion.value;

    const address = suggestion.data.address?.value ?? null;
    const kontragentId = await this.moySkladService.createCounterpartyLegal({
      name: legalName,
      inn,
      legalAddress: address ?? undefined,
    });

    const updated = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        legalName,
        address,
        kontragentId,
      },
    });

    return updated;
  }
}
