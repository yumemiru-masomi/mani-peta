export interface CircleData {
  x: number;
  y: number;
  radius: number;
  id: string;
}

export interface FaceMaskResponse {
  imageData: string; // base64 encoded image
  circles: CircleData[];
  imageWidth: number;
  imageHeight: number;
}
