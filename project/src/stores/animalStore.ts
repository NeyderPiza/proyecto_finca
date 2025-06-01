import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Animal, VaccinationRecord, MilkProduction, MilkExpense, MilkProductionSummary, FarmMilkSummary, MonthlyMilkData } from '../types'
import { differenceInMonths, parseISO, format, addDays, differenceInYears, startOfYear, endOfYear, isWithinInterval } from 'date-fns'

export const useAnimalStore = defineStore('animals', () => {
  // Estado inicial
  const animals = ref<Animal[]>([
    {
      id: '1',
      name: 'Bella',
      species: 'Ganado',
      breed: 'Holstein',
      gender: 'female',
      birthDate: '2023-05-15',
      tagNumber: 'C001',
      status: 'active',
      notes: 'Vaca lechera en buenas condiciones',
      parent: { motherId: '', fatherId: '' },
      farm: 'Altamira',
      imageUrl: 'https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg'
    },
    {
      id: '2',
      name: 'Toro Negro',
      species: 'Ganado',
      breed: 'Angus',
      gender: 'male',
      birthDate: '2021-08-20',
      tagNumber: 'C002',
      status: 'active',
      notes: 'Toro reproductor',
      parent: { motherId: '', fatherId: '' },
      farm: 'LlanoGrande',
      purchaseInfo: {
        date: '2023-01-15',
        price: 5000000,
        seller: 'Ganadería El Progreso'
      },
      imageUrl: 'https://images.pexels.com/photos/162801/pexels-photo-162801.jpeg'
    },
    {
      id: '3',
      name: 'Relámpago',
      species: 'Caballos',
      breed: 'Pura Sangre',
      gender: 'male',
      birthDate: '2023-01-10',
      tagNumber: 'H001',
      status: 'sold',
      notes: 'Caballo de carreras',
      parent: { motherId: '', fatherId: '' },
      farm: 'Altamira',
      purchaseInfo: {
        date: '2023-02-15',
        price: 8000000,
        seller: 'Criadero El Potro'
      },
      saleInfo: {
        date: '2024-06-20',
        price: 12000000,
        buyer: 'Club Hípico Nacional',
        notes: 'Vendido para competencias'
      },
      imageUrl: 'https://images.pexels.com/photos/635499/pexels-photo-635499.jpeg'
    },
    {
      id: '4',
      name: 'Luna',
      species: 'Ganado',
      breed: 'Jersey',
      gender: 'female',
      birthDate: '2021-03-15',
      tagNumber: 'C003',
      status: 'deceased',
      notes: 'Excelente productora de leche',
      parent: { motherId: '1', fatherId: '' },
      farm: 'LlanoGrande',
      deceasedInfo: {
        date: '2024-12-10',
        cause: 'Complicaciones en el parto',
        notes: 'Se intentó tratamiento veterinario sin éxito'
      },
      imageUrl: 'https://images.pexels.com/photos/139235/pexels-photo-139235.jpeg'
    }
  ])

  const vaccinationRecords = ref<VaccinationRecord[]>([
    {
      id: '1',
      name: 'Aftosa',
      description: 'Vacunación contra la fiebre aftosa',
      lastApplied: '2024-11-15',
      nextDueDate: '2025-05-15',
      species: 'Ganado'
    },
    {
      id: '2',
      name: 'Brucelosis',
      description: 'Vacunación contra la brucelosis',
      lastApplied: '2025-03-10',
      nextDueDate: '2025-09-10',
      species: 'Ganado'
    },
    {
      id: '3',
      name: 'Influenza Equina',
      description: 'Vacunación contra la influenza equina',
      lastApplied: '2025-04-01',
      nextDueDate: '2025-10-01',
      species: 'Caballos'
    }
  ])

  const milkProductions = ref<MilkProduction[]>([
    {
      id: '1',
      date: '2025-05-01',
      farm: 'Altamira',
      liters: 1200,
      pricePerLiter: 2000,
      expenses: [
        {
          id: '1',
          description: 'Suplementos alimenticios',
          amount: 500000,
          category: 'supplement',
          date: '2025-05-01'
        },
        {
          id: '2',
          description: 'Medicamentos preventivos',
          amount: 300000,
          category: 'medicine',
          date: '2025-05-15'
        }
      ]
    },
    {
      id: '2',
      date: '2025-05-15',
      farm: 'LlanoGrande',
      liters: 800,
      pricePerLiter: 2000,
      expenses: [
        {
          id: '3',
          description: 'Suplementos alimenticios',
          amount: 350000,
          category: 'supplement',
          date: '2025-05-15'
        }
      ]
    }
  ])

  // Agregar estado para registros históricos
  const historicalMilkData = ref<{
    year: number;
    totalLiters: number;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyData: MonthlyMilkData[];
  }[]>([])

  // Getters
  const allAnimals = computed(() => animals.value)
  
  const activeAnimals = computed(() => 
    animals.value.filter(a => a.status === 'active')
  )
  
  const cattleCount = computed(() => 
    animals.value.filter(a => a.species === 'Ganado' && a.status === 'active').length
  )
  
  const horseCount = computed(() => 
    animals.value.filter(a => a.species === 'Caballos' && a.status === 'active').length
  )
  // Actions para vacunaciones
  function addVaccinationRecord(record: Omit<VaccinationRecord, 'id'>) {
    const id = Date.now().toString()
    const newRecord = { ...record, id }
    console.log('Agregando nueva vacuna:', newRecord) // Para debugging
    vaccinationRecords.value = [...vaccinationRecords.value, newRecord]
  }

  function updateVaccinationRecord(id: string, updates: Partial<VaccinationRecord>) {
    const index = vaccinationRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      console.log('Actualizando vacuna:', id, updates) // Para debugging
      vaccinationRecords.value[index] = { 
        ...vaccinationRecords.value[index], 
        ...updates 
      }
    }
  }

  function deleteVaccinationRecord(id: string) {
    const index = vaccinationRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      console.log('Eliminando vacuna:', id) // Para debugging
      vaccinationRecords.value = vaccinationRecords.value.filter(r => r.id !== id)
    }
  }
  
  const upcomingVaccinations = computed(() => {
    const now = new Date()
    const thirtyDaysFromNow = addDays(now, 30)
    return vaccinationRecords.value.filter(record => {
      const dueDate = parseISO(record.nextDueDate)
      return dueDate <= thirtyDaysFromNow && dueDate >= now
    })
  })
  
  const financialSummary = computed(() => {
    const purchasedAnimals = animals.value.filter(a => a.purchaseInfo)
    const soldAnimals = animals.value.filter(a => a.saleInfo)
    
    const totalInvestment = purchasedAnimals.reduce((sum, a) => 
      sum + (a.purchaseInfo?.price || 0), 0
    )
    const totalSales = soldAnimals.reduce((sum, a) => 
      sum + (a.saleInfo?.price || 0), 0
    )
    
    return {
      totalInvestment,
      totalSales,
      balance: totalSales - totalInvestment,
      bySpecies: {
        ganado: {
          purchases: {
            count: purchasedAnimals.filter(a => a.species === 'Ganado').length,
            total: purchasedAnimals
              .filter(a => a.species === 'Ganado')
              .reduce((sum, a) => sum + (a.purchaseInfo?.price || 0), 0)
          },
          sales: {
            count: soldAnimals.filter(a => a.species === 'Ganado').length,
            total: soldAnimals
              .filter(a => a.species === 'Ganado')
              .reduce((sum, a) => sum + (a.saleInfo?.price || 0), 0)
          }
        },
        caballos: {
          purchases: {
            count: purchasedAnimals.filter(a => a.species === 'Caballos').length,
            total: purchasedAnimals
              .filter(a => a.species === 'Caballos')
              .reduce((sum, a) => sum + (a.purchaseInfo?.price || 0), 0)
          },
          sales: {
            count: soldAnimals.filter(a => a.species === 'Caballos').length,
            total: soldAnimals
              .filter(a => a.species === 'Caballos')
              .reduce((sum, a) => sum + (a.saleInfo?.price || 0), 0)
          }
        }
      }
    }
  })

  const milkProductionSummary = computed(() => {
    const summary: MilkProductionSummary = {
      totalLiters: 0,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      byFarm: {},
      monthlyData: []
    }

    const farmData: Record<string, FarmMilkSummary> = {}
    const monthlyDataMap = new Map<string, MonthlyMilkData>()

    // Verificar si es necesario archivar los datos del año anterior
    const now = new Date()
    const currentYearStart = startOfYear(now)
    const currentYearEnd = endOfYear(now)

    const needsArchiving = milkProductions.value.some(prod => {
      const prodDate = parseISO(prod.date)
      return !isWithinInterval(prodDate, { start: currentYearStart, end: currentYearEnd })
    })

    if (needsArchiving) {
      archiveLastYearData()
    }

    // Filtrar solo las producciones del año actual
    const currentYearProductions = milkProductions.value.filter(prod => 
      isWithinInterval(parseISO(prod.date), { start: currentYearStart, end: currentYearEnd })
    )

    currentYearProductions.forEach(prod => {
      // Calcular totales
      const income = prod.liters * prod.pricePerLiter
      const expenses = prod.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      const balance = income - expenses

      summary.totalLiters += prod.liters
      summary.totalIncome += income
      summary.totalExpenses += expenses
      summary.balance += balance

      // Agrupar por finca
      if (!farmData[prod.farm]) {
        farmData[prod.farm] = {
          liters: 0,
          income: 0,
          expenses: 0,
          balance: 0
        }
      }
      farmData[prod.farm].liters += prod.liters
      farmData[prod.farm].income += income
      farmData[prod.farm].expenses += expenses
      farmData[prod.farm].balance += balance

      // Agrupar por mes
      const monthKey = prod.date.substring(0, 7) // YYYY-MM
      const monthData = monthlyDataMap.get(monthKey) || {
        date: monthKey,
        liters: 0,
        income: 0,
        expenses: 0,
        balance: 0
      }
      monthData.liters += prod.liters
      monthData.income += income
      monthData.expenses += expenses
      monthData.balance += balance
      monthlyDataMap.set(monthKey, monthData)
    })

    summary.byFarm = farmData
    summary.monthlyData = Array.from(monthlyDataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    return summary
  })

  const availableFarms = computed(() => 
    ['Altamira', 'LlanoGrande']
  )

  // Nueva función para archivar datos del año anterior
  function archiveLastYearData() {
    const now = new Date()
    const lastYear = now.getFullYear() - 1
    const start = startOfYear(new Date(lastYear, 0, 1))
    const end = endOfYear(new Date(lastYear, 0, 1))

    const lastYearProductions = milkProductions.value.filter(prod => {
      const prodDate = parseISO(prod.date)
      return isWithinInterval(prodDate, { start, end })
    })

    if (lastYearProductions.length === 0) return

    const yearlyData = {
      year: lastYear,
      totalLiters: 0,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      monthlyData: [] as MonthlyMilkData[]
    }

    const monthlyDataMap = new Map<string, MonthlyMilkData>()

    lastYearProductions.forEach(prod => {
      const income = prod.liters * prod.pricePerLiter
      const expenses = prod.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      yearlyData.totalLiters += prod.liters
      yearlyData.totalIncome += income
      yearlyData.totalExpenses += expenses

      const monthKey = prod.date.substring(0, 7)
      const monthData = monthlyDataMap.get(monthKey) || {
        date: monthKey,
        liters: 0,
        income: 0,
        expenses: 0,
        balance: 0
      }
      monthData.liters += prod.liters
      monthData.income += income
      monthData.expenses += expenses
      monthData.balance = monthData.income - monthData.expenses
      monthlyDataMap.set(monthKey, monthData)
    })

    yearlyData.balance = yearlyData.totalIncome - yearlyData.totalExpenses
    yearlyData.monthlyData = Array.from(monthlyDataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Guardar datos históricos
    historicalMilkData.value.push(yearlyData)

    // Actualizar las producciones actuales
    milkProductions.value = milkProductions.value.filter(prod => {
      const prodDate = parseISO(prod.date)
      return isWithinInterval(prodDate, { start: currentYearStart, end: currentYearEnd })
    })
  }

  // Actions
  function getAnimalById(id: string): Animal | undefined {
    return animals.value.find(a => a.id === id)
  }

  function addAnimal(animal: Omit<Animal, 'id'>) {
    const id = (animals.value.length + 1).toString()
    animals.value.push({ ...animal, id })
  }

  function updateAnimal(id: string, updates: Partial<Animal>) {
    const index = animals.value.findIndex(a => a.id === id)
    if (index !== -1) {
      animals.value[index] = { ...animals.value[index], ...updates }
    }
  }

  function deleteAnimal(id: string) {
    try {
      const index = animals.value.findIndex(a => a.id === id)
      if (index === -1) {
        console.error('Animal no encontrado:', id)
        return false
      }
      
      // Crear una nueva lista sin el animal eliminado
      const newAnimals = animals.value.filter(a => a.id !== id)
      
      // Actualizar la lista de animales
      animals.value = newAnimals
      
      console.log('Animal eliminado exitosamente:', id)
      return true
    } catch (error) {
      console.error('Error al eliminar animal:', error)
      return false
    }
  }

  function calculateAge(birthDate: string): string {
    const today = new Date()
    const birth = parseISO(birthDate)
    const years = differenceInYears(today, birth)
    const months = differenceInMonths(today, birth) % 12

    if (years > 0) {
      return `${years} año${years !== 1 ? 's' : ''} ${months > 0 ? `y ${months} mes${months !== 1 ? 'es' : ''}` : ''}`
    }
    return `${months} mes${months !== 1 ? 'es' : ''}`
  }

  // Actions para producción de leche
  function addMilkProduction(production: Omit<MilkProduction, 'id'>) {
    const id = (milkProductions.value.length + 1).toString()
    milkProductions.value.push({ ...production, id })
  }

  function addMilkExpense(productionId: string, expense: Omit<MilkExpense, 'id'>) {
    const production = milkProductions.value.find(p => p.id === productionId)
    if (production) {
      const id = (production.expenses.length + 1).toString()
      production.expenses.push({ ...expense, id })
    }
  }

  function updateMilkProduction(id: string, updates: Partial<MilkProduction>) {
    const index = milkProductions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      milkProductions.value[index] = { ...milkProductions.value[index], ...updates }
    }
  }

  function deleteMilkProduction(id: string) {
    const index = milkProductions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      milkProductions.value.splice(index, 1)
    }
  }

  function getHistoricalMonthlyData(year: number, month: number): MonthlyMilkData | undefined {
    const yearData = historicalMilkData.value.find(d => d.year === year)
    if (!yearData) return undefined

    const monthKey = `${year}-${month.toString().padStart(2, '0')}`
    return yearData.monthlyData.find(m => m.date === monthKey)
  }

  // Retornar las propiedades y métodos públicos
  return {
    // Estado
    animals,
    vaccinationRecords,
    milkProductions,
    historicalMilkData,
    
    // Getters
    allAnimals,
    activeAnimals,
    cattleCount,
    horseCount,
    upcomingVaccinations,
    financialSummary,
    milkProductionSummary,
    availableFarms,
    
    // Actions
    getAnimalById,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    calculateAge,
    addMilkProduction,
    addMilkExpense,
    updateMilkProduction,
    deleteMilkProduction,
    getHistoricalMonthlyData,
    addVaccinationRecord,
    updateVaccinationRecord,
    deleteVaccinationRecord
  }
})