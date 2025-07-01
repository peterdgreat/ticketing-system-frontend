<script setup>
import { watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'


dayjs.extend(relativeTime)

const authStore = useAuthStore()
const route = useRoute()
const ticket = ref(null)
const newStatus = ref('')
const comments = ref([])
const newComment = ref('')
const attachments = ref([])
const selectedAttachment = ref(null)
const createCommentError = ref(null)
const API_URL = `${import.meta.env.VITE_API_URL}`;



const { result, loading, error, refetch } = useQuery(
  gql`
    query ticket($id: ID!) {
      ticket(id: $id) {
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
          fileType
          fileSize
          createdAt
        }
      }
    }
  `,
  () => ({
    id: route.params.id,
  }),
)
const {
  result: commentResult,
  loading: commentLoading,
  error: commentError,
  refetch: commentRefetch,
} = useQuery(
  gql`
    query comments($ticketId: ID!) {
      comments(ticketId: $ticketId) {
        id
        content
        createdAt
        user {
          email
        }
      }
    }
  `,
  () => ({
    ticketId: route.params.id,
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

const addComment = async () => {
  try {
    await addCommentMutation({
      ticketId: ticket.value.id,
      content: newComment.value,
    })
    commentRefetch()
    newComment.value = ''
  } catch (e) {
    createCommentError.value = e.message.replace('GraphQL error: ', '');
  }
}
const updateStatus = async () => {
  if (newStatus.value) {
    try {
      await updateTicketMutation({
        id: ticket.value.id,
        status: newStatus.value,
      })
      refetch()
    } catch (e) {
      console.error(e)
    }
  }
}

const openAttachment = (attachment) => {
  selectedAttachment.value = attachment
}

const getAttachmentUrl = (fileUrl) => {
  return fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`
}



watch(
  () => result.value,
  (newResult) => {
    if (newResult.ticket) {
      ticket.value = newResult.ticket
      newStatus.value = newResult.ticket.status
      attachments.value = newResult.ticket.attachments
    }
  },
)

watch(
  () => commentResult.value,
  (newResult) => {
    if (newResult.comments) {
      comments.value = newResult.comments
    }
  },
)


</script>

<template>
  <div v-if="loading" class="container mx-auto p-4">
    <div class="text-center text-gray-500">Loading...</div>
  </div>
  <div v-else-if="error" class="container mx-auto p-4">
    <div class="text-center text-red-500">{{ error.message }}</div>
  </div>
  <div v-else class="container mx-auto p-4 sm:p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800">
          Ticket #{{ ticket.id }}: {{ ticket.title }}
        </h2>
        <div class="flex justify-between w-80">
          <span
            :class="{
              'inline-block px-3 py-1 rounded-full text-sm font-medium': true,
              'bg-green-100 text-green-800': ticket.status === 'open',
              'bg-yellow-100 text-yellow-800': ticket.status === 'pending',
              'bg-red-100 text-red-800': ticket.status === 'closed' || ticket.status === 'resolved',
            }"
          >
            {{ ticket.status.toUpperCase() }}
          </span>
          <router-link
            to="/tickets"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            {{ authStore.isAgent() ? 'All Tickets' : 'My Tickets' }}
          </router-link>
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-1">
        Created {{ dayjs(ticket.createdAt).fromNow() }}
        <span v-if="authStore.isAgent()"> by {{ ticket.user.email }}</span>
      </p>
    </div>

    <!-- Main Content and Sidebar -->
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1">
        <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Description</h3>
          <p class="text-gray-600">{{ ticket.description || 'No description provided' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Comments</h3>
          <div v-if="commentLoading" class="text-gray-500">Loading comments...</div>
          <div v-else-if="commentError" class="text-red-500">{{ commentError.message }}</div>
          <div v-else-if="comments.length === 0" class="text-gray-500">No comments yet</div>
          <div v-else class="space-y-4">
            <div
              v-for="comment in comments"
              :key="comment.id"
              :class="{
                'p-4 rounded-lg': true,
                'bg-blue-50 ml-8': comment.user.email === authStore.user?.email,
                'bg-gray-100 mr-8': comment.user.email !== authStore.user?.email,
              }"
            >
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-800">{{ comment.user.email }}</p>
                <p class="text-xs text-gray-500">{{ dayjs(comment.createdAt).fromNow() }}</p>
              </div>
              <p class="text-gray-600 mt-1">{{ comment.content }}</p>
            </div>
          </div>

          <form @submit.prevent="addComment" class="mt-6">
            <textarea
              v-model="newComment"
              placeholder="Leave a comment..."
              class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            ></textarea>
            <button
              type="submit"
              class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Comment
            </button>
            <div v-if="createCommentError" class="text-red-500 mt-2">
              {{ createCommentError }}
            </div>
          </form>
        </div>

        <div v-if="authStore.isAgent()" class="mt-6">
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <select
            v-model="newStatus"
            id="status"
            class="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="updateStatus"
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div class="lg:w-80">
        <div class="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
          <div v-if="attachments.length === 0" class="text-gray-500 text-sm">No attachments</div>
          <ul v-else class="space-y-3">
            <li v-for="attachment in attachments" :key="attachment.id">
              <div
                class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                @click="openAttachment(attachment)"
              >
                <img
                  v-if="attachment.fileType.startsWith('image/')"
                  :src="getAttachmentUrl(attachment.fileUrl)"
                  :alt="attachment.fileName"
                  class="w-12 h-12 object-cover rounded"
                />
                <svg
                  v-else
                  class="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ attachment.fileName }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ dayjs(attachment.createdAt).fromNow() }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      v-if="selectedAttachment"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="selectedAttachment = null"
    >
      <div class="bg-white rounded-lg p-4 max-w-3xl max-h-[80vh] overflow-auto" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ selectedAttachment.fileName }}
          </h3>
          <button class="text-gray-500 hover:text-gray-700" @click="selectedAttachment = null">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <img
          v-if="selectedAttachment.fileType.startsWith('image/')"
          :src="getAttachmentUrl(selectedAttachment.fileUrl)"
          :alt="selectedAttachment.fileName"
          class="max-w-full max-h-[60vh] object-contain"
        />
        <div v-else class="text-center">
          <p class="text-gray-600 mb-4">
            {{ selectedAttachment.fileName }} ({{ selectedAttachment.fileType }})
          </p>
          <a
            :href="getAttachmentUrl(selectedAttachment.fileUrl)"
            target="_blank"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
