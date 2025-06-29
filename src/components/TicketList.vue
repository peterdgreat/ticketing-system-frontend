<script setup>
import { useAuthStore } from '../stores/index';

defineProps({
  tickets: {
    type: Array,
    required: true
  }
})
const authStore = useAuthStore();
</script>
<template>
<div class="bg-white p-6 rounded shadow">
    <h3 class="text-lg font-bold mb-4">Ticket List</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">ID</th>
          <th class="p-2 text-left">Title</th>
          <th class="p-2 text-left">Status</th>
          <th class="p-2 text-left">Customer ID</th>
          <th v-if="authStore.isAgent" class="p-2 text-left">Assigned To</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ ticket.id }}</td>
          <td class="p-2">
            <router-link :to="`/tickets/${ticket.id}`" class="text-blue-600 hover:underline">
              {{ ticket.title }}
            </router-link>
          </td>
          <td class="p-2">{{ ticket.status }}</td>
          <td class="p-2">{{ ticket.user.id }}</td>
          <td v-if="authStore.isAgent" class="p-2">{{ 'Unassigned' }}</td>
        </tr>
        <tr v-if="!tickets.length" class="border-b">
          <td colspan="7" class="p-2 text-center">No tickets found</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
