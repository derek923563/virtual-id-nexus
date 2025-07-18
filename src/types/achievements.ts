
export interface Achievement {
  id: string;
  _id?: string;
  title: string;
  description: string;
  icon: string;
  condition?: (member: any, score: number) => boolean;
  points: number;
}

export interface UserScore {
  totalPoints: number;
  level: string;
  title: string;
  achievements: string[];
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
}
