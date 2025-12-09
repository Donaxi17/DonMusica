// Modelo de datos para artistas
export interface Artist {
    id: number;
    name: string;
    genre: string;
    image: string;
    description: string;
}

// Lista de artistas disponibles
export const ARTISTS_DATA: Artist[] = [
    {
        id: 1,
        name: "Canserbero",
        genre: "Rap / Hip-Hop",
        image: "/assets/img/Epico-canserbero.webp",
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
        name: "J Balvin",
        genre: "Reggaeton / Pop",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/J_Balvin_2019_by_Glenn_Francis_%28cropped%29.jpg/250px-J_Balvin_2019_by_Glenn_Francis_%28cropped%29.jpg",
        description: "El negocio socio"
    },
    {
        id: 10,
        name: "Maluma",
        genre: "Reggaeton / Pop",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Maluma_2022.png/250px-Maluma_2022.png",
        description: "Pretty Boy, Dirty Boy"
    },
    {
        id: 11,
        name: "Feid",
        genre: "Reggaeton / R&B",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwXxEoN0vVLqBqGqLJYGMxdKdJbPVBJqNpwQ&s",
        description: "Ferxxo"
    },
    {
        id: 12,
        name: "Rauw Alejandro",
        genre: "Reggaeton / R&B",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Rauw_Alejandro_2023.png/250px-Rauw_Alejandro_2023.png",
        description: "Ra' Vanessa"
    }
];
