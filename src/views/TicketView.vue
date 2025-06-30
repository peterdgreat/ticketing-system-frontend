<script setup>
import { watch, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const authStore = useAuthStore()
const route = useRoute()
const ticket = ref(null)
const newStatus = ref('')
const comments = ref([])
const newComment = ref('')
const attachments = ref([])
const selectedFile = ref(null);
const fileInput = ref(null);
const loadingAttachments = ref(true)
const attachmentError = ref(null)
const { result, loading, error, refetch } = useQuery(
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
        comments {
          id
          content
          user {
            id
            email
          }
        }
      }
    }
  `,
  () => ({
    id: route.params.id,
  }),
)

const { mutate: updateTicketMutation } = useMutation(gql`
  mutation UpdateTicket($id: ID!, $status: String!) {
    updateTicket(id: $id, status: $status) {
      id
      title
      description
      status
    }
  }
`)

const { mutate: addCommentMutation } = useMutation(gql`
  mutation AddComment($ticketId: ID!, $content: String!) {
    addComment(ticketId: $ticketId, content: $content) {
      id
      content
      user {
        id
        email
      }
    }
  }
`)

const {mutate: uploadAttachmentMutation} = useMutation(gql `
mutation UploadAttachment($ticketId: ID!, $file: Upload!){
  uploadAttachment(ticketId: $ticketId, file: $file){
    id
    fileName
    fileUrl
    createdAt
  }
}

`)
const {result: attachmentsResult, loading: attachmentsLoading, error: attachmentsError, refetch: attachmentsRefetch} = useQuery(
  gql`
  query attachments($ticketId: ID!){
    attachments(ticketId: $ticketId){
      id
      fileName
      fileUrl
      createdAt
    }

  }`,
  () => ({
    ticketId: route.params.id,
  }),
)
const addComment = async () => {
  try {
    await addCommentMutation({
      ticketId: ticket.value.id,
      content: newComment.value,
    })
    refetch()
    newComment.value = ''
  } catch (e) {
    console.error(e)
  }
}
const updateStatus = async () => {
  if (newStatus.value) {
    try {
      await updateTicketMutation({
        id: ticket.value.id,
        status: newStatus.value,
      })
    } catch (e) {
      console.error(e)
    }
  }
}

const onFileSelected = (event) => {
  selectedFile.value = event.target.files[0];
}

const uploadAttachment = async () => {
  if (selectedFile.value){
    try{
      await uploadAttachmentMutation({
        ticketId: ticket.value.id,
        file: selectedFile.value,
      })
      attachmentsRefetch();
    }
    catch(e){
      attachmentsError.value = e
    console.error(e)
  }
  }
}


watch(
  () => result.value,
  (newResult) => {
    if (newResult.ticket) {
      ticket.value = newResult.ticket
      newStatus.value = newResult.ticket.status
      if (newResult.ticket.comments) {
        comments.value = newResult.ticket.comments
      }
    }
    console.log(ticket)
  },
)

watch(
  ()=>attachmentsResult.value,
  (newResult) => {
    if (newResult.attachments){
      attachments.value = newResult.attachments
    }
    loadingAttachments.value = attachmentsLoading.value;
    attachmentError.value = attachmentsError.value;
  }
)

onMounted(async () => {
  await authStore.restoreUser()
})


</script>

<template>
  <div v-if="loading">Loading</div>
  <div v-else-if="error">
    {{ error.message }}
  </div>
  <div class="container mx-auto p-4" v-else>
    <h2 class="text-2xl font-bold mb-4">Ticket #{{ ticket.id }}</h2>
    <div class="bg-gray-100 p-4 rounded">
      <p><strong>Title:</strong> {{ ticket.title }}</p>
      <p><strong>Description:</strong> {{ ticket.description }}</p>
      <p><strong>Status:</strong> {{ ticket.status }}</p>
      <p v-if="authStore.isAgent()"><strong>Created by:</strong> {{ ticket.user.email }}</p>
    </div>
    <div v-if="authStore.isAgent()">
      <label for="status" class="mr-2">Update Status:</label>
      <select v-model="newStatus" id="status" class="border p-2 rounded" @change="updateStatus">
        <option value="open">Open</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
    </div>

    <div>
      <h2>Attachments</h2>
      <form @submit.prevent="uploadAttachment" class="mb-4">
        <input
          type="file"
          ref="fileInput"
          @change="onFileSelected"
          class="border p-2 rounded"
          accept="image/*,application/pdf"
        />
        <button
          type="submit"
          class="mt-2 bg-blue-500 text-white p-2 rounded"
          :disabled="!selectedFile"
        >
          Upload Attachment
        </button>
      </form>
      <div v-if="attachments.length > 0">
        <h3 class="text-lg font-bold mb-2">Uploaded Attachments</h3>
        <ul>
          <li v-for="attachment in attachments" :key="attachment.id">
            <a :href="attachment.fileUrl" target="_blank">{{ attachment.fileName }} ({{ attachment.createdAt }})</a>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="comments.length > 0" class="mt-4">
      <h3 class="text-lg font-bold mb-2">Comments</h3>
      <div v-for="comment in comments" :key="comment.id" class="bg-gray-100 p-4 rounded mb-2">
        <p><strong>User:</strong> {{ comment.user.email }}</p>
        <p>{{ comment.content }}</p>
      </div>
    </div>
    <form @submit.prevent="addComment" class="mb-4">
      <textarea
        v-model="newComment"
        placeholder="Add a comment..."
        class="border p-2 w-full rounded"
        required
      ></textarea>
      <button type="submit" class="mt-2 bg-blue-500 text-white p-2 rounded">Post Comment</button>
    </form>
  </div>
</template>
