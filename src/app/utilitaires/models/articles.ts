export interface CategoriesArticles {
    id: number;
    nom: string;
}
export interface Article {
    id?: number;
    titre_couverture: string;
    image_couverture:  File | null; // Vous pouvez utiliser le type correct ici, selon la façon dont vous traitez les images
    description_couverture: string;
    prix_par_defaut: number;
    date_publication?: Date;
    categories: number[]; // Utilisez le type correct ici pour les identifiants des catégories
    traductions: any[];
  }
  
export interface ArticleTraduction {
    id?: number;
    article: number;  // L'ID de l'article associé
    langue: string;
    titre: string;
    description: string;
    createdAt?: string;
  }