import { Artist } from '../../src/artists/artist.entity';
import { User } from '../../src/users/user.entity';
import { EntityManager } from 'typeorm';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Playlist } from '../../src/playlists/playlist.entity';

export const seedData = async (manager: EntityManager): Promise<void> => {
    try {
        await seedUser(manager);
        await seedArtist(manager);
        await seedPlayLists(manager);
        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

async function createUser(manager: EntityManager): Promise<User> {
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash('123456', salt);

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email();
    user.password = encryptedPassword;
    user.apiKey = uuidv4();
    await manager.getRepository(User).save(user);

    return user;
}

async function seedUser(manager: EntityManager): Promise<void> {
    await createUser(manager);
}

async function seedArtist(manager: EntityManager): Promise<void> {
    const user = await createUser(manager);

    const artist = new Artist();
    artist.user = user;
    await manager.getRepository(Artist).save(artist);
}

async function seedPlayLists(manager: EntityManager): Promise<void> {
    const user = await createUser(manager);

    const playList = new Playlist();
    playList.name = faker.music.genre();
    playList.user = user;

    await manager.getRepository(Playlist).save(playList);
}
