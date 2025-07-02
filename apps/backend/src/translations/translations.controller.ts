import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express'; // Import the Response type from the express package
import { existsSync } from 'fs';
import { join } from 'path';
import { Public } from 'src/common/decorators/public.decorator';
@Controller('translations')
export class TranslationsController {
  @Get(':lng')
  @Public()
  sendFile(@Res() res: Response, @Param('lng') lng: string) {
    const filePath = join(
      process.cwd(),
      '/public/locales',
      `/${lng}`,
      '/translation.json',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Locale file not found for language ${lng}`);
    }

    res.sendFile(filePath);
  }
}
