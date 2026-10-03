import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as eventosService from '@/services/eventos'

export const useEventosStore = defineStore('eventos', () => {
  // Eventos apagados nesta visita: os cards deles somem das listas sem precisar recarregar.
  const apagados = ref<number[]>([])

  async function apagar(id: number) {
    await eventosService.apagarEvento(id)
    apagados.value = [...apagados.value, id]
  }

  return { apagados, apagar }
})
