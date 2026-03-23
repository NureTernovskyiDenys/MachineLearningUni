export interface LaptopRaw {
  title: string;
  price: string;
  discount?: string;
  Processor?: string;
  RAM?: string;
  OS?: string;
  SSD?: string;
  Display?: string;
  In_build_sw?: string;
  warranty?: string;
}

export interface LaptopParsed {
  id: number;
  // Extracted Display texts
  company: string;
  product: string;
  typeName: string;
  screenResolution: string;
  
  originalPrice: string; // e.g. "₹37,990"
  
  // Extracted numbers for math
  price: number;
  ram: number;
  weight: number;
  cpuFreq: number;

  // Normalized [0, 1] for math
  normPrice: number;
  normRam: number;
  normWeight: number;
  normCpuFreq: number;
  
  // Similarity
  similarityScore?: number;
}

export interface IdealState {
  price: number;
  ram: number;
  weight: number;
  cpuFreq: number;
}
