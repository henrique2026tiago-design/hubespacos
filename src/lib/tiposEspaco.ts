export type CamposEspaco = {
  name: string;
  description: string;
  capacity: string;
  pricePerHour: string;
  pricePeakHour: string;
  location: string;
  amenities: string;
};
export type EstadoEspaco = {
  mensagem?: string;
  erros?: Partial<Record<keyof CamposEspaco | "foto", string[]>>;
};
export type EspacoFormulario = CamposEspaco & { id: string; imageUrl: string };
