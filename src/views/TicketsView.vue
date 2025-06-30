<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import TicketList from '../components/TicketList.vue'
import TicketForm from '../components/TicketForm.vue'

const authStore = useAuthStore()
console.log(`Authstore user${authStore}`)
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
    }
  }
`)

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

const closedTickets = computed(() => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return tickets.value.filter(ticket =>
    ticket.status === 'closed' &&
    new Date(ticket.createdAt) >= thirtyDaysAgo
  );
});

const exportToCSV = () => {
  console.log('Exporting closed tickets to CSV');
  if (!closedTickets.value.length) {
    console.log('No closed tickets to export');
    return;
  }

  console.log('Exporting closed tickets to CSV');
  const headers = ['ID', 'Title', 'Description', 'Status', 'Created At', 'User Email'];
  const rows = closedTickets.value.map(ticket => [
    ticket.id,
    `"${ticket.title.replace(/"/g, '""')}"`,
    `"${ticket.description.replace(/"/g, '""')}"`,
    ticket.status,
    ticket.createdAt,
    ticket.user.email,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `closed_tickets_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log('CSV exported');
};
</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">{{ authStore.isAgent() ? 'All Tickets' : 'My Tickets' }}</h2>

    <ticket-form v-if="authStore.isCustomer() || authStore.isAgent()" @ticket-created="fetchTickets" />
    <button v-if="authStore.isAgent()" @click="exportToCSV"
          class="bg-green-500 text-white p-2 rounded"
          >
      Export Closed Tickets
    </button>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error.message }}</div>
    <ticket-list v-else :tickets="tickets" />
  </div>
</template>
