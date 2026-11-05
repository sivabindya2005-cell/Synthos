import { DrugMonograph } from '../types/clinical';
import { ALL_DRUGS, BENCHMARK_DRUGS, TARGET_SUPERFAMILIES } from './drugs/index';

// Export the full 300+ target-classified drug pharmacopeia
export const DRUG_MONOGRAPHS: DrugMonograph[] = ALL_DRUGS;

export { ALL_DRUGS, BENCHMARK_DRUGS, TARGET_SUPERFAMILIES };
