<script setup>
import { useAuthStore } from '../stores/auth'

defineProps({
  tickets: {
    type: Array,
    required: true,
  },
})
const authStore = useAuthStore()
</script>
<template>
 <div class="container mx-auto p-4 sm:p-6">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm tracking-wide">
              <th class="p-3 sm:p-4 text-left font-semibold">Title</th>
              <th class="p-3 sm:p-4 text-left font-semibold">Status</th>
              <th v-if="authStore.isAgent()" class="p-3 sm:p-4 text-left font-semibold">Customer ID</th>
              <th  v-if="authStore.isAgent()"  class="p-3 sm:p-4 text-left font-semibold">Customer Mail</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in tickets"
              :key="ticket.id"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
            >
              <td class="p-3 sm:p-4">
                <router-link
                  :to="`/tickets/${ticket.id}`"
                  class="text-blue-600 hover:underline font-medium"
                >
                  {{ ticket.title }}
                </router-link>
              </td>
              <td class="p-3 sm:p-4">
                <span
                  :class="{
                    'inline-block px-2 py-1 rounded-full text-xs sm:text-sm font-medium': true,
                    'bg-green-100 text-green-800': ticket.status === 'open',
                    'bg-yellow-100 text-yellow-800': ticket.status === 'pending',
                    'bg-red-100 text-red-800': ticket.status === 'closed',
                  }"
                >
                  {{ ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) }}
                </span>
              </td>
              <td v-if="authStore.isAgent()"  class="p-3 sm:p-4 text-gray-600">{{ ticket.user.id }}</td>
              <td v-if="authStore.isAgent()"  class="p-3 sm:p-4 text-gray-600">{{ ticket.user.email }}</td>
            </tr>
            <tr v-if="!tickets.length" class="border-b border-gray-200">
              <td colspan="4" class="p-3 sm:p-4 text-center text-gray-500">
                No tickets found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</template>
