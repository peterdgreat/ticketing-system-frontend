<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import TicketList from '../components/TicketList.vue'
import TicketForm from '../components/TicketForm.vue'

const authStore = useAuthStore()
const router = useRouter()

console.log(`Authstore user${authStore}`)
const restoring = ref(true)
const tickets = ref([])

const { result, loading, error, refetch } = useQuery(gql`
  query tickets {
    tickets {
      id
      title
      description
      status
      user {
        id
        email
      }
    }
  }
`)
onMounted(async () => {
  console.log(`Iagent ${authStore.isAgent()}`)
  console.log(`custome ${authStore.isCustomer()}`)
  console.log(`TicketsView: User before restore: ${JSON.stringify(authStore.user)}`)
  const restored = await authStore.restoreUser()
  console.log(`TicketsView: User after restore: ${JSON.stringify(authStore.user)}`)
  console.log(`Iagent ${authStore.isAgent()}`)
  console.log(`custome ${authStore.isCustomer()}`)
  if (!restored || !authStore.user) {
    console.log('TicketsView: No user, redirecting')
    router.push('/login')
    return
  }
  restoring.value = false
})

watch(
  () => result.value,
  (newResult) => {
    if (newResult?.tickets) {
      console.log('Tickets updated:', newResult.tickets)
      tickets.value = newResult.tickets
    }
  },
  { immediate: true },
)

const fetchTickets = () => {
  console.log('Refetching tickets')
  refetch()
}
</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">{{ authStore.isAgent() ? 'All Tickets' : 'My Tickets' }}</h2>

    <ticket-form v-if="authStore.isCustomer() || authStore.isAgent()" @ticket-created="fetchTickets" />
    <button v-if="authStore.isAgent()" class="mb-4 bg-green-600 text-white p-2 rounded">
      Export Closed Tickets
    </button>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error.message }}</div>
    <ticket-list v-else :tickets="tickets" />
  </div>
</template>
