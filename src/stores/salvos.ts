import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Ainda não existe backend: os eventos salvos ficam no localStorage, separados por conta.
function lerSalvos(chave: string): number[] {
  try {
    return JSON.parse(localStorage.getItem(chave) ?? '[]')
  } catch {
    return []
  }
}

export const useSalvosStore = defineStore('salvos', () => {
  const auth = useAuthStore()
  const chave = computed(() => `evencon:salvos:${auth.usuario?.id ?? 'visitante'}`)
  const ids = ref<number[]>([])

  watch(chave, (nova) => (ids.value = lerSalvos(nova)), { immediate: true })

  function tem(id: number) {
    return ids.value.includes(id)
  }

  function alternar(id: number) {
    ids.value = tem(id) ? ids.value.filter((item) => item !== id) : [...ids.value, id]
    localStorage.setItem(chave.value, JSON.stringify(ids.value))
  }

  return { ids, tem, alternar }
})
