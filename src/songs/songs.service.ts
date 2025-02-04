import { Injectable, Scope } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Song } from './song.entity';
import { CreateSongDTO } from './dto/create-song-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateSongDto } from './dto/update-song-dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Artist } from 'src/artists/artist.entity';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private songsRepository: Repository<Song>,
    @InjectRepository(Artist)
    private artistsRepository: Repository<Artist>,
  ) {}

  async create(songDTO: CreateSongDTO): Promise<Song> {
    const song = new Song();
    song.title = songDTO.title;
    song.duration = songDTO.duration;
    song.lyrics = songDTO.lyrics;
    song.releasedDate = songDTO.releasedDate;

    const artists = await this.artistsRepository.findByIds(songDTO.artists);
    song.artists = artists;

    return this.songsRepository.save(song);
  }
  findAll(): Promise<Song[]> {
    return this.songsRepository.find({ relations: ['artists'] });
  }
  findOne(id: number): Promise<Song> {
    return this.songsRepository.findOne({
      where: { id },
      relations: ['artists'],
    });
  }
  async remove(id: number): Promise<DeleteResult> {
    return await this.songsRepository.delete(id);
  }
  update(id: number, recordToUpdate: UpdateSongDto): Promise<UpdateResult> {
    return this.songsRepository.update(id, recordToUpdate);
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Song>> {
    const queryBuilder = this.songsRepository.createQueryBuilder('song');
    queryBuilder.leftJoinAndSelect('song.artists', 'artist');
    queryBuilder.orderBy('song.releasedDate', 'DESC');
    return paginate<Song>(queryBuilder, options);
  }
}
