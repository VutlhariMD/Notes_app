export type Category ='work'| 'study' | 'personal'

export type users={
    id:string,
    email:string,
    username: string,
    password:string,
    
}
export type Note={
 id : string,
 userId: string,
  title?: string;
  text: string;
  category: Category;
  createdAt: string;
  updatedAt?: string;
}