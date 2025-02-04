import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './playlist.entity';
import { Song } from 'src/songs/song.entity';
import { User } from 'src/users/user.entity';
import { CreatePlayListDTO } from './dto/create-playlist.dto';
import { Repository } from 'typeorm';

@Injectable()
export class PlayListsService {
  constructor(
    @InjectRepository(Playlist)
    private playListRepo: Repository<Playlist>,

    @InjectRepository(Song)
    private songsRepo: Repository<Song>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
  async create(playListDTO: CreatePlayListDTO): Promise<Playlist> {
    const playlist = new Playlist();
    playlist.name = playListDTO.name;

    const user = await this.userRepo.findOneBy({ id: playListDTO.user });
    playlist.user = user;

    return this.playListRepo.save(playlist);
  }
}
