import Papa from 'papaparse';
import type { LaptopRaw, LaptopParsed } from '../types';

function extractNumber(text: string | undefined, regex: RegExp): number | null {
  if (!text) return null;
  const match = text.match(regex);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return null;
}

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 50000;
  const cleaned = priceStr.replace(/[^\d]/g, '');
  const val = parseInt(cleaned, 10);
  return isNaN(val) ? 50000 : val;
}

function parseTypename(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('gaming')) return 'Gaming';
  if (lower.includes('thin and light')) return 'Thin & Light';
  if (lower.includes('2 in 1')) return '2-in-1';
  if (lower.includes('vivobook') || lower.includes('zenbook')) return 'Ultrabook';
  if (lower.includes('macbook')) return 'MacBook';
  return 'Notebook';
}

function parseWeight(desc: string, typeName: string): number {
  const w = extractNumber(desc, /([\d.]+)\s*kg/i);
  if (w !== null) return w;
  
  // Default based on type if missing
  switch(typeName) {
    case 'Gaming': return 2.4;
    case 'Thin & Light': return 1.4;
    case 'Ultrabook': return 1.3;
    case '2-in-1': return 1.5;
    case 'MacBook': return 1.25;
    default: return 1.8;
  }
}

function parseRAM(ramStr: string | undefined, title: string): number {
  let r = extractNumber(ramStr, /([\d.]+)\s*GB/i);
  if (!r) r = extractNumber(title, /([\d.]+)\s*GB/i);
  return r || 8;
}

function parseCPUFreq(processorStr: string | undefined): number {
  const freq = extractNumber(processorStr, /([\d.]+)\s*GHz/i);
  return freq || 2.4; // default conservative 2.4 GHz
}

function parseScreen(displayStr: string | undefined, title: string): string {
  const inchesMatch = (displayStr || '').match(/([\d.]+)\s*(?:inch|cm)/i) || title.match(/([\d.]+)\s*inch/i);
  const inches = inchesMatch ? `${inchesMatch[1]}"` : '15.6"';
  
  let res = 'FHD';
  const checkStr = (displayStr + ' ' + title).toUpperCase();
  if (checkStr.includes('4K')) res = '4K UHD';
  else if (checkStr.includes('OLED')) res = 'OLED FHD';
  else if (checkStr.includes('RETINA')) res = 'Retina';
  else if (checkStr.includes('QHD') || checkStr.includes('2K')) res = 'QHD';
  
  return `${inches} ${res}`;
}

export function processLaptops(csvText: string): LaptopParsed[] {
  const parsed = Papa.parse<LaptopRaw>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const laptops: LaptopParsed[] = [];
  let minPrice = Infinity, maxPrice = -Infinity;
  let minRam = Infinity, maxRam = -Infinity;
  let minWeight = Infinity, maxWeight = -Infinity;
  let minCpu = Infinity, maxCpu = -Infinity;

  parsed.data.forEach((row, idx) => {
    if (!row.title) return;
    
    // Extract textuals
    const tokens = row.title.split(' ');
    const company = tokens[0] || 'Unknown';
    const typeName = parseTypename(row.title);
    
    // Attempt product name
    const dashIdx = row.title.indexOf('-');
    const product = dashIdx > 0 ? row.title.substring(company.length, dashIdx).trim() : row.title.substring(company.length, 30).trim();
    
    const combinedDesc = `${row.title} ${row.Display || ''} ${row.In_build_sw || ''}`;
    
    // Extract numericals
    const price = parsePrice(row.price);
    const ram = parseRAM(row.RAM, row.title);
    const weight = parseWeight(combinedDesc, typeName);
    const cpuFreq = parseCPUFreq(row.Processor);
    const screenResolution = parseScreen(row.Display, row.title);

    // Update global min/max
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;
    if (ram < minRam) minRam = ram;
    if (ram > maxRam) maxRam = ram;
    if (weight < minWeight) minWeight = weight;
    if (weight > maxWeight) maxWeight = weight;
    if (cpuFreq < minCpu) minCpu = cpuFreq;
    if (cpuFreq > maxCpu) maxCpu = cpuFreq;

    laptops.push({
      id: idx,
      company,
      product,
      typeName,
      screenResolution,
      originalPrice: row.price || `₹${price}`,
      price,
      ram,
      weight,
      cpuFreq,
      normPrice: 0,
      normRam: 0,
      normWeight: 0,
      normCpuFreq: 0
    });
  });

  // Second pass: Min-Max Scaling [0, 1]
  const safeScale = (val: number, min: number, max: number) => {
    if (max === min) return 0.5;
    return (val - min) / (max - min);
  };

  laptops.forEach(lap => {
    lap.normPrice = safeScale(lap.price, minPrice, maxPrice);
    lap.normRam = safeScale(lap.ram, minRam, maxRam);
    lap.normWeight = safeScale(lap.weight, minWeight, maxWeight);
    lap.normCpuFreq = safeScale(lap.cpuFreq, minCpu, maxCpu);
  });

  return laptops;
}

export function calculateSimilarity(laptop: LaptopParsed, ideal: {
  normPrice: number;
  normRam: number;
  normWeight: number;
  normCpuFreq: number;
}): number {
  // Euclidean distance between laptop normalized values and ideal normalized values
  const dPrice = laptop.normPrice - ideal.normPrice;
  const dRam = laptop.normRam - ideal.normRam;
  const dWeight = laptop.normWeight - ideal.normWeight;
  const dCpu = laptop.normCpuFreq - ideal.normCpuFreq;

  const distanceSquared = (dPrice * dPrice) + (dRam * dRam) + (dWeight * dWeight) + (dCpu * dCpu);
  const distance = Math.sqrt(distanceSquared);
  
  // Max possible distance for 4 features in [0, 1] is sqrt(4) = 2
  const N = 4;
  const maxDist = Math.sqrt(N);
  
  // Score = (1 - Distance/sqrt(N)) * 100%
  const score = (1 - (distance / maxDist)) * 100;
  return Math.max(0, parseFloat(score.toFixed(2)));
}
