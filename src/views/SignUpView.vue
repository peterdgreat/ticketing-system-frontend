<script setup>
import {ref} from 'vue'
import {useAuthStore} from '../stores'
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const email = ref('');
const error = ref('');
const password = ref('');
const role = ref('customer');
const authStore = useAuthStore();

const { mutate: signUpMutation } = useMutation(gql`
  mutation SignUp($email: String!, $password: String!, $role: String!) {
    signUp(email: $email, password: $password, role: $role) {
      token
      user {
        id
        email
        role
      }
    }
  }
`);

const signUp = async () => {
  try {
    const { data } = await signUpMutation({
      email: email.value,
      password: password.value,
      role: role.value,
    });
    authStore.setUser(data.signUp.user, data.signUp.token);
    // router.push('/tickets');
  } catch (err) {
    error.value = err.message.replace('GraphQL error: ', '');
  }
};
</script>
<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Sign Up</h2>
    <form @submit.prevent="signUp">
      <div class="mb-4">
        <label class="block text-sm font-medium">Email</label>
        <input v-model="email" type="email" required placeholder="Email"
        class="w-full p-2 border rounded" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">Password</label>
        <input
         type="password" v-model="password" required placeholder="Password"
         class="w-full p-2 border rounded" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium">Role</label>
        <select v-model="role">
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded">Submit</button>
    </form>
  </div>
</template>
<style></style>
