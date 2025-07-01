<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const email = ref('')
const error = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

const { mutate: loginMutation } = useMutation(gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`)
const login = async () => {
  loading.value = true
  try {
    const { data } = await loginMutation({
      email: email.value,
      password: password.value,
    })
    authStore.setUser(data.login.user, data.login.token)
    router.push('/')
  } catch (err) {
    loading.value = false
    error.value = err.message.replace('GraphQL error: ', '')

  }
}
</script>
<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Login</h2>
    <form @submit.prevent="login">
      <div class="mb-4">
        <label class="block text-sm font-medium">Email</label>
        <input
          v-model="email"
          type="email"
          class="w-full p-2 border rounded"
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">Password</label>
        <input
          v-model="password"
          type="password"
          class="w-full p-2 border rounded"
          required
          minlength="6"
        />
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
      <p v-if="loading" class="text-blue-500 mt-2">Loading...</p>
      <p class="mt-4">
        Don't have an account? <router-link to="/signup" class="text-blue-600">Sign Up</router-link>
      </p>
    </form>
  </div>
</template>

<style></style>
