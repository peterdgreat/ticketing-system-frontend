<script setup>
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const title = ref('');
const description = ref('');
const error = ref(null);

const { mutate: createTicketMutation } = useMutation(gql`
  mutation CreateTicket($title: String!, $description: String!) {
    createTicket(title: $title, description: $description) {
      id
      title
      description
      status
      user { id }
    }
  }
`);

const emit = defineEmits(['ticket-created']);
const createTicket = async () => {
  try {
    await createTicketMutation({
      title: title.value,
      description: description.value || null
    });
    title.value = '';
    description.value = '';
    error.value = null;
    emit('ticket-created');
  } catch (err) {
    error.value = err.message.replace('GraphQL error: ', '');
  }
};

</script>
<template>
  <div class="bg-white p-6 rounded shadow mb-6">
    <h3 class="text-xl font-bold mb-4">Create Ticket</h3>
    <form @submit.prevent="createTicket">
      <div class="mb-4">
        <label class="block text-sm font-medium">Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="Title"
          class="w-full p-2 border rounded"
          required
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">Description</label>
        <textarea
          v-model="description"
          placeholder="Description"
          class="w-full p-2 border rounded"
        ></textarea>
      </div>
      <button type="submit" class="bg-blue-600 text-white p-2 rounded">Create Ticket</button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </form>
  </div>
</template>
<style></style>
