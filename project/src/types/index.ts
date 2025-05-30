export interface Animal {
  id: string
  name: string
  species: 'Ganado' | 'Caballos' // solo ganado y caballos
  breed: string
  gender: 'male' | 'female'
  birthDate: string
  tagNumber: string
  status: 'active' | 'sold' | 'deceased'
  notes: string
  parent: {
    motherId: string
    fatherId: string
  }
  farm: string
  purchaseInfo?: {
    date: string
    price: number
    seller: string
  }
  saleInfo?: {
    date: string
    price: number
    buyer: string
    notes?: string
  }
  deceasedInfo?: {
    date: string
    cause: string
    notes?: string
  }
  imageUrl?: string
}

export interface VaccinationRecord {
  id: string
  name: string
  description?: string
  lastApplied: string
  nextDueDate: string
  species: 'Ganado' | 'Caballos' | 'all'
  cost?: number
  notes?: string
}

export interface MedicalEvent {
  id: string
  animalId: string
  eventType: 'examination' | 'treatment' | 'surgery' | 'other'
  date: string
  description: string
  performedBy: string
  notes: string
}

export interface BreedingRecord {
  id: string
  femaleId: string
  maleId: string
  breedingDate: string
  expectedBirthDate?: string
  actualBirthDate?: string
  result?: 'pregnant' | 'not pregnant' | 'birthed' | 'aborted'
  offspringIds?: string[]
  notes: string
}

export interface WeightRecord {
  id: string
  animalId: string
  date: string
  weight: number // in kg
  notes: string
}

export interface MilkProduction {
  id: string
  date: string
  farm: string
  liters: number
  pricePerLiter: number
  expenses: MilkExpense[]
}

export interface MilkExpense {
  id: string
  description: string
  amount: number
  category: 'supplement' | 'medicine' | 'other'
  date: string
}

export interface MonthlyMilkData {
  date: string
  liters: number
  income: number
  expenses: number
  balance: number
}

export interface FarmMilkSummary {
  liters: number
  income: number
  expenses: number
  balance: number
}

export interface MilkProductionSummary {
  totalLiters: number
  totalIncome: number
  totalExpenses: number
  balance: number
  byFarm: Record<string, FarmMilkSummary>
  monthlyData: MonthlyMilkData[]
}