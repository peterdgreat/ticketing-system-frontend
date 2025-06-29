<script setup>
import { watch,ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const authStore = useAuthStore();
const route = useRoute();
const ticket = ref(null);
const newStatus = ref('');
const { result, loading, error } = useQuery(
  gql`
    query ticket($id: ID!) {
      ticket(id: $id) {
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
  `,
  () => ({
    id: route.params.id,
  })
);

const {mutate: updateTicketMutation} = useMutation(gql`
  mutation UpdateTicket($id: ID!, $status: String!){
    updateTicket(id: $id, status: $status){
      id
      title
      description
      status
    }
  }
`)

watch(
  ()=>result.value,
  (newResult) =>{
    if(newResult.ticket){
      ticket.value = newResult.ticket
      newStatus.value = newResult.ticket.status
    }
    console.log(ticket)
  }
)

onMounted (async ()=>{
  await authStore.restoreUser()
})

const updateStatus = async()=>{
 if (newStatus.value){
  try {
   await updateTicketMutation({
    id: ticket.value.id,
    status: newStatus.value,
   })
  } catch(e){
    console.error(e)
  }
 }
}
</script>

<template>
  <div v-if="loading">
Loading
  </div>
  <div v-else-if="error">
{{ error.message }}
  </div>
  <div
    class="container mx-auto p-4"
    v-else
  >
  <h2 class="text-2xl font-bold mb-4">Ticket #{{ ticket.id }}</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p><strong>Title:</strong> {{ ticket.title }}</p>
        <p><strong>Description:</strong> {{ ticket.description }}</p>
        <p><strong>Status:</strong> {{ ticket.status }}</p>
        <p v-if="authStore.isAgent()"><strong>Created by:</strong> {{ ticket.user.email }}</p>
      </div>
      <div v-if="authStore.isAgent()">
      <label  for="status" class="mr-2">Update Status:</label>
        <select
          v-model="newStatus"
          id="status"
          class="border p-2 rounded"
          @change="updateStatus"
        >
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
  </div>
</template>
