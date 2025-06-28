import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') ||null,
  }),
  actions: {
    setUser(user,token){
      this.user = {id: user.id, email: user.email, role: user.role}
      this.token = token
      localStorage.setItem('token', token)
    },
    signin(user,token){
      this.user = user
      this.token= token
      localStorage.setItem('token', token)

    }
  }


})
