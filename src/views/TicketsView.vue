<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import TicketList from '../components/TicketList.vue'
import { useRouter } from 'vue-router'
const router = useRouter();

const authStore = useAuthStore()
const tickets = ref([])

const { result, loading, error, refetch } = useQuery(gql`
  query tickets {
    tickets {
      id
      title
      description
      status
      createdAt
      user {
        id
        email
      }
      attachments {
        id
        fileName
        fileUrl
      }
    }
  }
`)

watch(
  () => result.value,
  (newResult) => {
    if (newResult?.tickets) {
      tickets.value = newResult.tickets
    }
  },
  { immediate: true },
)

const handleSignOut = () => {
  authStore.signout()
  router.push('/login')
}
const closedTickets = computed(() => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return tickets.value.filter(
    (ticket) => ticket.status === 'closed' && new Date(ticket.createdAt) >= thirtyDaysAgo,
  )
})

const exportToCSV = () => {
  if (!closedTickets.value.length) {
    alert('No closed tickets to export')
    return
  }

  const headers = ['ID', 'Title', 'Description', 'Status', 'Created At', 'User Email']
  const rows = closedTickets.value.map((ticket) => [
    ticket.id,
    `"${ticket.title.replace(/"/g, '""')}"`,
    `"${ticket.description.replace(/"/g, '""')}"`,
    ticket.status,
    ticket.createdAt,
    ticket.user.email,
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `closed_tickets_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(()=>{
  refetch()
})

</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex">
      <button
        @click="exportToCSV"
        class="bg-green-500 text-white p-2 rounded click"
        v-if="authStore.isAgent()"
      >
        Export Closed Tickets
      </button>
      <router-link v-else to="/tickets/new" class="bg-blue-500 text-white p-2 rounded flex f">
        Submit a request
      </router-link>
      <button
        @click="handleSignOut()"
        class="bg-red-500 text-white p-2 rounded ml-auto"
      >
        Logout
      </button>
    </div>
    <h2 class="text-2xl font-bold mb-4 text-center">
      {{ authStore.isAgent() ? 'All Tickets' : 'My Tickets' }}
    </h2>
    <div v-if="loading" class="text-gray-500 flex justify-center"><h2>Loading...</h2></div>
    <div v-else-if="error" class="text-red-500">{{ error.message }}</div>
    <ticket-list v-else :tickets="tickets" />
  </div>
</template>
