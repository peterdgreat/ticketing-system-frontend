<script setup>
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { useRouter } from 'vue-router';
import gql from 'graphql-tag';

const title = ref('');
const description = ref('');
const error = ref(null);
const attachmentFiles = ref([]);
const fileInput = ref(null);
const previews = ref([]);
const nonImageFiles = ref([]);
const generateFileId = () => Math.random().toString(36).substr(2, 9);
const router = useRouter();
const { mutate: createTicketMutation } = useMutation(gql`
  mutation CreateTicket($title: String!, $description: String!, $attachmentFiles: [Upload!]) {
    createTicket(title: $title, description: $description, attachmentFiles: $attachmentFiles) {
      id
      title
      description
      status
      user { id }
      attachments {
        id
        fileName
        fileUrl
        fileType
        fileSize
      }
    }
  }
`);

const createTicket = async () => {
  try {
    await createTicketMutation({
      title: title.value,
      description: description.value || null,
      attachmentFiles: attachmentFiles.value,
    });
    title.value = '';
    description.value = '';
    error.value = null;
    previews.value.forEach(preview => URL.revokeObjectURL(preview.url));
    previews.value = [];
    nonImageFiles.value = [];
    attachmentFiles.value = [];
    error.value = null;
    if (fileInput.value) fileInput.value.value = '';
    router.push('/tickets');

  } catch (err) {
    error.value = err.message.replace('GraphQL error: ', '');
  }
};

const handleFiles = (e) => {
  const newFiles = Array.from(e.target.files).filter(file => file instanceof File);
  newFiles.forEach((file) => {
    const fileId = generateFileId();
    attachmentFiles.value.push(file);
    if (file.type.startsWith('image/')) {
      previews.value.push({
        id: fileId,
        url: URL.createObjectURL(file),
        name: file.name,
      });
    } else {
      nonImageFiles.value.push({
        id: fileId,
        name: file.name,
      });
    }
  });
  if (fileInput.value) fileInput.value.value = '';
};

const removeFile = (index) => {
  const removedFile = previews.value.splice(index, 1)[0];
  URL.revokeObjectURL(removedFile.url);
  attachmentFiles.value = [
    ...previews.value.map(p => attachmentFiles.value.find(f => f.name === p.name)),
    ...nonImageFiles.value.map(n => attachmentFiles.value.find(f => f.name === n.name)),
  ].filter(Boolean);
};

const removeNonImageFile = (index) => {
  nonImageFiles.value.splice(index, 1);
  attachmentFiles.value = [
    ...previews.value.map(p => attachmentFiles.value.find(f => f.name === p.name)),
    ...nonImageFiles.value.map(n => attachmentFiles.value.find(f => f.name === n.name)),
  ].filter(Boolean);
};

</script>
<template>
  <div class="bg-white p-6 rounded shadow mb-6">
<router-link to="/tickets">Back</router-link>
    <h3 class="text-xl font-bold mb-4 text-center ">New Ticket</h3>
    <form @submit.prevent="createTicket" class="space-y-4">
      <div class="mb-4">
        <label class="block text-lg font-medium">Subject</label>
        <input
          v-model="title"
          type="text"
          placeholder="Subject"
          class="w-full px-3 py-2.5 text-lg rounded-lg border focus:outline focus:outline-2 focus:outline-offset-2 bg-[#ffffff] text-[#444444] focus:outline-[#aaaaaa] border-[#cccccc]"
          required
        />
      </div>
      <div class="mb-4">
        <label class="block text-lg font-medium">Describe your issue</label>
        <textarea
          v-model="description"
          placeholder="Please provide as much details as possible"
          class="w-full px-3 py-2.5 text-lg rounded-lg border focus:outline focus:outline-2 focus:outline-offset-2 bg-[#ffffff] text-[#444444] focus:outline-[#aaaaaa] border-[#cccccc]"
        ></textarea>
      </div>
      <div>
        <label for="attachments" class="block text-lg font-medium mb-2">Upload File</label>
        <div
          class="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-[#cccccc] rounded-lg bg-[#f9f9f9] cursor-pointer hover:bg-[#f0f0f0]"
          @click="fileInput.click()"
        >
          <span class="text-[#444444] text-lg">Add screenshots or files</span>
          <input
            type="file"
            id="attachments"
            ref="fileInput"
            multiple
            accept="image/*,.pdf,.txt,.doc,.docx"
            class="hidden"
            @change="handleFiles"
          />
        </div>

        <div v-if="previews.length || nonImageFiles.length" class="mt-4">
          <p class="text-lg font-medium mb-2">Selected Files:</p>
          <div v-if="previews.length" class="grid grid-cols-2 gap-4 mb-4">
            <div v-for="(preview, index) in previews" :key="index" class="relative">
              <img
                :src="preview.url"
                :alt="preview.name"
                class="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                @click="removeFile(index)"
              >
                &times;
              </button>
            </div>
          </div>
          <ul v-if="nonImageFiles.length" class="list-disc pl-5">
            <li v-for="(file, index) in nonImageFiles" :key="index" class="flex items-center">
              <span class="text-[#444444]">{{ file.name }}</span>
              <button
                type="button"
                class="ml-2 text-red-600"
                @click="removeNonImageFile(index)"
              >
                Remove
              </button>
            </li>
          </ul>
        </div>
      </div>
      <button
        type="submit"
        class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        Submit Ticket
      </button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </form>
  </div>
</template>
