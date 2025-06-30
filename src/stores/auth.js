import { defineStore } from 'pinia'
import { useApolloClient } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async restoreUser() {
      if (!this.token) {
        return false
      }
      if (this.user) {
        return true
      }
      try {
        const { client } = useApolloClient()
        const { data } = await client.query({
          query: gql`
            query {
              user {
                id
                email
                role
              }
            }
          `,
          context: {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        })
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch {
        this.signout()
        return false
      }
    },
    setUser(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('token', token)
    },
    signin(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('token', token)
    },
    signout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    isAgent() {
      return this.user?.role === 'agent'
    },
    isCustomer() {
      return this.user?.role === 'customer'
    },
  },
})
