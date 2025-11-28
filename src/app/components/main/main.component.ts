import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('particlesCanvas') particlesCanvas!: ElementRef<HTMLCanvasElement>;
  private animationId: number = 0;

  tituloMusicaActual: string = "Selecciona una canción";
  artistaMusicaActual: string = "Artista";
  imgMusicaActual: string = "/assets/img/default-album.jpg"; // Imagen por defecto
  urlMusicaActual: string = "";
  idMusicaActual: number = 0;

  playlistInfoTextButtons: string = "bx-play";
  isPlaying: boolean = false;
  currentSong: number | null = null;
  audio = new Audio();

  currentView: 'home' | 'artists' | 'player' = 'home';
  selectedArtist: any = null;

  // --- LISTA DE ARTISTAS ---
  artistsList = [
    {
      id: 1,
      name: "Canserbero",
      genre: "Rap / Hip-Hop",
      image: "/assets/img/Epico-canserbero.jpg",
      description: "Ícono del rap latinoamericano"
    },
    {
      id: 2,
      name: "Bad Bunny",
      genre: "Trap / Reggaeton",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg/250px-Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg",
      description: "El Conejo Malo del trap"
    },
    {
      id: 3,
      name: "Karol G",
      genre: "Reggaeton / Pop",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2023-11-16_Gala_de_los_Latin_Grammy%2C_15_%28cropped_2%29.jpg/500px-2023-11-16_Gala_de_los_Latin_Grammy%2C_15_%28cropped_2%29.jpg",
      description: "La Bichota del reggaeton"
    },
    {
      id: 4,
      name: "Blessd",
      genre: "Reggaeton / Trap",
      image: "https://monitorlatino.com/wp-content/uploads/2023/04/blessd-1.jpg",
      description: "El Bendito"
    },
    {
      id: 5,
      name: "Beele",
      genre: "Dancehall / Reggaeton",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtmDPNVs-66PW1Z_Oknv0fUaQk4ubf77OdEQ&s",
      description: "Cantante barranquillero de música urbana"
    },
    {
      id: 6,
      name: "Ozuna",
      genre: "Reggaeton / Trap",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Ozuna-2019.jpg/250px-Ozuna-2019.jpg",
      description: "El negrito de ojos claros"
    },
    {
      id: 7,
      name: "Anuel AA",
      genre: "Trap Latino",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Anuel_AA_in_2022_2.jpg/250px-Anuel_AA_in_2022_2.jpg",
      description: "Real hasta la muerte"
    },
    {
      id: 8,
      name: "Arcángel",
      genre: "Reggaeton / Trap",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png/250px-Arc%C3%A1ngel_2023_Interview_-_Tony_Dandrades.png",
      description: "La Maravilla"
    },
    {
      id: 9,
      name: "Maluma",
      genre: "Reggaeton / Pop",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg",
      description: "Pretty boy, dirty boy"
    },
    {
      id: 10,
      name: "Shakira",
      genre: "Pop Latino / Rock",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg/330px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg",
      description: "La Reina del Pop Latino"
    },
    {
      id: 11,
      name: "Rosalía",
      genre: "Flamenco / Urbano",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg",
      description: "La Motomami"
    },
    {
      id: 12,
      name: "Becky G",
      genre: "Reggaeton / Pop",
      image: "https://www.los40.com.ec/wp-content/uploads/2024/10/becky-g-oscar-nom.jpg",
      description: "Mala Santa"
    }
  ];

  // --- AQUÍ AGREGAS TODAS LAS CANCIONES ---
  allSongs = [
    // CANSERBERO
    {
      id: 1,
      artistId: 1,
      img: "/assets/img/Epico-canserbero.jpg",
      title: "Es Épico",
      artist: "Canserbero",
      duration: "6:20",
      url: "/assets/audio/Canserbero - Es Épico [Muerte].mp3"
    },
    {
      id: 2,
      artistId: 1,
      img: "/assets/img/Muerte.jpg",
      title: "Mundo de Piedra",
      artist: "Canserbero",
      duration: "4:45",
      url: "/assets/audio/Canserbero - Mundo de Piedra [Muerte].mp3"
    },
    {
      id: 3,
      artistId: 1,
      img: "/assets/img/Muerte.jpg",
      title: "Maquiavélico",
      artist: "Canserbero",
      duration: "4:45",
      url: "/assets/audio/Canserbero - Maquiavélico [Muerte].mp3"
    },
    {
      id: 4,
      artistId: 1,
      img: "/assets/img/Muerte.jpg",
      title: "Jeremías 17:5",
      artist: "Canserbero",
      duration: "5:18",
      url: "/assets/audio/Canserbero - Jeremías 17_5 [Muerte].mp3"
    },
    {
      id: 5,
      artistId: 1,
      img: "/assets/img/Muerte.jpg",
      title: "El Primer Trago",
      artist: "Canserbero",
      duration: "6:20",
      url: "/assets/audio/Canserbero - El Primer Trago [Muerte].mp3"
    },
    {
      id: 6,
      artistId: 1,
      img: "/assets/img/Vida.jpg",
      title: "Pensando en Tí",
      artist: "Canserbero",
      duration: "4:02",
      url: "/assets/audio/Canserbero - Pensando en Tí [Vida].mp3"
    },
    {
      id: 7,
      artistId: 1,
      img: "/assets/img/Epico-canserbero.jpg",
      title: "Querer Querernos (Versión Acústica)",
      artist: "Canserbero",
      duration: "3:56",
      url: "/assets/audio/Canserbero - Querer Querernos (Versión Acústica).mp3"
    },
    {
      id: 8,
      artistId: 1,
      img: "/assets/img/Vida.jpg",
      title: "Y la Felicidad Qué?",
      artist: "Canserbero",
      duration: "4:54",
      url: "/assets/audio/Canserbero - Y la Felicidad Qué_ [Vida].mp3"
    },
    {
      id: 9,
      artistId: 1,
      img: "/assets/img/Epico-canserbero.jpg",
      title: "Stupid Love Story",
      artist: "Canserbero",
      duration: "4:41",
      url: "/assets/audio/Canserbero Stupid Love Story [Apa y Can].mp3"
    },
    {
      id: 10,
      artistId: 1,
      img: "/assets/img/Epico-canserbero.jpg",
      title: "Cuando Vayas Conmigo",
      artist: "Canserbero",
      duration: "4:16",
      url: "/assets/audio/Cuando Vayas Conmigo.mp3"
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

    // MALUMA
    {
      id: 81,
      artistId: 9,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg",
      title: "Hawái",
      artist: "Maluma",
      duration: "3:20",
      url: "/assets/audio/maluma/Hawái.mp3"
    },
    {
      id: 82,
      artistId: 9,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg",
      title: "Felices los 4",
      artist: "Maluma",
      duration: "3:49",
      url: "/assets/audio/maluma/Felices los 4.mp3"
    },
    {
      id: 83,
      artistId: 9,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_20_%28Maluma%29.jpg",
      title: "Borro Cassette",
      artist: "Maluma",
      duration: "3:27",
      url: "/assets/audio/maluma/Borro Cassette.mp3"
    },

    // SHAKIRA
    {
      id: 91,
      artistId: 10,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg/330px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg",
      title: "Bzrp Music Sessions, Vol. 53",
      artist: "Shakira",
      duration: "3:33",
      url: "/assets/audio/shakira/Bzrp Music Sessions, Vol. 53.mp3"
    },
    {
      id: 92,
      artistId: 10,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg/330px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg",
      title: "Hips Don't Lie",
      artist: "Shakira",
      duration: "3:38",
      url: "/assets/audio/shakira/Hips Don't Lie.mp3"
    },
    {
      id: 93,
      artistId: 10,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg/330px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2901.jpg",
      title: "Waka Waka",
      artist: "Shakira",
      duration: "3:22",
      url: "/assets/audio/shakira/Waka Waka.mp3"
    },

    // ROSALÍA
    {
      id: 101,
      artistId: 11,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg",
      title: "Despechá",
      artist: "Rosalía",
      duration: "2:37",
      url: "/assets/audio/rosalia/Despechá.mp3"
    },
    {
      id: 102,
      artistId: 11,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg",
      title: "Con Altura",
      artist: "Rosalía",
      duration: "2:41",
      url: "/assets/audio/rosalia/Con Altura.mp3"
    },
    {
      id: 103,
      artistId: 11,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg/250px-2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg",
      title: "Bizcochito",
      artist: "Rosalía",
      duration: "1:49",
      url: "/assets/audio/rosalia/Bizcochito.mp3"
    },

    // BECKY G
    {
      id: 111,
      artistId: 12,
      img: "https://www.los40.com.ec/wp-content/uploads/2024/10/becky-g-oscar-nom.jpg",
      title: "Mamiii",
      artist: "Becky G",
      duration: "3:47",
      url: "/assets/audio/beckyg/Mamiii.mp3"
    },
    {
      id: 112,
      artistId: 12,
      img: "https://www.los40.com.ec/wp-content/uploads/2024/10/becky-g-oscar-nom.jpg",
      title: "Sin Pijama",
      artist: "Becky G",
      duration: "3:08",
      url: "/assets/audio/beckyg/Sin Pijama.mp3"
    },
    {
      id: 113,
      artistId: 12,
      img: "https://www.los40.com.ec/wp-content/uploads/2024/10/becky-g-oscar-nom.jpg",
      title: "Mayores",
      artist: "Becky G",
      duration: "3:23",
      url: "/assets/audio/beckyg/Mayores.mp3"
    }
  ];


  // Esta lista se llenará automáticamente cuando selecciones un artista
  playlist: any[] = [];

  ngOnInit(): void {
    // Escuchar cuando termina la canción para pasar a la siguiente
    this.audio.addEventListener('ended', () => {
      this.playNextSong();
    });
  }

  ngAfterViewInit(): void {
    this.initParticles();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // Detener audio al salir
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }
  }

  clickInint(id: number) {
    const song = this.playlist.find(s => s.id === id);
    if (!song) return;

    this.tituloMusicaActual = song.title;
    this.artistaMusicaActual = song.artist;
    this.imgMusicaActual = song.img;
    this.idMusicaActual = id;

    if (this.currentSong === id) {
      // Toggle play/pause
      if (this.isPlaying) {
        this.audio.pause();
        this.playlistInfoTextButtons = "bx-caret-right";
      } else {
        this.audio.play();
        this.playlistInfoTextButtons = "bx-pause";
      }
      this.isPlaying = !this.isPlaying;
    } else {
      // Nueva canción
      this.audio.src = song.url;
      this.audio.load();
      this.audio.play();
      this.currentSong = id;
      this.isPlaying = true;
      this.playlistInfoTextButtons = "bx-pause";
    }
  }

  playNextSong() {
    const currentSongIndex = this.playlist.findIndex(s => s.id === this.currentSong);

    // Si hay una siguiente canción en la lista actual
    if (currentSongIndex !== -1 && currentSongIndex < this.playlist.length - 1) {
      const nextSong = this.playlist[currentSongIndex + 1];
      this.clickInint(nextSong.id);
    } else {
      // Si es la última canción, pasamos al siguiente artista
      this.playNextArtist();
    }
  }

  playNextArtist() {
    if (!this.selectedArtist) return;

    const currentArtistIndex = this.artistsList.findIndex(a => a.id === this.selectedArtist.id);

    if (currentArtistIndex !== -1) {
      let nextArtistIndex = currentArtistIndex + 1;

      // Si llegamos al final de los artistas, volvemos al primero (bucle infinito)
      if (nextArtistIndex >= this.artistsList.length) {
        nextArtistIndex = 0;
      }

      const nextArtist = this.artistsList[nextArtistIndex];
      this.selectArtist(nextArtist, true); // true activa la reproducción automática
    }
  }

  updateCurrentSongInfo(song: { id: any; img: any; title: any; artist: any; duration?: string; url?: string; }) {
    this.tituloMusicaActual = song.title;
    this.artistaMusicaActual = song.artist;
    this.imgMusicaActual = song.img;
    this.idMusicaActual = song.id;
  }

  downloadMusic(id: number): void {
    const song = this.playlist.find(s => s.id === id);
    if (!song) return;

    const link = document.createElement('a');
    link.href = song.url;
    link.download = song.title + '.mp3';
    link.target = "_blank"; // Importante para URLs externas
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  shareLink(): void {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: this.tituloMusicaActual,
        url: url
      })
        .catch((error) => console.log('Error compartiendo:', error));
    } else {
      navigator.clipboard.writeText(url)
        .then(() => alert('Link copiado al portapapeles'))
        .catch(() => alert('Error al copiar el link'));
    }
  }

  shareOnWhatsApp() {
    const text = 'Escucha esta canción: ';
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  }

  navigateTo(view: 'home' | 'artists' | 'player') {
    this.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectArtist(artist: any, autoPlay: boolean = false) {
    this.selectedArtist = artist;
    // Filtrar canciones del artista seleccionado
    this.playlist = this.allSongs.filter(song => song.artistId === artist.id);

    // Si el artista tiene canciones, preparamos la primera
    if (this.playlist.length > 0) {
      const firstSong = this.playlist[0];

      // Actualizamos la info visual
      this.tituloMusicaActual = firstSong.title;
      this.artistaMusicaActual = firstSong.artist;
      this.imgMusicaActual = firstSong.img;
      this.urlMusicaActual = firstSong.url;

      if (autoPlay) {
        // Si es reproducción automática (cambio de artista), reproducimos de una vez
        this.clickInint(firstSong.id);
      } else {
        // Si es selección manual, solo cargamos sin reproducir
        this.audio.src = firstSong.url;
        this.currentSong = null; // Reseteamos para que el botón muestre Play
        this.isPlaying = false;
        this.playlistInfoTextButtons = "bx-play";
      }
    } else {
      // Reset si no hay canciones
      this.tituloMusicaActual = "No hay canciones";
      this.artistaMusicaActual = artist.name;
      this.imgMusicaActual = artist.image;
    }

    this.navigateTo('player');
  }

  initParticles() {
    const canvas = this.particlesCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)'; // Emerald color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }
}
