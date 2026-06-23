export interface AlternativeServer {
  name: string;
  url: string;
}

export interface MediaItem {
  id?: string;
  title: string;
  description: string;
  posterUrl: string;
  iframeUrl: string;
  type: 'movie' | 'series';
  rating: number;
  alternativeServers: AlternativeServer[];
  createdAt?: any;
  updatedAt?: any;
}

export interface AdsConfig {
  popunderCode: string;
  popunderActive: boolean;
  bannerAboveCode: string;
  bannerAboveActive: boolean;
  bannerBelowCode: string;
  bannerBelowActive: boolean;
}

export interface MaintenanceConfig {
  active: boolean;
  message: string;
}
