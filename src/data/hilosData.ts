export interface Comment {
    id: number;
    author: string;
    text: string;
    date: string;
}

export interface Hilo {
    id: number;
    title: string;
    author: string;
    imageUrl: string;
    likes: number;
    comments: number;
    category: string;
    content?: string;
    date?: string;
    commentsList?: Comment[]; // Nueva lista de comentarios
}

export const initialHilosData: Hilo[] = [
    {
      id: 1,
      title: 'Best FPS games of 2024',
      author: 'John Doe',
      imageUrl: 'https://media.revistagq.com/photos/63e9f744df9a2fddd35517c5/16:9/w_2560%2Cc_limit/resident-evil-4-remake.jpeg',
      likes: 42,
      comments: 2,
      category: 'Shooter',
      content: 'Aquí discutiremos cuáles son los mejores shooters del año. He estado jugando RE4 Remake y es increíble, pero hay otros contendientes fuertes como el nuevo COD y Valorant.',
      date: '20/10/2025',
      commentsList: [
        { id: 101, author: 'GamerPro', text: '¡Totalmente de acuerdo! RE4 es una obra maestra.', date: '20/10/2025' },
        { id: 102, author: 'NoobMaster', text: 'Prefiero Valorant por el competitivo.', date: '21/10/2025' }
      ]
    },
    {
      id: 2,
      title: 'Indie gems you should try',
      author: 'Sarah',
      imageUrl: 'https://media.revistagq.com/photos/63e9f744df9a2fddd35517c5/16:9/w_2560%2Cc_limit/resident-evil-4-remake.jpeg',
      likes: 35,
      comments: 1,
      category: 'Indie',
      content: 'Los juegos indie están salvando la industria. Títulos como Hollow Knight o Celeste demuestran que no necesitas gráficos 4K para divertirte.',
      date: '22/10/2025',
      commentsList: [
        { id: 201, author: 'IndieLover', text: 'Hollow Knight es insuperable, esperando Silksong...', date: '22/10/2025' }
      ]
    },
    {
      id: 3,
      title: 'Latest gaming news',
      author: 'Mike',
      imageUrl: 'https://media.revistagq.com/photos/63e9f744df9a2fddd35517c5/16:9/w_2560%2Cc_limit/resident-evil-4-remake.jpeg',
      likes: 28,
      comments: 0,
      category: 'Noticias',
      content: 'Resumen semanal de noticias: Nuevos lanzamientos de consolas, retrasos en juegos AAA y rumores sobre GTA VI.',
      date: '23/10/2025',
      commentsList: []
    }
];