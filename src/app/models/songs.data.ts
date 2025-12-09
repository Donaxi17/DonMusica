import { Song } from '../services/playlist.service';

// Todas las canciones disponibles en la aplicación
export const ALL_SONGS: Song[] = [
    // CANSERBERO
    {
        id: 1,
        artistId: 1,
        img: "/assets/img/Epico-canserbero.webp",
        title: "Es Épico",
        artist: "Canserbero",
        duration: "6:20",
        url: "/assets/audio/canserbero/Canserbero - Es Épico [Muerte].mp3"
    },
    {
        id: 2,
        artistId: 1,
        img: "/assets/img/Muerte.webp",
        title: "Mundo de Piedra",
        artist: "Canserbero",
        duration: "4:45",
        url: "/assets/audio/canserbero/Canserbero - Mundo de Piedra [Muerte].mp3"
    },
    {
        id: 3,
        artistId: 1,
        img: "/assets/img/Muerte.webp",
        title: "Maquiavélico",
        artist: "Canserbero",
        duration: "4:45",
        url: "/assets/audio/canserbero/Canserbero - Maquiavélico [Muerte].mp3"
    },
    {
        id: 4,
        artistId: 1,
        img: "/assets/img/Muerte.webp",
        title: "Jeremías 17:5",
        artist: "Canserbero",
        duration: "5:18",
        url: "/assets/audio/canserbero/Canserbero - Jeremías 17_5 [Muerte].mp3"
    },
    {
        id: 5,
        artistId: 1,
        img: "/assets/img/Muerte.webp",
        title: "El Primer Trago",
        artist: "Canserbero",
        duration: "6:20",
        url: "/assets/audio/canserbero/Canserbero - El Primer Trago [Muerte].mp3"
    },
    {
        id: 6,
        artistId: 1,
        img: "/assets/img/Vida.webp",
        title: "Pensando en Tí",
        artist: "Canserbero",
        duration: "4:02",
        url: "/assets/audio/canserbero/Canserbero - Pensando en Tí [Vida].mp3"
    },
    {
        id: 7,
        artistId: 1,
        img: "/assets/img/Epico-canserbero.webp",
        title: "Querer Querernos (Versión Acústica)",
        artist: "Canserbero",
        duration: "3:56",
        url: "/assets/audio/canserbero/Canserbero - Querer Querernos (Versión Acústica).mp3"
    },
    {
        id: 8,
        artistId: 1,
        img: "/assets/img/Vida.webp",
        title: "Y la Felicidad Qué?",
        artist: "Canserbero",
        duration: "4:54",
        url: "/assets/audio/canserbero/Canserbero - Y la Felicidad Qué_ [Vida].mp3"
    },
    {
        id: 9,
        artistId: 1,
        img: "/assets/img/Epico-canserbero.webp",
        title: "Stupid Love Story",
        artist: "Canserbero",
        duration: "4:41",
        url: "/assets/audio/canserbero/Canserbero Stupid Love Story [Apa y Can].mp3"
    },
    {
        id: 10,
        artistId: 1,
        img: "/assets/img/Epico-canserbero.webp",
        title: "Cuando Vayas Conmigo",
        artist: "Canserbero",
        duration: "4:16",
        url: "/assets/audio/canserbero/Cuando Vayas Conmigo.mp3"
    },

    // BAD BUNNY
    {
        id: 11,
        artistId: 2,
        img: "https://i.scdn.co/image/ab67616d0000b27349d694203245f241a1bcaa72",
        title: "Me Porto Bonito",
        artist: "Bad Bunny",
        duration: "3:11",
        url: "/assets/audio/badbunny/Me Porto Bonito.mp3"
    },
    {
        id: 12,
        artistId: 2,
        img: "https://i.scdn.co/image/ab67616d0000b27349d694203245f241a1bcaa72",
        title: "Tití Me Preguntó",
        artist: "Bad Bunny",
        duration: "4:50",
        url: "/assets/audio/badbunny/Tití Me Preguntó.mp3"
    },

    // KAROL G
    {
        id: 21,
        artistId: 3,
        img: "/assets/img/provenza.webp",
        title: "Provenza",
        artist: "Karol G",
        duration: "3:46",
        url: "/assets/audio/karolg/Provenza.mp3"
    },
    {
        id: 22,
        artistId: 3,
        img: "https://i.pinimg.com/736x/db/51/5b/db515bb82c0d38509a62f7dd2073c0a3.jpg",
        title: "Papasito",
        artist: "Karol G",
        duration: "3:17",
        url: "/assets/audio/karolg/Papasito.mp3"
    },
    {
        id: 23,
        artistId: 3,
        img: "https://i1.sndcdn.com/artworks-TTDsE8Jj2gF855AL-hFnpUQ-t500x500.jpg",
        title: "Si Antes Te Hubiera Conocido",
        artist: "Karol G",
        duration: "3:15",
        url: "/assets/audio/karolg/Si Antes Te Hubiera Conocido.mp3"
    },
    {
        id: 24,
        artistId: 3,
        img: "https://i1.sndcdn.com/artworks-VG18Mjwh3Kso3KFE-cin9OA-t500x500.png",
        title: "Amargura",
        artist: "Karol G",
        duration: "3:20",
        url: "/assets/audio/karolg/Amargura.mp3"
    },

    // BLESSD
    {
        id: 31,
        artistId: 4,
        img: "https://monitorlatino.com/wp-content/uploads/2023/04/blessd-1.jpg",
        title: "Soltera",
        artist: "Blessd",
        duration: "3:20",
        url: "/assets/audio/blessd/Soltera.mp3"
    },
    {
        id: 32,
        artistId: 4,
        img: "https://i1.sndcdn.com/artworks-nwKj8WVisMWF4qyJ-CmAMlA-t500x500.jpg",
        title: "YOGURCITO",
        artist: "Blessd",
        duration: "2:55",
        url: "/assets/audio/blessd/YOGURCITO.mp3"
    },
    {
        id: 33,
        artistId: 4,
        img: "https://www.teleantioquia.co/wp-content/1200x675/uploads/2024/07/IMG_7539.jpg",
        title: "MÍRAME",
        artist: "Blessd",
        duration: "3:15",
        url: "/assets/audio/blessd/MÍRAME.mp3"
    },

    // BEELE
    {
        id: 41,
        artistId: 5,
        img: "https://cdn-images.dzcdn.net/images/cover/58df15d280fca5b54798cf274b821061/0x1900-000000-80-0-0.jpg",
        title: "Si Te Pillara",
        artist: "Beele",
        duration: "3:07",
        url: "/assets/audio/beele/Si Te Pillara.mp3"
    },
    {
        id: 42,
        artistId: 5,
        img: "https://akamai.sscdn.co/uploadfile/letras/fotos/a/9/4/6/a946f6b4b1b7fc066fbc0e46b5ab8dea.jpg",
        title: "No Tienes Sentido",
        artist: "Beele",
        duration: "2:52",
        url: "/assets/audio/beele/No Tienes Sentido.mp3"
    },
    {
        id: 43,
        artistId: 5,
        img: "https://akamai.sscdn.co/uploadfile/letras/fotos/a/9/4/6/a946f6b4b1b7fc066fbc0e46b5ab8dea.jpg",
        title: "Top Diesel",
        artist: "Beele",
        duration: "3:13",
        url: "/assets/audio/beele/Top Diesel.mp3"
    },
    {
        id: 44,
        artistId: 5,
        img: "https://www.cevirce.com/lyrics/wp-content/uploads/2021/11/beele-si-te-interesa-i%CC%87spanyolca-sozleri-turkce-anlamlari-1.jpg",
        title: "Si Te Interesa",
        artist: "Beele",
        duration: "4:05",
        url: "/assets/audio/beele/Si Te Interesa.mp3"
    },
    {
        id: 45,
        artistId: 5,
        img: "https://i1.sndcdn.com/artworks-vykLJCZ4fefVIOu9-vheXAA-t500x500.jpg",
        title: "Loco",
        artist: "Beele",
        duration: "4:12",
        url: "/assets/audio/beele/Loco.mp3"
    },
    {
        id: 46,
        artistId: 5,
        img: "https://i1.sndcdn.com/artworks-uKuqrOElTxlSOYsN-fVBFSA-t1080x1080.jpg",
        title: "Frente al Mar",
        artist: "Beele",
        duration: "2:48",
        url: "/assets/audio/beele/Frente al Mar.mp3"
    },
    {
        id: 47,
        artistId: 5,
        img: "https://i0.wp.com/masterfm.es/wp-content/uploads/2023/11/RAM02243-scaled.webp?fit=1920%2C1280&ssl=1",
        title: "Morena",
        artist: "Beele",
        duration: "3:11",
        url: "/assets/audio/beele/Morena.mp3"
    },
    {
        id: 48,
        artistId: 5,
        img: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f0/45/82/f0458283-370b-26e6-c592-a66df10ab07d/5021732661593.jpg/1200x630bf-60.jpg",
        title: "La Plena",
        artist: "Beele",
        duration: "2:30",
        url: "/assets/audio/beele/La Plena.mp3"
    },

    // OZUNA
    {
        id: 51,
        artistId: 6,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Ozuna-2019.jpg/250px-Ozuna-2019.jpg",
        title: "Taki Taki",
        artist: "Ozuna",
        duration: "3:32",
        url: "/assets/audio/ozuna/Taki Taki.mp3"
    },
    {
        id: 52,
        artistId: 6,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Ozuna-2019.jpg/250px-Ozuna-2019.jpg",
        title: "Se Preparó",
        artist: "Ozuna",
        duration: "3:08",
        url: "/assets/audio/ozuna/Se Preparó.mp3"
    },
    {
        id: 53,
        artistId: 6,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Ozuna-2019.jpg/250px-Ozuna-2019.jpg",
        title: "Dile Que Tu Me Quieres",
        artist: "Ozuna",
        duration: "3:46",
        url: "/assets/audio/ozuna/Dile Que Tu Me Quieres.mp3"
    },

    // ANUEL AA
    {
        id: 61,
        artistId: 7,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Anuel_AA_in_2022_2.jpg/250px-Anuel_AA_in_2022_2.jpg",
        title: "China",
        artist: "Anuel AA",
        duration: "5:01",
        url: "/assets/audio/anuelaa/China.mp3"
    },
    {
        id: 62,
        artistId: 7,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Anuel_AA_in_2022_2.jpg/250px-Anuel_AA_in_2022_2.jpg",
        title: "Secreto",
        artist: "Anuel AA",
        duration: "4:18",
        url: "/assets/audio/anuelaa/Secreto.mp3"
    },
    {
        id: 63,
        artistId: 7,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Anuel_AA_in_2022_2.jpg/250px-Anuel_AA_in_2022_2.jpg",
        title: "Ella Quiere Beber",
        artist: "Anuel AA",
        duration: "3:30",
        url: "/assets/audio/anuelaa/Ella Quiere Beber.mp3"
    },

    // ARCÁNGEL
    {
        id: 71,
        artistId: 8,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png/250px-Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png",
        title: "La Jumpa",
        artist: "Arcángel",
        duration: "4:15",
        url: "/assets/audio/arcangel/La Jumpa.mp3"
    },
    {
        id: 72,
        artistId: 8,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png/250px-Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png",
        title: "Sigues Con Él",
        artist: "Arcángel",
        duration: "3:46",
        url: "/assets/audio/arcangel/Sigues Con Él.mp3"
    },
    {
        id: 73,
        artistId: 8,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png/250px-Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png",
        title: "Me Prefieres a Mí",
        artist: "Arcángel",
        duration: "3:12",
        url: "/assets/audio/arcangel/Me Prefieres a Mí.mp3"
    },

    // J BALVIN
    {
        id: 81,
        artistId: 9,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/J_Balvin_2019_by_Glenn_Francis_%28cropped%29.jpg/250px-J_Balvin_2019_by_Glenn_Francis_%28cropped%29.jpg",
        title: "Mi Gente",
        artist: "J Balvin",
        duration: "3:10",
        url: "/assets/audio/jbalvin/Mi Gente.mp3"
    },

    // MALUMA
    {
        id: 91,
        artistId: 10,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Maluma_2022.png/250px-Maluma_2022.png",
        title: "Hawái",
        artist: "Maluma",
        duration: "3:20",
        url: "/assets/audio/maluma/Hawái.mp3"
    },
    {
        id: 92,
        artistId: 10,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Maluma_2022.png/250px-Maluma_2022.png",
        title: "Felices los 4",
        artist: "Maluma",
        duration: "3:49",
        url: "/assets/audio/maluma/Felices los 4.mp3"
    },
    {
        id: 93,
        artistId: 10,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Maluma_2022.png/250px-Maluma_2022.png",
        title: "Borro Cassette",
        artist: "Maluma",
        duration: "3:27",
        url: "/assets/audio/maluma/Borro Cassette.mp3"
    },

    // FEID
    {
        id: 101,
        artistId: 11,
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwXxEoN0vVLqBqGqLJYGMxdKdJbPVBJqNpwQ&s",
        title: "Normal",
        artist: "Feid",
        duration: "3:25",
        url: "/assets/audio/feid/Normal.mp3"
    },

    // RAUW ALEJANDRO
    {
        id: 111,
        artistId: 12,
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Rauw_Alejandro_2023.png/250px-Rauw_Alejandro_2023.png",
        title: "Todo de Ti",
        artist: "Rauw Alejandro",
        duration: "3:17",
        url: "/assets/audio/rauw/Todo de Ti.mp3"
    }
];
