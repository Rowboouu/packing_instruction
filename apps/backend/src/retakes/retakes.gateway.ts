import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CreateRetakeDto } from './dto/create-retake.dto';
import { RetakesService } from './retakes.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RetakesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly retakesService: RetakesService) {}

  @SubscribeMessage('createRetake')
  create(@MessageBody() createRetakeDto: CreateRetakeDto) {
    return this.retakesService.create(createRetakeDto);
  }

  @SubscribeMessage('findAllRetakes')
  findAll() {
    return ''; //this.retakesService.findAll(query.page, query.limit);
  }

  // @SubscribeMessage('findOneRetake')
  // findOne(@MessageBody() id: number) {
  //   return this.retakesService.findOne(id);
  // }

  // @SubscribeMessage('updateRetake')
  // update(@MessageBody() updateRetakeDto: UpdateRetakeDto) {
  //   return this.retakesService.update(updateRetakeDto.id, updateRetakeDto);
  // }

  // @SubscribeMessage('removeRetake')
  // remove(@MessageBody() id: number) {
  //   return this.retakesService.remove(id);
  // }
}
